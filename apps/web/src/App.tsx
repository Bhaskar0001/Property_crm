import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import { CustomerAuthModal } from './components/auth/CustomerAuthModal';
import { MainLayout } from './components/layout/MainLayout';
import { HomePage } from './pages/HomePage';
import { PropertyListingPage } from './pages/PropertyListingPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { ContactPage } from './pages/ContactPage';
import { CustomerPortalPage } from './pages/CustomerPortalPage';
import { ServicesPage } from './pages/ServicesPage';
import { LegalPage } from './pages/LegalPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes cache
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CustomerAuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="properties" element={<PropertyListingPage />} />
              <Route path="properties/:slug" element={<PropertyDetailPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="privacy" element={<LegalPage />} />
              <Route path="terms" element={<LegalPage />} />
              <Route path="regulatory" element={<LegalPage />} />
              <Route path="portal" element={<CustomerPortalPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
        <CustomerAuthModal />
      </CustomerAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
