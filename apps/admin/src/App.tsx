import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SettingsPage } from './pages/settings/SettingsPage';
import { StaffListPage } from './pages/staff/StaffListPage';
import { StaffDetailPage } from './pages/staff/StaffDetailPage';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            refetchOnWindowFocus: false,
        }
    }
});

const App: React.FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <div className="min-h-screen bg-gray-100 flex">
                    <aside className="w-64 bg-gray-800 text-white p-6">
                        <h2 className="text-2xl font-bold mb-8">Admin CRM</h2>
                        <nav className="flex flex-col space-y-4">
                            <a href="/settings" className="hover:text-blue-300">Settings</a>
                            <a href="/staff" className="hover:text-blue-300">Staff Management</a>
                        </nav>
                    </aside>
                    <main className="flex-1 overflow-auto">
                        <Routes>
                            <Route path="/" element={<Navigate to="/settings" replace />} />
                            <Route path="/settings" element={<SettingsPage />} />
                            <Route path="/staff" element={<StaffListPage />} />
                            <Route path="/staff/:id" element={<StaffDetailPage />} />
                        </Routes>
                    </main>
                </div>
            </BrowserRouter>
        </QueryClientProvider>
    );
};

export default App;
