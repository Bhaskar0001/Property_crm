import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ValuationContextType {
  isValuationOpen: boolean;
  openValuationModal: (prefill?: Partial<ValuationPrefill>) => void;
  closeValuationModal: () => void;
  valuationPrefill: Partial<ValuationPrefill>;
}

export interface ValuationPrefill {
  address?: string;
  city?: string;
  propertyType?: string;
  intent?: 'selling' | 'letting' | 'remortgage' | 'probate' | 'other';
}

const ValuationContext = createContext<ValuationContextType | undefined>(undefined);

export const ValuationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isValuationOpen, setIsValuationOpen] = useState(false);
  const [valuationPrefill, setValuationPrefill] = useState<Partial<ValuationPrefill>>({});

  const openValuationModal = (prefill?: Partial<ValuationPrefill>) => {
    if (prefill) {
      setValuationPrefill(prefill);
    } else {
      setValuationPrefill({});
    }
    setIsValuationOpen(true);
  };

  const closeValuationModal = () => {
    setIsValuationOpen(false);
    setValuationPrefill({});
  };

  return (
    <ValuationContext.Provider
      value={{
        isValuationOpen,
        openValuationModal,
        closeValuationModal,
        valuationPrefill,
      }}
    >
      {children}
    </ValuationContext.Provider>
  );
};

export const useValuation = () => {
  const context = useContext(ValuationContext);
  if (!context) {
    throw new Error('useValuation must be used within a ValuationProvider');
  }
  return context;
};
