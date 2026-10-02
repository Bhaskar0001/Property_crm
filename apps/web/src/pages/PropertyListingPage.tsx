import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Home,
  X,
} from 'lucide-react';
import {
  usePublicProperties,
  usePublicCountries,
  usePublicPropertyTypes,
} from '../hooks/usePublicData';
import { PropertyCard } from '../components/property/PropertyCard';
import { PublicPropertiesFilter } from '../types';

export function PropertyListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL State synced filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [country, setCountry] = useState(searchParams.get('country') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('propertyType') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || '');
  const [berRating, setBerRating] = useState(searchParams.get('berRating') || '');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'popular'>(
    (searchParams.get('sortBy') as any) || 'newest'
  );
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state if searchParams change externally
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCountry(searchParams.get('country') || '');
    setCity(searchParams.get('city') || '');
    setPropertyType(searchParams.get('propertyType') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setBedrooms(searchParams.get('bedrooms') || '');
    setBerRating(searchParams.get('berRating') || '');
    setSortBy((searchParams.get('sortBy') as any) || 'newest');
    setPage(Number(searchParams.get('page')) || 1);
  }, [searchParams]);

  // Construct query filters
  const queryFilters: PublicPropertiesFilter = {
    search: search || undefined,
    country: country || undefined,
    city: city || undefined,
    propertyType: propertyType || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    bedrooms: bedrooms ? Number(bedrooms) : undefined,
    berRating: berRating || undefined,
    sortBy,
    page,
    limit: 9,
  };

  const { data, isLoading } = usePublicProperties(queryFilters);
  const { data: countries = [] } = usePublicCountries();
  const { data: propertyTypes = [] } = usePublicPropertyTypes();

  const applyFilters = () => {
    const nextParams = new URLSearchParams();
    if (search) nextParams.set('search', search);
    if (country) nextParams.set('country', country);
    if (city) nextParams.set('city', city);
    if (propertyType) nextParams.set('propertyType', propertyType);
    if (minPrice) nextParams.set('minPrice', minPrice);
    if (maxPrice) nextParams.set('maxPrice', maxPrice);
    if (bedrooms) nextParams.set('bedrooms', bedrooms);
    if (berRating) nextParams.set('berRating', berRating);
    if (sortBy) nextParams.set('sortBy', sortBy);
    nextParams.set('page', '1');
    setPage(1);
    setSearchParams(nextParams);
    setMobileFilterOpen(false);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCountry('');
    setCity('');
    setPropertyType('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setBerRating('');
    setSortBy('newest');
    setPage(1);
    setSearchParams(new URLSearchParams());
    setMobileFilterOpen(false);
  };

  const handlePageChange = (newPage: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', String(newPage));
    setSearchParams(nextParams);
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const properties = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="bg-[#fcfdfd] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs text-slate-500 mb-6">
          <Link to="/" className="hover:text-[#004274] flex items-center">
            <Home className="w-3.5 h-3.5 mr-1" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-800">Properties</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 mb-8 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-extrabold text-[#004274] tracking-tight">
              Property Portfolio
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {pagination ? (
                <span>
                  Showing <strong className="text-slate-800">{properties.length}</strong> of{' '}
                  <strong className="text-slate-800">{pagination.total}</strong> premium listings
                </span>
              ) : (
                'Loading current listings...'
              )}
            </p>
          </div>

          {/* Sort bar & Mobile filter button */}
          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center space-x-2 px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#004274]" />
              <span>Filters</span>
            </button>

            <div className="flex items-center space-x-2">
              <label className="text-xs font-semibold text-slate-500 hidden sm:inline">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setSortBy(val);
                  const nextParams = new URLSearchParams(searchParams);
                  nextParams.set('sortBy', val);
                  setSearchParams(nextParams);
                }}
                className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#004274]"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content: Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm h-fit sticky top-28">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-[#004274]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Refine Search
                </h2>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-semibold text-slate-500 hover:text-[#004274] flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Keyword */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Keyword / Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="e.g. Ballsbridge or Ref..."
                  className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#004274]"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004274]"
              >
                <option value="">All Countries</option>
                {countries.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.propertyCount})
                  </option>
                ))}
              </select>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Property Type
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004274]"
              >
                <option value="">All Types</option>
                {propertyTypes.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Price Range (€)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004274]"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004274]"
                />
              </div>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Bedrooms (Min)
              </label>
              <div className="grid grid-cols-5 gap-1">
                {['', '1', '2', '3', '4+'].map((opt) => {
                  const val = opt === '4+' ? '4' : opt;
                  const isSelected = bedrooms === val;
                  return (
                    <button
                      key={opt || 'all'}
                      type="button"
                      onClick={() => setBedrooms(val)}
                      className={`py-1.5 text-xs font-semibold rounded ${
                        isSelected
                          ? 'bg-[#004274] text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {opt || 'Any'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BER Rating (Ireland Specific) */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                BER Rating (Ireland)
              </label>
              <select
                value={berRating}
                onChange={(e) => setBerRating(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004274]"
              >
                <option value="">Any BER Rating</option>
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="A3">A3</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="B3">B3</option>
                <option value="C1">C1</option>
                <option value="C2">C2</option>
              </select>
            </div>

            {/* Apply Button */}
            <button
              type="button"
              onClick={applyFilters}
              className="w-full py-2.5 bg-[#004274] hover:bg-[#00335a] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-sm"
            >
              Apply Filters
            </button>
          </aside>

          {/* Listings Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl h-80 animate-pulse border border-slate-200"
                  />
                ))}
              </div>
            ) : properties.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((prop) => (
                    <PropertyCard key={prop._id} property={prop} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center space-x-2">
                    <button
                      disabled={!pagination.hasPrev}
                      onClick={() => handlePageChange(pagination.page - 1)}
                      className="p-2 border border-slate-300 rounded-lg text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: pagination.totalPages }, (_, idx) => idx + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`w-9 h-9 text-xs font-bold rounded-lg ${
                          p === pagination.page
                            ? 'bg-[#004274] text-white'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      disabled={!pagination.hasNext}
                      onClick={() => handlePageChange(pagination.page + 1)}
                      className="p-2 border border-slate-300 rounded-lg text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                <p className="text-slate-700 font-bold text-base mb-1">
                  No properties matched your criteria
                </p>
                <p className="text-slate-500 text-xs mb-6 max-w-sm mx-auto">
                  Try broadening your search, removing price constraints, or exploring other territories.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-[#004274] text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#00335a]"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/50 backdrop-blur-sm lg:hidden">
          <div className="ml-auto w-full max-w-xs bg-white h-full p-6 overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900">Filters</span>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Keyword
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs"
              >
                <option value="">All Countries</option>
                {countries.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Property Type
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs"
              >
                <option value="">All Types</option>
                {propertyTypes.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 flex space-x-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-1/2 py-2 border border-slate-300 text-xs font-semibold rounded text-slate-700"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={applyFilters}
                className="w-1/2 py-2 bg-[#004274] text-xs font-semibold rounded text-white"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
