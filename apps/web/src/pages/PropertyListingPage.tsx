import { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import {
  RotateCcw,
  MapPin,
  Grid,
  Map as MapIcon,
  Columns,
  Navigation,
  Bed,
  Bath,
  Square,
  Star,
} from 'lucide-react';
import {
  usePublicProperties,
  usePublicCountries,
  usePublicPropertyTypes,
  usePublicListingTypes,
} from '../hooks/usePublicData';
import { PropertyCard } from '../components/property/PropertyCard';
import { PropertyMap } from '../components/property/PropertyMap';
import { PublicPropertiesFilter } from '../types';
import { WORLD_COUNTRIES } from '@repo/shared';

export function PropertyListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { country: routeCountry, propertyType: routePropertyType } = useParams<{
    country?: string;
    propertyType?: string;
  }>();

  // View Mode: 'split' (cards on left, map on right - default as in screenshot), 'grid', 'map'
  const [viewMode, setViewMode] = useState<'split' | 'grid' | 'map'>('split');

  // URL State synced filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [country, setCountry] = useState(routeCountry || searchParams.get('country') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [propertyType, setPropertyType] = useState(
    routePropertyType || searchParams.get('propertyType') || ''
  );
  const [listingType, setListingType] = useState(searchParams.get('listingType') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || '');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'popular'>(
    (searchParams.get('sortBy') as any) || 'newest'
  );
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  // Map state
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [searchAsMapMoves, setSearchAsMapMoves] = useState(true);
  const [mapBounds, setMapBounds] = useState<{
    neLat: number;
    neLng: number;
    swLat: number;
    swLng: number;
  } | null>(null);

  // Sync state if searchParams change externally
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCountry(searchParams.get('country') || '');
    setCity(searchParams.get('city') || '');
    setPropertyType(searchParams.get('propertyType') || '');
    setListingType(searchParams.get('listingType') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setBedrooms(searchParams.get('bedrooms') || '');
    setSortBy((searchParams.get('sortBy') as any) || 'newest');
    setPage(Number(searchParams.get('page')) || 1);
  }, [searchParams]);

  // Construct query filters
  const queryFilters: PublicPropertiesFilter = {
    search: search || undefined,
    country: country || undefined,
    city: city || undefined,
    propertyType: propertyType || undefined,
    listingType: listingType || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    bedrooms: bedrooms ? Number(bedrooms) : undefined,
    sortBy,
    ...(searchAsMapMoves && mapBounds
      ? {
          neLat: mapBounds.neLat,
          neLng: mapBounds.neLng,
          swLat: mapBounds.swLat,
          swLng: mapBounds.swLng,
        }
      : {}),
    page,
    limit: viewMode === 'split' ? 24 : 12,
  };

  const { data, isLoading } = usePublicProperties(queryFilters);
  const { data: countries = [] } = usePublicCountries();
  const { data: propertyTypes = [] } = usePublicPropertyTypes();
  const { data: listingTypes = [] } = usePublicListingTypes();

  const properties = data?.data || [];
  const pagination = data?.pagination;

  const applyFilters = (customParams?: Record<string, string>) => {
    const nextParams = new URLSearchParams();
    if (search) nextParams.set('search', search);
    if (country) nextParams.set('country', country);
    if (city) nextParams.set('city', city);
    if (propertyType) nextParams.set('propertyType', propertyType);
    if (listingType) nextParams.set('listingType', listingType);
    if (minPrice) nextParams.set('minPrice', minPrice);
    if (maxPrice) nextParams.set('maxPrice', maxPrice);
    if (bedrooms) nextParams.set('bedrooms', bedrooms);
    if (sortBy) nextParams.set('sortBy', sortBy);

    if (customParams) {
      Object.entries(customParams).forEach(([k, v]) => {
        if (v) nextParams.set(k, v);
        else nextParams.delete(k);
      });
    }

    nextParams.set('page', '1');
    setPage(1);
    setSearchParams(nextParams);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCountry('');
    setCity('');
    setPropertyType('');
    setListingType('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setSortBy('newest');
    setMapBounds(null);
    setPage(1);
    setSearchParams(new URLSearchParams());
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMapBounds({
          neLat: latitude + 0.05,
          neLng: longitude + 0.05,
          swLat: latitude - 0.05,
          swLng: longitude - 0.05,
        });
        setSearch('');
        applyFilters();
      },
      () => {
        setSearch('');
        applyFilters();
      }
    );
  };

  const handleBoundsChange = (bounds: {
    neLat: number;
    neLng: number;
    swLat: number;
    swLng: number;
  }) => {
    setMapBounds(bounds);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Floating Filter Capsule (Matching Screenshot 1 & 2) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Capsule Search Bar */}
          <div className="flex-1 flex flex-wrap items-center gap-2">
            {/* Destination with Locate Button */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                placeholder="Destination or city (e.g. Amsterdam, Paris)..."
                className="w-full pl-9 pr-9 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/70 border border-slate-300 rounded-full focus:bg-white focus:ring-2 focus:ring-[#004274] focus:outline-none transition-all placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={handleLocateMe}
                title="Use current location"
                className="absolute right-2.5 top-2 p-0.5 rounded-full text-slate-400 hover:text-[#004274] transition"
              >
                <Navigation className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Listing Type / Dates Selector (Dynamic from Admin) */}
            <select
              value={listingType}
              onChange={(e) => {
                setListingType(e.target.value);
                applyFilters({ listingType: e.target.value });
              }}
              className="px-3.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-full text-slate-700 hover:bg-slate-100/70 focus:outline-none focus:ring-2 focus:ring-[#004274] transition cursor-pointer font-medium"
            >
              <option value="">Select dates / Type</option>
              {listingTypes && listingTypes.length > 0 &&
                listingTypes.map((lt) => (
                  <option key={lt._id} value={lt.slug || lt.name.toLowerCase()}>
                    {lt.name} {lt.propertyCount > 0 ? `(${lt.propertyCount})` : ''}
                  </option>
                ))}
            </select>

            {/* Guests / Bedrooms Selector */}
            <select
              value={bedrooms}
              onChange={(e) => {
                setBedrooms(e.target.value);
                applyFilters({ bedrooms: e.target.value });
              }}
              className="px-3.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-full text-slate-700 hover:bg-slate-100/70 focus:outline-none focus:ring-2 focus:ring-[#004274] transition cursor-pointer font-medium"
            >
              <option value="">Guests / Beds</option>
              <option value="1">1+ Bedrooms</option>
              <option value="2">2+ Bedrooms</option>
              <option value="3">3+ Bedrooms</option>
              <option value="4">4+ Bedrooms</option>
              <option value="5">5+ Bedrooms</option>
            </select>

            {/* Country Selector (Dynamic from Admin + Auto-updated) */}
            <select
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                applyFilters({ country: e.target.value });
              }}
              className="px-3.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-full text-slate-700 hover:bg-slate-100/70 focus:outline-none focus:ring-2 focus:ring-[#004274] transition cursor-pointer font-medium"
            >
              <option value="">All Countries ({countries.length})</option>
              {countries.map((c) => {
                const matched = WORLD_COUNTRIES.find(
                  (wc) => wc.isoCode.toUpperCase() === (c.isoCode || '').toUpperCase() || wc.name.toLowerCase() === c.name.toLowerCase()
                );
                const flag = c.flag || matched?.flag || '🌐';
                return (
                  <option key={c._id} value={c.isoCode.toLowerCase()}>
                    {flag} {c.name} {c.propertyCount > 0 ? `(${c.propertyCount})` : ''}
                  </option>
                );
              })}
            </select>

            {/* Property Type Selector (Dynamic from Admin) */}
            <select
              value={propertyType}
              onChange={(e) => {
                setPropertyType(e.target.value);
                applyFilters({ propertyType: e.target.value });
              }}
              className="px-3.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-full text-slate-700 hover:bg-slate-100/70 focus:outline-none focus:ring-2 focus:ring-[#004274] transition cursor-pointer font-medium"
            >
              <option value="">Property Type ({propertyTypes.length})</option>
              {propertyTypes.map((t) => (
                <option key={t._id} value={t.slug || t._id}>
                  {t.name} {t.propertyCount > 0 ? `(${t.propertyCount})` : ''}
                </option>
              ))}
            </select>

            {/* Price Filter */}
            <select
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                applyFilters({ maxPrice: e.target.value });
              }}
              className="px-3.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-full text-slate-700 hover:bg-slate-100/70 focus:outline-none focus:ring-2 focus:ring-[#004274] transition cursor-pointer"
            >
              <option value="">Any Price</option>
              <option value="500000">Up to €500,000</option>
              <option value="1000000">Up to €1,000,000</option>
              <option value="2500000">Up to €2,500,000</option>
              <option value="5000000">Up to €5,000,000</option>
              <option value="10000000">Up to €10,000,000</option>
            </select>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleResetFilters}
              title="Reset all filters"
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 transition border border-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-full border border-slate-200 text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full transition ${
                viewMode === 'split'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split View</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full transition ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full transition ${
                viewMode === 'map'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Map Only</span>
            </button>
          </div>
        </div>

        {/* Quick Location Discovery Pills */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Top Locations:
          </span>
          {['Dublin', 'London', 'Dubai', 'Cork', 'Galway'].map((loc) => {
            const isSelected = search.toLowerCase() === loc.toLowerCase() || city.toLowerCase() === loc.toLowerCase();
            return (
              <button
                key={loc}
                type="button"
                onClick={() => {
                  const nextVal = isSelected ? '' : loc;
                  setSearch(nextVal);
                  setCity(nextVal);
                  applyFilters({ search: nextVal, city: nextVal });
                }}
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium transition whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {loc}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Body */}
      {viewMode === 'split' ? (
        /* 1. Split View Mode (Matching Screenshot 1: Left Cards, Right Interactive Map) */
        <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-4.25rem)] overflow-hidden">
          {/* Left Column: Property Cards Feed */}
          <div className="w-full lg:w-[480px] xl:w-[540px] flex flex-col h-full bg-white border-r border-slate-200">
            {/* Results Count & Sort Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-900">
                  {isLoading ? 'Searching properties...' : `${pagination?.total || properties.length} results`}
                </span>
              </div>

              <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                <span>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as any);
                    applyFilters({ sortBy: e.target.value });
                  }}
                  className="font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="newest">Recommended</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>

            {/* Scrollable Property Cards List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-slate-100 h-64 rounded-2xl animate-pulse"
                    />
                  ))}
                </div>
              ) : properties.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <p className="font-bold text-base text-slate-700 mb-1">No properties in this view</p>
                  <p className="text-xs mb-4">Try zooming out or moving the map to explore adjacent regions.</p>
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-[#004274] text-white text-xs font-bold rounded-lg hover:bg-[#003156] transition"
                  >
                    Reset Search
                  </button>
                </div>
              ) : (
                properties.map((property) => {
                  const isHovered = hoveredPropertyId === property._id;
                  const isSelected = selectedPropertyId === property._id;
                  const countryIso = property.country?.isoCode?.toLowerCase() || 'global';
                  const citySlug = (property.city || 'all').toLowerCase().replace(/[^a-z0-9]+/g, '-');
                  const propertyUrl = `/properties/${countryIso}/${citySlug}/${property.slug}`;

                  return (
                    <div
                      key={property._id}
                      onMouseEnter={() => setHoveredPropertyId(property._id)}
                      onMouseLeave={() => setHoveredPropertyId(null)}
                      onClick={() => setSelectedPropertyId(property._id)}
                      className={`group rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer ${
                        isHovered || isSelected
                          ? 'border-slate-900 shadow-lg ring-1 ring-slate-900'
                          : 'border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <Link to={propertyUrl} className="block relative h-56 bg-slate-100 overflow-hidden">
                        <img
                          src={
                            property.coverImage ||
                            'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'
                          }
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {property.isFeatured && (
                          <span className="absolute top-3 left-3 bg-[#004274] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Featured
                          </span>
                        )}
                        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-slate-900 shadow-md">
                          {property.currency?.symbol || '€'}
                          {(property.price || 0).toLocaleString()}
                          {property.listingType?.slug?.includes('rent') || property.listingType?.slug === 'short-let'
                            ? ' / night'
                            : ''}
                        </div>
                      </Link>

                      {/* Content */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <Link to={propertyUrl} className="flex-1">
                            <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-[#004274] transition">
                              {property.title}
                            </h3>
                          </Link>
                          <div className="flex items-center text-xs font-bold text-slate-800 ml-2">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 mr-1" />
                            <span>{property.rating || '4.9'}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 flex items-center truncate">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                          <span>
                            {property.area ? `${property.area}, ` : ''}
                            {property.city || property.country?.name}
                          </span>
                        </p>

                        <div className="flex items-center space-x-4 text-xs text-slate-600 pt-1">
                          {property.bedrooms !== undefined && (
                            <span className="flex items-center space-x-1">
                              <Bed className="w-3.5 h-3.5 text-slate-400" />
                              <span>{property.bedrooms} beds</span>
                            </span>
                          )}
                          {property.bathrooms !== undefined && (
                            <span className="flex items-center space-x-1">
                              <Bath className="w-3.5 h-3.5 text-slate-400" />
                              <span>{property.bathrooms} baths</span>
                            </span>
                          )}
                          {property.livingArea && (
                            <span className="flex items-center space-x-1">
                              <Square className="w-3.5 h-3.5 text-slate-400" />
                              <span>{property.livingArea} m²</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Left Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="pt-4 flex items-center justify-between border-t border-slate-100 text-xs">
                  <span className="text-slate-500">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <div className="flex space-x-1">
                    <button
                      disabled={!pagination.hasPrev}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="px-2.5 py-1 border rounded text-slate-700 disabled:opacity-30"
                    >
                      Prev
                    </button>
                    <button
                      disabled={!pagination.hasNext}
                      onClick={() => setPage((p) => p + 1)}
                      className="px-2.5 py-1 border rounded text-slate-700 disabled:opacity-30"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Interactive Real Leaflet Map */}
          <div className="flex-1 h-full relative">
            <PropertyMap
              properties={properties}
              hoveredPropertyId={hoveredPropertyId}
              selectedPropertyId={selectedPropertyId}
              onPropertyHover={setHoveredPropertyId}
              onPropertySelect={setSelectedPropertyId}
              onBoundsChange={handleBoundsChange}
              searchAsMapMoves={searchAsMapMoves}
              onToggleSearchAsMapMoves={setSearchAsMapMoves}
              className="h-full rounded-none border-0"
            />
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* 2. Grid View Mode */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              {pagination?.total || properties.length} Properties Available
            </h2>
            <div className="flex items-center space-x-2 text-xs">
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as any);
                  applyFilters({ sortBy: e.target.value });
                }}
                className="font-bold text-slate-800 bg-transparent focus:outline-none"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popular">Popular</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-slate-100 h-80 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-2xl border border-slate-200">
              <p className="text-slate-800 font-bold mb-2">No properties matched your criteria</p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-[#004274] text-white rounded-lg text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((prop) => (
                <PropertyCard key={prop._id} property={prop} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* 3. Map Only View Mode */
        <div className="flex-1 h-[calc(100vh-4.25rem)] relative">
          <PropertyMap
            properties={properties}
            hoveredPropertyId={hoveredPropertyId}
            selectedPropertyId={selectedPropertyId}
            onPropertyHover={setHoveredPropertyId}
            onPropertySelect={setSelectedPropertyId}
            onBoundsChange={handleBoundsChange}
            searchAsMapMoves={searchAsMapMoves}
            onToggleSearchAsMapMoves={setSearchAsMapMoves}
            className="h-full rounded-none border-0"
          />
        </div>
      )}
    </div>
  );
}
