import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

interface SinglePropertyMapProps {
  latitude?: number;
  longitude?: number;
  title: string;
  address?: string;
  area?: string;
  city?: string;
  country?: string;
  price?: number;
  currencySymbol?: string;
}

export function SinglePropertyMap({
  latitude,
  longitude,
  title,
  address,
  area,
  city,
  country,
  price,
  currencySymbol = '€',
}: SinglePropertyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const hasCoords =
    typeof latitude === 'number' &&
    !isNaN(latitude) &&
    typeof longitude === 'number' &&
    !isNaN(longitude) &&
    latitude !== 0 &&
    longitude !== 0;

  const fullLocationText = [address, area, city, country].filter(Boolean).join(', ');

  useEffect(() => {
    if (!hasCoords || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [latitude!, longitude!],
        zoom: 15,
        attributionControl: false,
        scrollWheelZoom: false, // Don't hijack page scroll
      });

      // CartoDB Positron high-resolution basemap
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Attribution
      L.control
        .attribution({ position: 'bottomright', prefix: false })
        .addAttribution('&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>')
        .addTo(map);

      // Custom Branded AbroadAccommodation Pin
      const pinIcon = L.divIcon({
        className: 'single-property-marker-pin',
        html: `
          <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; inset: -4px; border-radius: 50%; background: rgba(0, 66, 116, 0.25); animation: pulse 2s infinite;"></div>
            <div style="background-color: #004274; color: white; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.35); border: 2.5px solid white;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 44],
      });

      const marker = L.marker([latitude!, longitude!], { icon: pinIcon }).addTo(map);

      if (price) {
        marker.bindPopup(`
          <div style="font-family: inherit; padding: 4px;">
            <p style="font-weight: 800; font-size: 13px; margin: 0; color: #004274;">${currencySymbol}${price.toLocaleString()}</p>
            <p style="font-size: 11px; margin: 2px 0 0; color: #475569;">${title}</p>
          </div>
        `);
      }

      mapInstanceRef.current = map;

      // Invalidate sizes after layout
      setTimeout(() => map.invalidateSize(), 150);
      setTimeout(() => map.invalidateSize(), 500);
    }

    // ResizeObserver
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
  }, [hasCoords, latitude, longitude, title, price, currencySymbol]);

  const googleMapsDirectionsUrl = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullLocationText)}`;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-[#004274]" />
            <span>Property Location & Neighborhood</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {fullLocationText || 'Neighborhood map preview'}
          </p>
        </div>

        <a
          href={googleMapsDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#004274] rounded-lg text-xs font-bold transition shadow-xs self-start sm:self-auto"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Get Directions</span>
          <ExternalLink className="w-3 h-3 ml-0.5 text-slate-400" />
        </a>
      </div>

      {hasCoords ? (
        <div className="relative h-72 sm:h-96 w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner">
          <div ref={mapContainerRef} className="w-full h-full z-0" />
          <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-slate-800 shadow-md border border-slate-200 pointer-events-none">
            {area ? `${area}, ` : ''}{city || country}
          </div>
        </div>
      ) : (
        <div className="h-48 rounded-xl bg-slate-50 border border-dashed border-slate-300 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
            <MapPin className="w-5 h-5" />
          </div>
          <p className="text-sm font-bold text-slate-700">{fullLocationText || 'Location Details'}</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Exact pin coordinates are shared upon viewing appointment confirmation.
          </p>
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center space-x-1 text-xs font-bold text-[#004274] hover:underline"
          >
            <span>Explore {city || 'Neighborhood'} on Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}
