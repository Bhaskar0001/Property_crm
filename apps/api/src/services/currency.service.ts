import axios from 'axios';

const CACHE_KEY = 'currency_rates';

export class CurrencyService {
  private memoryCache: { [key: string]: any } = {};

  async getExchangeRates(baseCurrency: string = 'EUR') {
    if (this.memoryCache[`${CACHE_KEY}_${baseCurrency}`]) {
        return this.memoryCache[`${CACHE_KEY}_${baseCurrency}`];
    }
    
    try {
      const apiUrl = process.env.EXCHANGE_RATE_API_URL || `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`;
      const response = await axios.get(apiUrl);
      const rates = response.data.rates;
      this.memoryCache[`${CACHE_KEY}_${baseCurrency}`] = rates;
      return rates;
    } catch (error) {
      console.error('Failed to fetch exchange rates', error);
      return {
        EUR: 1,
        USD: 1.08,
        GBP: 0.85
      };
    }
  }

  async convertPrice(amount: number, from: string, to: string) {
    if (from === to) return amount;
    
    const rates = await this.getExchangeRates(from);
    const rate = rates[to];
    
    if (!rate) {
      throw new Error(`Exchange rate for ${to} not found`);
    }
    
    return amount * rate;
  }
}

export const currencyService = new CurrencyService();
