import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Phone, Mail, Menu, X, ChevronRight, User, Globe, ChevronDown, Search, Sparkles } from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useCurrency, CurrencyCode } from '../../context/CurrencyContext';
import { useValuation } from '../../context/ValuationContext';
import { usePublicCountries, useContactInfo } from '../../hooks/usePublicData';
import { CountryTickerSlider } from '../home/CountryTickerSlider';
import { WORLD_COUNTRIES } from '@repo/shared';
import { CountryFlag } from '../common/CountryFlag';
import { LuxuryEmblem } from '../common/LuxuryEmblem';

export function Navbar() {
  const { customer, openLoginModal } = useCustomerAuth();
  const { currentCurrency, setCurrency, availableCurrencies } = useCurrency();
  const { openValuationModal } = useValuation();
  const { data: dbCountries = [] } = usePublicCountries();
  const { data: contact } = useContactInfo();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countryFilterText, setCountryFilterText] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'BUY', path: '/properties?listingType=sale' },
    { name: 'RENT', path: '/properties?listingType=rent' },
    { name: 'FEATURED', path: '/properties?isFeatured=true' },
    { name: 'NEW DEVELOPMENTS', path: '/properties?propertyType=development' },
    { name: 'SERVICES', path: '/services' },
    { name: 'CONTACT', path: '/contact' },
  ];

  // Merge active database countries with flags
  const activeCountries = (dbCountries && dbCountries.length > 0 ? dbCountries : []).map((c: any) => {
    const matched = WORLD_COUNTRIES.find(
      (wc) => wc.isoCode.toUpperCase() === (c.isoCode || '').toUpperCase() || wc.name.toLowerCase() === c.name.toLowerCase()
    );
    const isoCode = c.isoCode || matched?.isoCode || 'GL';
    return {
      _id: c._id || c.isoCode,
      name: c.name,
      isoCode,
      flag: c.flag || matched?.flag || '🌐',
      flagUrl: c.flagUrl || matched?.flagUrl || (isoCode ? `https://flagcdn.com/w80/${isoCode.toLowerCase()}.png` : undefined),
      phoneCode: c.phoneCode || matched?.phoneCode || '',
      propertyCount: c.propertyCount || 0,
    };
  });

  // Filter countries in dropdown search
  const filteredDropdownCountries = activeCountries.filter((c: any) =>
    c.name.toLowerCase().includes(countryFilterText.toLowerCase()) ||
    c.isoCode.toLowerCase().includes(countryFilterText.toLowerCase())
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on navigation
  useEffect(() => {
    setCountryDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    return location.pathname + location.search === path;
  };

  const handleSelectCountry = (isoCode: string) => {
    setCountryDropdownOpen(false);
    navigate(`/properties?country=${isoCode.toLowerCase()}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100 transition-all">
      {/* Top Utility Bar */}
      <div className="bg-[#002544] text-slate-300 text-xs py-2 px-4 border-b border-white/10 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {contact?.phone && (
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center space-x-1.5 hover:text-white transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#6fabca]" />
                <span>{contact.phone}</span>
              </a>
            )}
            {contact?.email && (
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center space-x-1.5 hover:text-white transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[#6fabca]" />
                <span>{contact.email}</span>
              </a>
            )}
            <span className="text-slate-400">Global Prime Real Estate Advisory</span>
          </div>
          <div className="flex items-center space-x-4">
            {/* Currency Switcher */}
            <div className="flex items-center space-x-1 bg-white/10 hover:bg-white/15 px-2 py-0.5 rounded text-[11px] transition">
              <span className="text-[#6fabca] font-bold">FX:</span>
              <select
                value={currentCurrency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer text-[11px]"
                title="Select Display Currency"
              >
                {availableCurrencies.map((c) => (
                  <option key={c.code} value={c.code} className="text-slate-900 bg-white">
                    {c.code} ({c.symbol.trim()})
                  </option>
                ))}
              </select>
            </div>
            <span className="text-slate-300 font-medium hidden md:inline">Premier International Real Estate</span>
            <span className="text-white/20 hidden md:inline">|</span>
            {(() => {
              const adminUrl =
                (import.meta as any).env?.VITE_ADMIN_URL ||
                (typeof window !== 'undefined' && window.location.hostname.includes('abroadaccommodation.com')
                  ? 'https://admin.listing.abroadaccommodation.com'
                  : 'http://localhost:3001');
              return (
                <a
                  href={adminUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 text-[#6fabca] hover:text-white transition-colors font-medium"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Admin Desk</span>
                </a>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img
              src="/logo.png"
              alt="AbroadAccommodation"
              className="w-10 h-10 object-contain rounded-lg shadow-sm"
            />
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Abroad<span className="text-[#004274]">Accommodation</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-amber-700 font-bold -mt-0.5">
                International Living & Real Estate
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center space-x-6">
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

            {/* Live Country Dropdown (Auto-updates with Admin entries) */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                className={`inline-flex items-center gap-1.5 text-[13px] font-bold tracking-wider px-3 py-1.5 rounded-lg transition-all ${
                  countryDropdownOpen
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'
                }`}
              >
                <Globe className="w-4 h-4 text-indigo-600" />
                <span>COUNTRIES</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${countryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu Modal */}
              {countryDropdownOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Operative Countries ({activeCountries.length})
                      </h4>
                      <p className="text-[11px] text-slate-500">Auto-synced from Admin settings</p>
                    </div>
                    <Link
                      to="/properties"
                      onClick={() => setCountryDropdownOpen(false)}
                      className="text-[11px] font-bold text-indigo-600 hover:underline"
                    >
                      View All
                    </Link>
                  </div>

                  {/* Filter Search within dropdown */}
                  <div className="relative my-2.5">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter countries..."
                      value={countryFilterText}
                      onChange={(e) => setCountryFilterText(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Countries List */}
                  <div className="max-h-64 overflow-y-auto space-y-1 divide-y divide-slate-50 pr-1">
                    {filteredDropdownCountries.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No active countries matched.
                      </div>
                    ) : (
                      filteredDropdownCountries.map((c: any) => (
                        <button
                          key={c._id}
                          type="button"
                          onClick={() => handleSelectCountry(c.isoCode)}
                          className="w-full text-left p-2 rounded-xl hover:bg-indigo-50/70 transition flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2.5">
                            <CountryFlag code={c.isoCode} name={c.name} flagUrl={c.flagUrl} size="md" />
                            <div>
                              <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition">
                                {c.name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                ISO: {c.isoCode} {c.phoneCode && `• ${c.phoneCode}`}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 group-hover:bg-indigo-100 text-slate-600 group-hover:text-indigo-700 transition">
                            {c.propertyCount > 0 ? `${c.propertyCount} listings` : 'Active'}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
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


            <button
              type="button"
              onClick={() => openValuationModal()}
              className="inline-flex items-center px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#004274] border border-[#004274]/30 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Valuation
            </button>
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

      {/* Auto-sliding Fast Country Ticker Ribbon */}
      <CountryTickerSlider />

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

          {/* Mobile Countries list */}
          <div className="py-2 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Explore by Country
            </span>
            <div className="grid grid-cols-2 gap-2">
              {activeCountries.map((c: any) => (
                <button
                  key={c._id}
                  onClick={() => handleSelectCountry(c.isoCode)}
                  className="p-2 text-left bg-slate-50 hover:bg-indigo-50 rounded-lg text-xs font-semibold text-slate-800 flex items-center gap-2"
                >
                  <CountryFlag code={c.isoCode} name={c.name} flagUrl={c.flagUrl} size="xs" />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex flex-col space-y-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openValuationModal();
              }}
              className="w-full text-center py-2.5 text-xs font-semibold uppercase tracking-wider text-[#004274] border border-[#004274]/30 rounded-md"
            >
              Book Valuation
            </button>
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
