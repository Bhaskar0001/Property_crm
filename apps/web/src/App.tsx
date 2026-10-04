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
import { PropertyBrochurePage } from './pages/PropertyBrochurePage';
import { CurrencyProvider } from './context/CurrencyContext';
import { ValuationProvider } from './context/ValuationContext';
import { ValuationModal } from './components/valuation/ValuationModal';

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
        <CurrencyProvider>
          <ValuationProvider>
            <Router>
              <Routes>
                {/* Clean, standalone printable brochure route */}
                <Route path="properties/:slug/brochure" element={<PropertyBrochurePage />} />

                <Route path="/" element={<MainLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="properties" element={<PropertyListingPage />} />
                  <Route path="properties/country/:country" element={<PropertyListingPage />} />
                  <Route path="properties/type/:propertyType" element={<PropertyListingPage />} />
                  <Route path="properties/:slug" element={<PropertyDetailPage />} />
                  <Route path="properties/:country/:city/:slug" element={<PropertyDetailPage />} />
                  <Route path="property/:country/:city/:slug" element={<PropertyDetailPage />} />
                  <Route path="services" element={<ServicesPage />} />
                  <Route path="privacy" element={<LegalPage />} />
                  <Route path="terms" element={<LegalPage />} />
                  <Route path="regulatory" element={<LegalPage />} />
                  <Route path="portal" element={<CustomerPortalPage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
              <CustomerAuthModal />
              <ValuationModal />
            </Router>
          </ValuationProvider>
        </CurrencyProvider>
      </CustomerAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
