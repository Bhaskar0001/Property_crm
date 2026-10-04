import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCountries } from '../hooks/useAdminConfig';

export interface Country {
  _id: string;
  name: string;
  isoCode: string;
  currency?: any;
  phoneCode?: string;
  isActive?: boolean;
}

interface CountryFilterContextType {
  selectedCountryId: string; // 'all' or specific MongoDB _id
  setSelectedCountryId: (id: string) => void;
  selectedCountry: Country | null;
  countries: Country[];
  isLoading: boolean;
}

const CountryFilterContext = createContext<CountryFilterContextType | undefined>(undefined);

const STORAGE_KEY = 'realestate_admin_selected_country';

export const CountryFilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: countriesData, isLoading } = useCountries();
  const countries: Country[] = Array.isArray(countriesData) ? countriesData : [];

  const [selectedCountryId, setSelectedCountryIdState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) || 'all';
  });

  const setSelectedCountryId = (id: string) => {
    setSelectedCountryIdState(id);
    if (id === 'all') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, id);
    }
  };

  // If saved ID is not 'all' and countries list loaded, ensure it still exists
  useEffect(() => {
    if (!isLoading && countries.length > 0 && selectedCountryId !== 'all') {
      const exists = countries.some((c) => c._id === selectedCountryId);
      if (!exists) {
        setSelectedCountryId('all');
      }
    }
  }, [isLoading, countries, selectedCountryId]);

  const selectedCountry =
    selectedCountryId === 'all'
      ? null
      : countries.find((c) => c._id === selectedCountryId) || null;

  return (
    <CountryFilterContext.Provider
      value={{
        selectedCountryId,
        setSelectedCountryId,
        selectedCountry,
        countries,
        isLoading,
      }}
    >
      {children}
    </CountryFilterContext.Provider>
  );
};

export const useCountryFilter = (): CountryFilterContextType => {
  const context = useContext(CountryFilterContext);
  if (!context) {
    throw new Error('useCountryFilter must be used within a CountryFilterProvider');
  }
  return context;
};
