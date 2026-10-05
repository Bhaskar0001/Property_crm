import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import {
  Navigation,
  Maximize2,
  Minimize2,
  Plus,
  Minus,
  RefreshCw,
  Bed,
  Bath,
  Square,
  Star,
  ExternalLink,
} from 'lucide-react';
import { PublicProperty } from '../../types';

interface PropertyMapProps {
  properties?: PublicProperty[];
  hoveredPropertyId?: string | null;
  selectedPropertyId?: string | null;
  onPropertyHover?: (id: string | null) => void;
  onPropertySelect?: (id: string) => void;
  onBoundsChange?: (bounds: { neLat: number; neLng: number; swLat: number; swLng: number }) => void;
  searchAsMapMoves?: boolean;
  onToggleSearchAsMapMoves?: (enabled: boolean) => void;
  className?: string;
}

export function PropertyMap({
  properties = [],
  hoveredPropertyId,
  selectedPropertyId,
  onPropertyHover,
  onPropertySelect,
  onBoundsChange,
  searchAsMapMoves = false,
  onToggleSearchAsMapMoves,
  className = '',
}: PropertyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const [mapMoved, setMapMoved] = useState(false);
  const [activePopupProperty, setActivePopupProperty] = useState<PublicProperty | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Keep latest callbacks/states in refs to prevent stale closure inside Leaflet listeners
  const searchAsMapMovesRef = useRef(searchAsMapMoves);
  searchAsMapMovesRef.current = searchAsMapMoves;
  const onBoundsChangeRef = useRef(onBoundsChange);
  onBoundsChangeRef.current = onBoundsChange;
  const isProgrammaticMoveRef = useRef(false);

  // Filter properties with valid numeric coordinates
  const safeProperties = properties || [];
  const geoProperties = safeProperties.filter(
    (p) =>
      p &&
      typeof p.latitude === 'number' &&
      !isNaN(p.latitude) &&
      typeof p.longitude === 'number' &&
      !isNaN(p.longitude) &&
      p.latitude !== 0 &&
      p.longitude !== 0
  );

  // Format currency price pill
  const formatPillPrice = useCallback((p: PublicProperty) => {
    const symbol = p.currency?.symbol || '€';
    const price = p.price || 0;
    if (price >= 1_000_000) {
      return `${symbol}${(price / 1_000_000).toFixed(1)}M`;
    }
    if (price >= 1_000) {
      return `${symbol}${Math.round(price / 1_000)}k`;
    }
    return `${symbol}${price.toLocaleString()}`;
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default initial view: Center on Dublin / Europe
      const map = L.map(mapContainerRef.current, {
        center: [53.3498, -6.2603],
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });

      // CartoDB Positron basemap with OpenStreetMap fallback
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      }).addTo(map);

      // Attribution
      L.control
        .attribution({ position: 'bottomright', prefix: false })
        .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>')
        .addTo(map);

      // Listen to map moveend for "Search as I move the map"
      map.on('moveend', () => {
        if (isProgrammaticMoveRef.current) {
          isProgrammaticMoveRef.current = false;
          return;
        }

        setMapMoved(true);

        if (searchAsMapMovesRef.current && onBoundsChangeRef.current) {
          const bounds = map.getBounds();
          onBoundsChangeRef.current({
            neLat: bounds.getNorthEast().lat,
            neLng: bounds.getNorthEast().lng,
            swLat: bounds.getSouthWest().lat,
            swLng: bounds.getSouthWest().lng,
          });
        }
      });

      mapInstanceRef.current = map;

      // Invalidate size after layout settles
      setTimeout(() => {
        map.invalidateSize();
      }, 150);
      setTimeout(() => {
        map.invalidateSize();
      }, 500);
    }

    // ResizeObserver ensures Leaflet updates whenever container size changes
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when geoProperties change
  const propertySignature = geoProperties.map((p) => `${p._id}:${p.latitude}:${p.longitude}:${p.price}`).join('|');

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    if (geoProperties.length === 0) return;

    const bounds = L.latLngBounds([]);

    geoProperties.forEach((property) => {
      const lat = property.latitude!;
      const lng = property.longitude!;
      const latLng = L.latLng(lat, lng);
      bounds.extend(latLng);

      const priceText = formatPillPrice(property);
      const isHovered = hoveredPropertyId === property._id;
      const isSelected = selectedPropertyId === property._id;

      // Custom DivIcon
      const icon = L.divIcon({
        className: 'leaflet-price-pin',
        html: `
          <button 
            type="button"
            id="map-pin-${property._id}"
            class="price-marker-pill ${isHovered || isSelected ? 'active' : ''} inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
              isHovered || isSelected
                ? 'bg-slate-950 text-white ring-2 ring-[#004274]'
                : 'bg-white text-slate-900 border border-slate-300/80 shadow-md hover:border-slate-800'
            }"
            style="white-space: nowrap; transform-origin: center center;"
          >
            <span>${priceText}</span>
          </button>
        `,
        iconSize: [64, 28],
        iconAnchor: [32, 14],
      });

      const marker = L.marker(latLng, { icon }).addTo(map);

      // Marker Interactions
      marker.on('click', () => {
        setActivePopupProperty(property);
        if (onPropertySelect) onPropertySelect(property._id);
        map.panTo(latLng, { animate: true, duration: 0.4 });
      });

      marker.on('mouseover', () => {
        if (onPropertyHover) onPropertyHover(property._id);
      });

      marker.on('mouseout', () => {
        if (onPropertyHover) onPropertyHover(null);
      });

      markersRef.current.set(property._id, marker);
    });

    // Auto-fit bounds if we have markers and user hasn't actively dragged the map
    if (bounds.isValid() && !mapMoved) {
      isProgrammaticMoveRef.current = true;
      if (geoProperties.length === 1) {
        map.setView(bounds.getCenter(), 14, { animate: false });
      } else {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: false });
      }
    }
  }, [propertySignature, formatPillPrice, onPropertyHover, onPropertySelect]);

  // Update marker styles when hover or selection changes (without recreating markers)
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const el = marker.getElement();
      if (!el) return;
      const pill = el.querySelector('.price-marker-pill');
      if (!pill) return;

      if (id === hoveredPropertyId || id === selectedPropertyId) {
        pill.classList.add('active');
        pill.classList.add('bg-slate-950', 'text-white', 'scale-110');
        pill.classList.remove('bg-white', 'text-slate-900');
        marker.setZIndexOffset(1000);
      } else {
        pill.classList.remove('active', 'scale-110', 'bg-slate-950', 'text-white');
        pill.classList.add('bg-white', 'text-slate-900');
        marker.setZIndexOffset(0);
      }
    });
  }, [hoveredPropertyId, selectedPropertyId]);

  // Handle Search This Area Click
  const handleSearchThisArea = () => {
    const map = mapInstanceRef.current;
    if (!map || !onBoundsChangeRef.current) return;
    const bounds = map.getBounds();
    onBoundsChangeRef.current({
      neLat: bounds.getNorthEast().lat,
      neLng: bounds.getNorthEast().lng,
      swLat: bounds.getSouthWest().lat,
      swLng: bounds.getSouthWest().lng,
    });
    setMapMoved(false);
  };

  // Zoom controls
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  // Locate User
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        mapInstanceRef.current?.flyTo([latitude, longitude], 13, { duration: 1.2 });
      },
      () => {
        setIsLocating(false);
        alert('Unable to retrieve your current location.');
      }
    );
  };

  // Fit All Bounds
  const handleFitAll = () => {
    const map = mapInstanceRef.current;
    if (!map || geoProperties.length === 0) return;
    const bounds = L.latLngBounds([]);
    geoProperties.forEach((p) => bounds.extend([p.latitude!, p.longitude!]));
    if (bounds.isValid()) {
      isProgrammaticMoveRef.current = true;
      if (geoProperties.length === 1) {
        map.setView(bounds.getCenter(), 14, { animate: true });
      } else {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true });
      }
      setMapMoved(false);
    }
  };

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!isFullscreen) {
      if (mapContainerRef.current.requestFullscreen) {
        mapContainerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div className={`relative w-full h-full min-h-[450px] overflow-hidden rounded-xl border border-slate-200 shadow-sm ${className}`}>
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Top Center: Search As I Move The Map */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center space-x-2">
        <label
          htmlFor="search-as-move"
          className="flex items-center space-x-2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-slate-200/90 text-xs font-semibold text-slate-800 cursor-pointer hover:bg-white transition-all select-none"
        >
          <input
            id="search-as-move"
            type="checkbox"
            checked={searchAsMapMoves}
            onChange={(e) => onToggleSearchAsMapMoves?.(e.target.checked)}
            className="w-4 h-4 rounded text-[#004274] focus:ring-[#004274] border-slate-300"
          />
          <span>Search as I move the map</span>
        </label>

        {!searchAsMapMoves && mapMoved && (
          <button
            type="button"
            onClick={handleSearchThisArea}
            className="flex items-center space-x-1.5 bg-[#004274] text-white px-3.5 py-2 rounded-full shadow-lg text-xs font-bold hover:bg-[#003156] transition-all animate-bounce"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Search this area</span>
          </button>
        )}
      </div>

      {/* Floating Map Controls (Right Side) */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2">
        <button
          type="button"
          onClick={toggleFullscreen}
          title="Toggle Fullscreen"
          className="w-9 h-9 bg-white/95 backdrop-blur-md rounded-lg shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:text-black hover:bg-white transition"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={handleLocateMe}
          title="Find my location"
          disabled={isLocating}
          className="w-9 h-9 bg-white/95 backdrop-blur-md rounded-lg shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:text-[#004274] hover:bg-white transition disabled:opacity-50"
        >
          <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin text-[#004274]' : ''}`} />
        </button>

        {geoProperties.length > 0 && (
          <button
            type="button"
            onClick={handleFitAll}
            title="Fit all properties"
            className="w-9 h-9 bg-white/95 backdrop-blur-md rounded-lg shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:text-[#004274] hover:bg-white transition text-xs font-bold"
          >
            ALL
          </button>
        )}

        <div className="flex flex-col bg-white/95 backdrop-blur-md rounded-lg shadow-md border border-slate-200 overflow-hidden divide-y divide-slate-100">
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom in"
            className="w-9 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom out"
            className="w-9 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Property Card Popup (Bottom Center / Left) */}
      {activePopupProperty && (
        <div className="absolute bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:w-80 z-[1000] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
          <div className="relative h-40 bg-slate-100 overflow-hidden">
            <img
              src={
                activePopupProperty.coverImage ||
                'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'
              }
              alt={activePopupProperty.title}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => setActivePopupProperty(null)}
              className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition text-sm font-bold"
            >
              &times;
            </button>
            <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-md">
              {activePopupProperty.currency?.symbol || '€'}
              {(activePopupProperty.price || 0).toLocaleString()}
              {activePopupProperty.listingType?.slug?.includes('rent') ? ' / mo' : ''}
            </div>
          </div>

          <div className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                {activePopupProperty.title}
              </h4>
            </div>

            <p className="text-xs text-slate-500 flex items-center truncate">
              {activePopupProperty.area ? `${activePopupProperty.area}, ` : ''}
              {activePopupProperty.city || 'Location available'}
            </p>

            {/* Spec pills */}
            <div className="flex items-center space-x-3 text-xs text-slate-600 pt-1">
              {activePopupProperty.bedrooms !== undefined && (
                <span className="flex items-center space-x-1">
                  <Bed className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activePopupProperty.bedrooms} beds</span>
                </span>
              )}
              {activePopupProperty.bathrooms !== undefined && (
                <span className="flex items-center space-x-1">
                  <Bath className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activePopupProperty.bathrooms} baths</span>
                </span>
              )}
              {activePopupProperty.livingArea && (
                <span className="flex items-center space-x-1">
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activePopupProperty.livingArea} m²</span>
                </span>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <div className="flex items-center text-xs text-slate-700 font-semibold">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 mr-1" />
                <span>{activePopupProperty.rating || '4.9'}</span>
                <span className="text-slate-400 ml-1">
                  ({activePopupProperty.reviewsCount || 5} reviews)
                </span>
              </div>

              <Link
                to={`/properties/${
                  activePopupProperty.country?.isoCode?.toLowerCase() || 'global'
                }/${(activePopupProperty.city || 'all')
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')}/${activePopupProperty.slug}`}
                className="inline-flex items-center space-x-1 text-xs font-bold text-[#004274] hover:underline"
              >
                <span>Details</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
