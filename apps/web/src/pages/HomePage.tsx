import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ChevronRight, Shield, Award, Users, ArrowRight } from 'lucide-react';
import {
  useFeaturedProperties,
  usePublicCountries,
  usePublicPropertyTypes,
} from '../hooks/usePublicData';
import { PropertyCard } from '../components/property/PropertyCard';

export function HomePage() {
  const navigate = useNavigate();
  const [listingType, setListingType] = useState<'sale' | 'rent'>('sale');
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const { data: featured = [], isLoading: loadingFeatured } = useFeaturedProperties(6);
  const { data: countries = [] } = usePublicCountries();
  const { data: propertyTypes = [] } = usePublicPropertyTypes();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (listingType) params.set('listingType', listingType);
    if (search.trim()) params.set('search', search.trim());
    if (selectedCountry) params.set('country', selectedCountry);
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
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[#6fabca] text-xs font-semibold uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-[#6fabca] animate-pulse" />
            <span>Prime Residential & Commercial Portfolios</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
            Exceptional Properties.{' '}
            <span className="text-[#6fabca] block sm:inline">Unrivalled Advisory.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-normal leading-relaxed mb-10">
            Discover prime real estate investments across Ireland, the United Kingdom, and the UAE,
            backed by data-driven valuation and licensed advisory.
          </p>

          {/* Search Box */}
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 text-left max-w-4xl mx-auto border border-slate-100">
            {/* Tab switch */}
            <div className="flex space-x-2 border-b border-slate-100 pb-3 mb-4">
              <button
                type="button"
                onClick={() => setListingType('sale')}
                className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-colors ${
                  listingType === 'sale'
                    ? 'bg-[#004274] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#004274] bg-slate-50'
                }`}
              >
                Buy
              </button>
              <button
                type="button"
                onClick={() => setListingType('rent')}
                className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-colors ${
                  listingType === 'rent'
                    ? 'bg-[#004274] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#004274] bg-slate-50'
                }`}
              >
                Rent
              </button>
            </div>

            {/* Inputs */}
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-4">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Location or Reference
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="e.g. Dublin 4, London, Mayfair"
                    className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#004274] focus:bg-white"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-3" />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Country
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004274] focus:bg-white"
                >
                  <option value="">All Countries</option>
                  {countries.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.propertyCount})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Property Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004274] focus:bg-white"
                >
                  <option value="">All Property Types</option>
                  {propertyTypes.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#004274] hover:bg-[#00335a] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-md flex items-center justify-center space-x-1.5"
                >
                  <span>Search</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
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

      {/* Territories Spotlight */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#004274] block mb-2">
              Territorial Expertise
            </span>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Prime Jurisdictions We Serve
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Local market intelligence combined with institutional advisory across high-growth European and Middle Eastern centers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Ireland */}
            <div className="relative rounded-2xl overflow-hidden shadow-md group h-80">
              <img
                src="https://images.unsplash.com/photo-1549918864-48ac978761a4?auto=format&fit=crop&w=800&q=80"
                alt="Dublin, Ireland"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#002544] via-[#002544]/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-[11px] font-bold tracking-widest uppercase text-[#6fabca]">
                  Republic of Ireland
                </span>
                <h3 className="text-2xl font-bold mt-1">Dublin & Coastal Enclaves</h3>
                <p className="text-xs text-slate-300 mt-1 mb-4">
                  Ballsbridge, Dalkey, IFSC, and high-yield residential developments.
                </p>
                <Link
                  to="/properties?city=Dublin"
                  className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-white hover:text-[#6fabca]"
                >
                  <span>Explore Dublin</span>
                  <ChevronRight className="w-4 h-4 ml-0.5" />
                </Link>
              </div>
            </div>

            {/* United Kingdom */}
            <div className="relative rounded-2xl overflow-hidden shadow-md group h-80">
              <img
                src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80"
                alt="London, UK"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#002544] via-[#002544]/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-[11px] font-bold tracking-widest uppercase text-[#6fabca]">
                  United Kingdom
                </span>
                <h3 className="text-2xl font-bold mt-1">Greater London</h3>
                <p className="text-xs text-slate-300 mt-1 mb-4">
                  Mayfair, Kensington, Canary Wharf prime assets and student accommodations.
                </p>
                <Link
                  to="/properties?city=London"
                  className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-white hover:text-[#6fabca]"
                >
                  <span>Explore London</span>
                  <ChevronRight className="w-4 h-4 ml-0.5" />
                </Link>
              </div>
            </div>

            {/* UAE */}
            <div className="relative rounded-2xl overflow-hidden shadow-md group h-80">
              <img
                src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80"
                alt="Dubai, UAE"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#002544] via-[#002544]/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-[11px] font-bold tracking-widest uppercase text-[#6fabca]">
                  United Arab Emirates
                </span>
                <h3 className="text-2xl font-bold mt-1">Dubai Luxury Estates</h3>
                <p className="text-xs text-slate-300 mt-1 mb-4">
                  Palm Jumeirah, Downtown Dubai, and waterfront freehold properties.
                </p>
                <Link
                  to="/properties?city=Dubai"
                  className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-white hover:text-[#6fabca]"
                >
                  <span>Explore Dubai</span>
                  <ChevronRight className="w-4 h-4 ml-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advisory & Trust Pillars */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#004274] block mb-2">
              Why PropertyOS
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
            Instruct PropertyOS To Represent Your Property
          </h2>
          <p className="max-w-xl mx-auto text-slate-200 text-sm mb-8">
            Access our qualified pool of high-net-worth buyers, corporate tenants, and institutional funds across Europe and the Middle East.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="px-6 py-3 bg-white text-[#004274] text-xs font-bold uppercase tracking-wider rounded-md hover:bg-slate-100 shadow-md transition-all"
            >
              Request Confidential Valuation
            </Link>
            <a
              href="tel:+35312345678"
              className="px-6 py-3 bg-[#00335a] border border-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#002544] transition-all"
            >
              Call Advisory Desk
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
