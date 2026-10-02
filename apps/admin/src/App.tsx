import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { LoginPage } from './pages/auth/LoginPage';
import { ForceChangePasswordPage } from './pages/auth/ForceChangePasswordPage';
import { PropertyListPage } from './pages/properties/PropertyListPage';
import { PropertyFormPage } from './pages/properties/PropertyFormPage';
import { PropertyMediaPage } from './pages/properties/PropertyMediaPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { StaffListPage } from './pages/staff/StaffListPage';
import { StaffDetailPage } from './pages/staff/StaffDetailPage';
import { LeadListPage } from './pages/leads/LeadListPage';
import { LeadDetailPage } from './pages/leads/LeadDetailPage';
import { TelecallerWorkspacePage } from './pages/telecaller/TelecallerWorkspacePage';
import { ViewingListPage } from './pages/viewings/ViewingListPage';
import { ViewingCalendarPage } from './pages/viewings/ViewingCalendarPage';
import { OfferListPage } from './pages/offers/OfferListPage';
import { DealTrackingPage } from './pages/offers/DealTrackingPage';
import { WhatsAppWorkspacePage } from './pages/whatsapp/WhatsAppWorkspacePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/force-change-password" element={<ForceChangePasswordPage />} />

            {/* Main Application with Sidebar & Header Layout */}
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="properties" element={<PropertyListPage />} />
              <Route path="properties/new" element={<PropertyFormPage />} />
              <Route path="properties/:id/edit" element={<PropertyFormPage />} />
              <Route path="properties/:id/media" element={<PropertyMediaPage />} />
              <Route path="leads" element={<LeadListPage />} />
              <Route path="leads/:id" element={<LeadDetailPage />} />
              <Route path="telecaller" element={<TelecallerWorkspacePage />} />
              <Route path="whatsapp" element={<WhatsAppWorkspacePage />} />
              <Route path="viewings" element={<ViewingListPage />} />
              <Route path="viewings/calendar" element={<ViewingCalendarPage />} />
              <Route path="offers" element={<OfferListPage />} />
              <Route path="offers/deals" element={<DealTrackingPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="staff" element={<StaffListPage />} />
              <Route path="staff/:id" element={<StaffDetailPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
