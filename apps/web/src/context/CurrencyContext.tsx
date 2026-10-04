import React, { createContext, useContext, useState, useEffect } from 'react';
import { WORLD_CURRENCIES } from '@repo/shared';
import { publicApi } from '../lib/api';

export type CurrencyCode = string;

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  rateFromEUR: number; // Conversion rate relative to EUR base
}

// Populate baseline real world rates
export const CURRENCIES: Record<string, CurrencyInfo> = WORLD_CURRENCIES.reduce((acc, curr) => {
  acc[curr.code] = {
    code: curr.code,
    symbol: curr.symbol,
    name: curr.name,
    rateFromEUR: curr.rateFromEUR,
  };
  return acc;
}, {} as Record<string, CurrencyInfo>);

interface CurrencyContextType {
  currentCurrency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (amountInEUR?: number) => string;
  currencyInfo: CurrencyInfo;
  availableCurrencies: CurrencyInfo[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = 'realestate_public_currency';

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currencyMap, setCurrencyMap] = useState<Record<string, CurrencyInfo>>(CURRENCIES);
  const [currentCurrency, setCurrentCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && CURRENCIES[saved] ? saved : 'EUR';
  });

  // Fetch custom backend currencies and live Forex exchange rates
  useEffect(() => {
    publicApi.get('/currencies')
      .then((res) => {
        const list = res.data?.data || res.data;
        if (Array.isArray(list) && list.length > 0) {
          setCurrencyMap((prev) => {
            const updated = { ...prev };
            list.forEach((item: any) => {
              if (item.code) {
                const codeUpper = item.code.toUpperCase();
                updated[codeUpper] = {
                  code: codeUpper,
                  symbol: item.symbol || item.code,
                  name: item.name || item.code,
                  rateFromEUR: Number(item.exchangeRate) || prev[codeUpper]?.rateFromEUR || 1.0,
                };
              }
            });
            return updated;
          });
        }
      })
      .catch(() => {
        // Fall back gracefully
      });

    // Also sync live Forex market rates directly
    publicApi.get('/exchange-rates?base=EUR')
      .then((res) => {
        const rates = res.data?.data?.rates || res.data?.rates;
        if (rates && typeof rates === 'object') {
          setCurrencyMap((prev) => {
            const next = { ...prev };
            Object.entries(rates).forEach(([code, rate]) => {
              const codeUpper = code.toUpperCase();
              if (next[codeUpper] && typeof rate === 'number') {
                next[codeUpper] = {
                  ...next[codeUpper],
                  rateFromEUR: rate,
                };
              }
            });
            return next;
          });
        }
      })
      .catch(() => {});
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    if (currencyMap[code]) {
      setCurrentCurrencyState(code);
      localStorage.setItem(STORAGE_KEY, code);
    }
  };

  const currencyInfo = currencyMap[currentCurrency] || CURRENCIES['EUR'] || {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    rateFromEUR: 1.0,
  };

  const formatPrice = (amountInEUR?: number): string => {
    if (amountInEUR === undefined || amountInEUR === null || isNaN(amountInEUR)) {
      return 'Price on Request';
    }

    const converted = Math.round(amountInEUR * (currencyInfo.rateFromEUR || 1.0));
    return `${currencyInfo.symbol} ${converted.toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currentCurrency,
        setCurrency,
        formatPrice,
        currencyInfo,
        availableCurrencies: Object.values(currencyMap),
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
