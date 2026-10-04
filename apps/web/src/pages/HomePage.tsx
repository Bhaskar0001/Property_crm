import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ChevronRight, Shield, Award, Users, ArrowRight, MapPin, Navigation } from 'lucide-react';
import {
  useFeaturedProperties,
  usePublicPropertyTypes,
  usePublicListingTypes,
  usePublicCountries,
  useContactInfo,
} from '../hooks/usePublicData';
import { useValuation } from '../context/ValuationContext';
import { PropertyCard } from '../components/property/PropertyCard';
import { WORLD_COUNTRIES } from '@repo/shared';

export function HomePage() {
  const navigate = useNavigate();
  const { openValuationModal } = useValuation();
  const [listingType, setListingType] = useState<string>('');
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const { data: featured = [], isLoading: loadingFeatured } = useFeaturedProperties(6);
  const { data: propertyTypes = [] } = usePublicPropertyTypes();
  const { data: listingTypes = [] } = usePublicListingTypes();
  const { data: countries = [] } = usePublicCountries();
  const { data: contact } = useContactInfo();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (listingType) params.set('listingType', listingType);
    if (search.trim()) params.set('search', search.trim());
    if (selectedType) params.set('propertyType', selectedType);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center bg-[#081b2e] overflow-hidden">
        {/* Background Image with Dark Vignette */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105 transition-transform duration-1000"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#081b2e] via-[#081b2e]/60 to-transparent" />

        {/* Content */}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Exclusive Luxury Homes, Penthouses & Waterfront Estates</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
            Find Your Dream Luxury Home.{' '}
            <span className="text-amber-300 block sm:inline">Worldwide.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-200 font-normal leading-relaxed mb-10">
            Browse our handpicked collection of prime villas, modern penthouses, and private estates.
            Explore market prices, schedule private viewings, and connect directly with local property specialists.
          </p>

          {/* Sleek Capsule Search Bar (Matching Screenshot 2) */}
          <div className="bg-white rounded-2xl md:rounded-full shadow-2xl p-2.5 sm:p-3 text-left max-w-4xl mx-auto border border-slate-200">
            <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-2">
              {/* Destination with locate icon */}
              <div className="relative flex-1 w-full flex items-center px-4 py-2 bg-slate-50 md:bg-transparent rounded-full border md:border-0 border-slate-200">
                <MapPin className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Destination (e.g. Amsterdam, Paris, London)"
                  className="w-full text-xs sm:text-sm font-medium text-slate-900 bg-transparent placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          const { latitude, longitude } = pos.coords;
                          navigate(`/properties?lat=${latitude}&lng=${longitude}`);
                        },
                        () => navigate('/properties')
                      );
                    } else {
                      navigate('/properties');
                    }
                  }}
                  title="Locate me"
                  className="p-1 rounded-full text-slate-400 hover:text-[#6366f1] transition ml-1"
                >
                  <Navigation className="w-4 h-4" />
                </button>
              </div>

              <div className="hidden md:block w-px h-8 bg-slate-200" />

              {/* Dates / Listing Type */}
              <div className="relative w-full md:w-48 px-4 py-2 bg-slate-50 md:bg-transparent rounded-full border md:border-0 border-slate-200">
                <select
                  value={listingType}
                  onChange={(e) => setListingType(e.target.value)}
                  className="w-full text-xs sm:text-sm font-medium text-slate-700 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="">Select dates / Type</option>
                  {listingTypes && listingTypes.length > 0 &&
                    listingTypes.map((lt) => (
                      <option key={lt._id} value={lt.slug || lt.name.toLowerCase()}>
                        {lt.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="hidden md:block w-px h-8 bg-slate-200" />

              {/* Guests / Bedrooms */}
              <div className="relative w-full md:w-44 px-4 py-2 bg-slate-50 md:bg-transparent rounded-full border md:border-0 border-slate-200">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full text-xs sm:text-sm font-medium text-slate-700 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="">Guests / Type</option>
                  {propertyTypes.map((t) => (
                    <option key={t._id} value={t.slug}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vibrant Accent Search Button (Matching Screenshot 2 purple/indigo) */}
              <button
                type="submit"
                className="w-full md:w-auto px-7 py-3 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-sm font-bold rounded-full transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/30"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </form>
          </div>

          {/* Quick link to interactive map & popular territory chips */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <Link
              to="/properties"
              className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-300 hover:text-white transition bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Explore interactive map &rarr;</span>
            </Link>

            {countries && countries.slice(0, 5).map((c) => (
              <Link
                key={c._id}
                to={`/properties?country=${(c.isoCode || c.name).toLowerCase()}`}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-200 hover:text-white transition bg-white/5 hover:bg-white/15 px-3 py-1.5 rounded-full border border-white/10"
              >
                <span>{c.flag || '🌐'}</span>
                <span>{c.name}</span>
                {c.propertyCount > 0 && (
                  <span className="text-[10px] text-[#6fabca] font-mono font-bold">({c.propertyCount})</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#004274] block mb-2">
                Handpicked Portfolios
              </span>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                Featured Properties
              </h2>
            </div>
            <Link
              to="/properties?isFeatured=true"
              className="mt-4 md:mt-0 inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#004274] hover:text-[#002544] group"
            >
              <span>View All Featured</span>
              <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {loadingFeatured ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-xl h-96 animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured.map((prop) => (
                <PropertyCard key={prop._id} property={prop} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
              <p className="text-slate-500 font-medium">New luxury portfolio listings coming soon.</p>
              <Link
                to="/properties"
                className="mt-4 inline-block px-4 py-2 bg-[#004274] text-white text-xs font-bold uppercase tracking-wider rounded-md"
              >
                Browse All Properties
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Global Destinations Spotlight */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#004274] block mb-2">
              Premier Global Destinations
            </span>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Explore Prime Locations Worldwide
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Discover extraordinary residences across the world's most sought-after cities, coastal retreats, and luxury destinations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {countries && countries.length > 0 ? (
              countries.slice(0, 6).map((c) => {
                const matched = WORLD_COUNTRIES.find(
                  (wc) => wc.isoCode.toUpperCase() === (c.isoCode || '').toUpperCase() || wc.name.toLowerCase() === c.name.toLowerCase()
                );
                const flag = c.flag || matched?.flag || '🌐';
                const defaultCovers: Record<string, string> = {
                  IE: 'https://images.unsplash.com/photo-1549918864-48ac978761a4?auto=format&fit=crop&w=800&q=80',
                  GB: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
                  AE: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
                  ES: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=800&q=80',
                  FR: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
                  US: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&w=800&q=80',
                };
                const coverImage =
                  c.imageUrl ||
                  defaultCovers[(c.isoCode || '').toUpperCase()] ||
                  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80';

                return (
                  <div key={c._id} className="relative rounded-2xl overflow-hidden shadow-md group h-80">
                    <img
                      src={coverImage}
                      alt={c.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#002544] via-[#002544]/50 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <div className="flex items-center space-x-1.5 mb-1">
                        <span className="text-lg">{flag}</span>
                        <span className="text-[11px] font-bold tracking-widest uppercase text-[#6fabca]">
                          {c.name}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold mt-0.5">
                        {c.name} Portfolios
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 mb-4">
                        {c.propertyCount > 0
                          ? `${c.propertyCount} active luxury properties available in this location.`
                          : 'Exclusive private estates and investment residences.'}
                      </p>
                      <Link
                        to={`/properties?country=${(c.isoCode || c.name).toLowerCase()}`}
                        className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-white hover:text-[#6fabca] transition"
                      >
                        <span>Explore {c.name}</span>
                        <ChevronRight className="w-4 h-4 ml-0.5" />
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 py-12 text-center text-slate-400">
                Loading destination portfolios...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Advisory & Trust Pillars */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#004274] block mb-2">
              Why EstateElite
            </span>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              A Higher Standard of Real Estate Service
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-[#004274]/10 text-[#004274] flex items-center justify-center mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Verified Title & Compliance</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Every listed property undergoes rigorous institutional due diligence, title verification, and energy certification checks before market presentation.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-[#004274]/10 text-[#004274] flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Dedicated Viewing Agents</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Experience seamless viewing coordination with designated client managers and instant WhatsApp scheduling for VIP buyers and tenants.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-[#004274]/10 text-[#004274] flex items-center justify-center mb-6">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Dynamic Valuation & Insights</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Make confident decisions with real-time multi-currency pricing, rental yield modeling, and historic transaction analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#004274] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Instruct EstateElite To Represent Your Property
          </h2>
          <p className="max-w-xl mx-auto text-slate-200 text-sm mb-8">
            Access our qualified pool of high-net-worth buyers, corporate tenants, and institutional funds across Europe and the Middle East.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={() => openValuationModal()}
              className="px-6 py-3 bg-white text-[#004274] text-xs font-bold uppercase tracking-wider rounded-md hover:bg-slate-100 shadow-md transition-all cursor-pointer"
            >
              Request Confidential Valuation
            </button>
            {contact?.phone ? (
              <a
                href={`tel:${contact.phone}`}
                className="px-6 py-3 bg-[#00335a] border border-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#002544] transition-all"
              >
                Call Advisory Desk
              </a>
            ) : (
              <Link
                to="/contact"
                className="px-6 py-3 bg-[#00335a] border border-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#002544] transition-all"
              >
                Contact Advisory Desk
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
