import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { customerApi } from '../lib/customerApi';
import { CustomerUser } from '../types/customer';

interface CustomerAuthContextType {
  customer: CustomerUser | null;
  token: string | null;
  isLoading: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  sendOtp: (email: string, name?: string) => Promise<{ success: boolean; message: string }>;
  verifyOtp: (email: string, otp: string, name?: string, phone?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('customerToken'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  const fetchProfile = async () => {
    try {
      const response = await customerApi.get('/me');
      if (response.data?.success) {
        setCustomer(response.data.data);
      } else {
        setCustomer(null);
        setToken(null);
        localStorage.removeItem('customerToken');
      }
    } catch {
      setCustomer(null);
      setToken(null);
      localStorage.removeItem('customerToken');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const sendOtp = async (email: string, name?: string) => {
    const response = await customerApi.post('/auth/send-otp', { email, name });
    return response.data;
  };

  const verifyOtp = async (email: string, otp: string, name?: string, phone?: string) => {
    try {
      const response = await customerApi.post('/auth/verify-otp', { email, otp, name, phone });
      if (response.data?.success && response.data.data?.token) {
        const newToken = response.data.data.token;
        const newCustomer = response.data.data.customer;
        localStorage.setItem('customerToken', newToken);
        setToken(newToken);
        setCustomer(newCustomer);
        setIsLoginModalOpen(false);
        return true;
      }
      return false;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || err.response?.data?.message || 'Verification failed';
      throw new Error(errorMsg);
    }
  };

  const logout = async () => {
    try {
      await customerApi.post('/auth/logout');
    } catch {
      // Ignore
    } finally {
      localStorage.removeItem('customerToken');
      setToken(null);
      setCustomer(null);
    }
  };

  const refreshProfile = async () => {
    if (token) {
      await fetchProfile();
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        token,
        isLoading,
        isLoginModalOpen,
        openLoginModal: () => setIsLoginModalOpen(true),
        closeLoginModal: () => setIsLoginModalOpen(false),
        sendOtp,
        verifyOtp,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}
