import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, Mail, Menu, X, Building2, ChevronRight, User } from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';

export function Navbar() {
  const { customer, openLoginModal } = useCustomerAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'BUY', path: '/properties?listingType=sale' },
    { name: 'RENT', path: '/properties?listingType=rent' },
    { name: 'FEATURED', path: '/properties?isFeatured=true' },
    { name: 'NEW DEVELOPMENTS', path: '/properties?propertyType=development' },
    { name: 'SERVICES', path: '/services' },
    { name: 'CONTACT', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    return location.pathname + location.search === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100 transition-all">
      {/* Top Utility Bar */}
      <div className="bg-[#002544] text-slate-300 text-xs py-2 px-4 border-b border-white/10 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <a
              href="tel:+35312345678"
              className="flex items-center space-x-1.5 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#6fabca]" />
              <span>+353 1 234 5678</span>
            </a>
            <a
              href="mailto:advisory@propertyos.com"
              className="flex items-center space-x-1.5 hover:text-white transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-[#6fabca]" />
              <span>advisory@propertyos.com</span>
            </a>
            <span className="text-slate-400">Dublin • London • Dubai</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-slate-300 font-medium">Licensed Estate Agent & Advisory</span>
            <span className="text-white/20">|</span>
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1 text-[#6fabca] hover:text-white transition-colors font-medium"
            >
              <User className="w-3.5 h-3.5" />
              <span>Staff CRM</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-lg bg-[#004274] flex items-center justify-center text-white shadow-md shadow-blue-950/20 group-hover:bg-[#00335a] transition-colors">
              <Building2 className="w-6 h-6 text-[#6fabca]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-[#004274] uppercase">
                Property<span className="text-[#6fabca]">OS</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-medium -mt-1">
                Real Estate Advisory
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-[13px] font-semibold tracking-wider transition-colors hover:text-[#004274] ${
                  isActive(link.path) ? 'text-[#004274] border-b-2 border-[#004274] pb-1' : 'text-slate-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center space-x-3">
            {customer ? (
              <Link
                to="/portal"
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-[#004274] bg-blue-50/80 hover:bg-blue-100 border border-blue-200/60 rounded-md transition-colors"
              >
                <User className="w-3.5 h-3.5 text-[#004274]" />
                <span>{customer.name?.split(' ')[0] || 'My Portal'}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={openLoginModal}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-slate-700 hover:text-[#004274] transition-colors"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Sign In</span>
              </button>
            )}

            <Link
              to="/contact"
              className="inline-flex items-center px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#004274] border border-[#004274]/30 rounded-md hover:bg-slate-50 transition-colors"
            >
              Valuation
            </Link>
            <Link
              to="/properties"
              className="inline-flex items-center px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#004274] rounded-md hover:bg-[#00335a] shadow-sm transition-all"
            >
              <span>Listings</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 hover:text-[#004274] focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 shadow-xl px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 text-sm font-semibold tracking-wider text-slate-700 hover:text-[#004274] border-b border-slate-100"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2 flex flex-col space-y-2">
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-xs font-semibold uppercase tracking-wider text-[#004274] border border-[#004274]/30 rounded-md"
            >
              Book Valuation
            </Link>
            <Link
              to="/properties"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#004274] rounded-md"
            >
              Explore Listings
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
