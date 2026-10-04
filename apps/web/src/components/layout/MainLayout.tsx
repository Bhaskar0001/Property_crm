import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { FloatingWhatsAppButton } from '../communication/FloatingWhatsAppButton';
import { FloatingCallButton } from '../communication/FloatingCallButton';
import { PropertyAIChatbot } from '../chat/PropertyAIChatbot';

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfdfd]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />

      {/* Persistent Communication & Concierge Hubs */}
      <FloatingWhatsAppButton />
      <FloatingCallButton />
      <PropertyAIChatbot />
    </div>
  );
}
