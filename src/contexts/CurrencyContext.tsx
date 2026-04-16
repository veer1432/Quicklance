import React, { createContext, useContext, useMemo } from 'react';
import { useFirebase } from './FirebaseContext';

interface Currency {
  code: string;
  symbol: string;
  rate: number; // Rate relative to USD (1 USD = X Currency)
}

export const SUPPORTED_CURRENCIES: Record<string, Currency> = {
  INR: { code: 'INR', symbol: '₹', rate: 1 }, // Treat base prices as INR
};

export const COUNTRIES = [
  { name: 'India', code: 'IN', currency: 'INR' },
];

interface CurrencyContextType {
  currency: Currency;
  formatPrice: (amount: number) => string;
  convertPrice: (amount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currency = SUPPORTED_CURRENCIES.INR;

  const convertPrice = (amount: number) => {
    return amount; // No conversion needed as base is INR
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <CurrencyContext.Provider value={{ currency, formatPrice, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
