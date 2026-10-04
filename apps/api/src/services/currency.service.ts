import axios from 'axios';
import { getRedis, isRedisAvailable } from '../config/redis';
import { CurrencyModel } from '../models/Currency';
import { logger } from '../utils/logger';
import { config } from '../config';

const REDIS_KEY_PREFIX = 'currency:rates:';
const CACHE_TTL_SECONDS = 3600; // 1 hour

export interface CurrencyRatesResponse {
  base: string;
  date: string;
  rates: Record<string, number>;
  updatedAt: string;
}

export class CurrencyService {
  private memoryCache: Map<string, { rates: Record<string, number>; timestamp: number }> = new Map();

  /**
   * Hits the live real-world exchange rate API, updates all Currency documents in MongoDB
   */
  public async syncLiveRates(): Promise<{
    base: string;
    updatedCount: number;
    rates: Record<string, number>;
    updatedAt: string;
  }> {
    const defaultCurr = await CurrencyModel.findOne({ isDefault: true }).lean();
    const base = (defaultCurr?.code || 'EUR').toUpperCase();

    const rates = await this.refreshRates(base);
    let updatedCount = 0;

    // Get all currencies in database
    const dbCurrencies = await CurrencyModel.find();
    for (const curr of dbCurrencies) {
      const codeUpper = curr.code.toUpperCase();
      if (codeUpper === base) {
        curr.exchangeRate = 1.0;
        await curr.save();
        updatedCount++;
      } else if (rates[codeUpper]) {
        curr.exchangeRate = rates[codeUpper];
        await curr.save();
        updatedCount++;
      }
    }

    logger.info({ base, updatedCount }, 'Synchronized live real-world exchange rates into MongoDB');

    return {
      base,
      updatedCount,
      rates,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Refreshes rates from upstream real-world API, stores in Redis & memory
   */
  public async refreshRates(baseCurrency: string = 'EUR'): Promise<Record<string, number>> {
    const base = baseCurrency.toUpperCase();
    const apiUrl = (config.exchangeRate.apiUrl || 'https://api.exchangerate-api.com/v4').replace(/\/+$/, '');
    const apiKey = config.exchangeRate.apiKey;
    const primaryUrl = apiKey
      ? `${apiUrl}/${apiKey}/latest/${base}`
      : `${apiUrl}/latest/${base}`;
    const fallbackUrl = `https://open.er-api.com/v6/latest/${base}`;

    let rates: Record<string, number> | null = null;

    try {
      const response = await axios.get(primaryUrl, { timeout: 8000 });
      rates = response.data?.rates;
    } catch (primaryErr: any) {
      logger.warn({ err: primaryErr.message }, 'Primary exchange rate API failed, trying fallback API');
      try {
        const fallbackRes = await axios.get(fallbackUrl, { timeout: 8000 });
        rates = fallbackRes.data?.rates;
      } catch (fallbackErr: any) {
        logger.error({ err: fallbackErr.message }, 'Both real-world exchange rate APIs failed');
      }
    }

    if (!rates || typeof rates !== 'object') {
      const existing = await this.getCachedRates(base);
      if (existing) {
        logger.warn({ base }, 'Falling back to existing cached currency rates');
        return existing;
      }
      throw new Error(`Unable to fetch real-world exchange rates for base ${base}`);
    }

    // Ensure base currency has 1.0
    rates[base] = 1.0;

    // Update memory cache
    this.memoryCache.set(base, { rates, timestamp: Date.now() });

    // Update Redis cache if available
    const redis = getRedis();
    if (redis && isRedisAvailable()) {
      try {
        const cacheData = JSON.stringify({
          base,
          rates,
          updatedAt: new Date().toISOString(),
        });
        await redis.setex(`${REDIS_KEY_PREFIX}${base}`, CACHE_TTL_SECONDS, cacheData);
      } catch (redisErr) {
        logger.warn({ err: redisErr }, 'Failed to cache exchange rates in Redis');
      }
    }

    logger.info({ base, rateCount: Object.keys(rates).length }, 'Successfully fetched real-world exchange rates');
    return rates;
  }

  /**
   * Retrieves exchange rates, querying Redis -> Memory cache -> upstream refresh
   */
  public async getExchangeRates(baseCurrency: string = 'EUR'): Promise<Record<string, number>> {
    const base = baseCurrency.toUpperCase();

    // 1. Try Redis
    const cached = await this.getCachedRates(base);
    if (cached) {
      return cached;
    }

    // 2. Fetch fresh rates
    return this.refreshRates(base);
  }

  /**
   * Retrieve cached rates from Redis or Memory
   */
  private async getCachedRates(base: string): Promise<Record<string, number> | null> {
    const redis = getRedis();
    if (redis && isRedisAvailable()) {
      try {
        const cachedRaw = await redis.get(`${REDIS_KEY_PREFIX}${base}`);
        if (cachedRaw) {
          const parsed = JSON.parse(cachedRaw);
          if (parsed?.rates) {
            // Also keep memory cache warm
            this.memoryCache.set(base, { rates: parsed.rates, timestamp: Date.now() });
            return parsed.rates;
          }
        }
      } catch (err) {
        logger.warn({ err }, 'Redis get currency rates error');
      }
    }

    // Check memory cache with TTL (1 hour)
    const mem = this.memoryCache.get(base);
    if (mem && Date.now() - mem.timestamp < CACHE_TTL_SECONDS * 1000) {
      return mem.rates;
    }

    return null;
  }

  /**
   * Convert an amount between two currencies
   */
  public async convertPrice(amount: number, from: string, to: string): Promise<number> {
    const fromUpper = from.toUpperCase();
    const toUpper = to.toUpperCase();

    if (fromUpper === toUpper) return amount;

    const rates = await this.getExchangeRates(fromUpper);
    const rate = rates[toUpper];

    if (!rate) {
      throw new Error(`Exchange rate from ${fromUpper} to ${toUpper} not found in active rates`);
    }

    return Math.round(amount * rate * 100) / 100;
  }
}

export const currencyService = new CurrencyService();
