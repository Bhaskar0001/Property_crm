import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Search, Check } from 'lucide-react';

interface PropertyMapPickerProps {
  latitude?: number | string;
  longitude?: number | string;
  city?: string;
  country?: string;
  address?: string;
  onChange: (coords: { latitude: number; longitude: number }) => void;
}

// Known coordinates for fast deterministic city jump
const CITY_CENTERS: Record<string, [number, number]> = {
  amsterdam: [52.3676, 4.9041],
  rotterdam: [51.9244, 4.4777],
  hague: [52.0705, 4.3007],
  berlin: [52.5200, 13.4050],
  munich: [48.1351, 11.5820],
  paris: [48.8566, 2.3522],
  caen: [49.1828, -0.3707],
  london: [51.5074, -0.1278],
  dublin: [53.3498, -6.2603],
  cork: [51.8985, -8.4756],
  galway: [53.2707, -9.0568],
  dubai: [25.2048, 55.2708],
  'abu dhabi': [24.4539, 54.3773],
  brussels: [50.8503, 4.3517],
  zurich: [47.3769, 8.5417],
  madrid: [40.4168, -3.7038],
  barcelona: [41.3879, 2.1699],
  rome: [41.9028, 12.4964],
  'new york': [40.7128, -74.0060],
};

export function PropertyMapPicker({
  latitude,
  longitude,
  city = '',
  country = '',
  address = '',
  onChange,
}: PropertyMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [pinnedCoords, setPinnedCoords] = useState<{ lat: number; lng: number } | null>(null);

  const numLat = latitude ? Number(latitude) : undefined;
  const numLng = longitude ? Number(longitude) : undefined;
  const hasValidCoords = typeof numLat === 'number' && !isNaN(numLat) && typeof numLng === 'number' && !isNaN(numLng) && numLat !== 0;

  // Custom Pin Icon
  const createPinIcon = () => {
    return L.divIcon({
      className: 'admin-marker-pin',
      html: `
        <div style="background-color: #004274; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2.5px solid white;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const defaultCenter: [number, number] = hasValidCoords
        ? [numLat!, numLng!]
        : [52.3676, 4.9041]; // Default to Amsterdam / Europe

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: hasValidCoords ? 14 : 10,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Click to pin
      map.on('click', (e: L.LeafletMouseEvent) => {
        const lat = Number(e.latlng.lat.toFixed(6));
        const lng = Number(e.latlng.lng.toFixed(6));
        setPinnedCoords({ lat, lng });
        onChange({ latitude: lat, longitude: lng });

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], {
            icon: createPinIcon(),
            draggable: true,
          }).addTo(map);

          markerRef.current.on('dragend', (dragEv: any) => {
            const pos = dragEv.target.getLatLng();
            const dLat = Number(pos.lat.toFixed(6));
            const dLng = Number(pos.lng.toFixed(6));
            setPinnedCoords({ lat: dLat, lng: dLng });
            onChange({ latitude: dLat, longitude: dLng });
          });
        }
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker position if props change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (hasValidCoords) {
      setPinnedCoords({ lat: numLat!, lng: numLng! });
      if (markerRef.current) {
        markerRef.current.setLatLng([numLat!, numLng!]);
      } else {
        markerRef.current = L.marker([numLat!, numLng!], {
          icon: createPinIcon(),
          draggable: true,
        }).addTo(map);

        markerRef.current.on('dragend', (dragEv: any) => {
          const pos = dragEv.target.getLatLng();
          const dLat = Number(pos.lat.toFixed(6));
          const dLng = Number(pos.lng.toFixed(6));
          setPinnedCoords({ lat: dLat, lng: dLng });
          onChange({ latitude: dLat, longitude: dLng });
        });
      }
    }
  }, [numLat, numLng, hasValidCoords]);

  // Handle Auto-Locate by Address / City
  const handleAutoLocate = async () => {
    setIsGeocoding(true);
    const map = mapInstanceRef.current;

    // 1. Check known city centers first
    const normCity = city.toLowerCase().trim();
    if (normCity && CITY_CENTERS[normCity]) {
      const [lat, lng] = CITY_CENTERS[normCity];
      setPinnedCoords({ lat, lng });
      onChange({ latitude: lat, longitude: lng });
      if (map) {
        map.flyTo([lat, lng], 14, { duration: 1.2 });
      }
      setIsGeocoding(false);
      return;
    }

    // 2. Try OpenStreetMap Nominatim Free Geocoder
    const query = [address, city, country].filter(Boolean).join(', ');
    if (!query) {
      alert('Please enter a City or Address first to auto-locate.');
      setIsGeocoding(false);
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = Number(Number(data[0].lat).toFixed(6));
        const lng = Number(Number(data[0].lon).toFixed(6));
        setPinnedCoords({ lat, lng });
        onChange({ latitude: lat, longitude: lng });
        if (map) {
          map.flyTo([lat, lng], 15, { duration: 1.5 });
        }
      } else {
        // Fallback to Dublin
        const [lat, lng] = [53.3498, -6.2603];
        setPinnedCoords({ lat, lng });
        onChange({ latitude: lat, longitude: lng });
        if (map) map.flyTo([lat, lng], 13);
      }
    } catch {
      alert('Geocoding service unavailable. You can click anywhere on the map to set the pin.');
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-gray-800 flex items-center space-x-1">
          <MapPin className="w-3.5 h-3.5 text-[#004274]" />
          <span>Interactive Location & Geo-Coordinates Pin</span>
        </label>

        <button
          type="button"
          onClick={handleAutoLocate}
          disabled={isGeocoding}
          className="inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-[#004274] rounded-md text-xs font-semibold border border-slate-300 transition"
        >
          <Search className={`w-3.5 h-3.5 ${isGeocoding ? 'animate-spin' : ''}`} />
          <span>{isGeocoding ? 'Locating...' : 'Auto-Locate from City / Address'}</span>
        </button>
      </div>

      {/* Map Container */}
      <div className="relative h-64 sm:h-72 w-full rounded-xl overflow-hidden border border-gray-300 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
        <div className="absolute top-2.5 left-2.5 z-[1000] bg-white/90 backdrop-blur-md px-3 py-1 rounded-md text-[11px] font-semibold text-slate-700 shadow-sm border border-slate-200">
          Click map to drop or drag pin to exact location
        </div>
      </div>

      {/* Coordinate status */}
      <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-700">Pinned Coordinates:</span>
          {pinnedCoords ? (
            <span className="font-mono text-[#004274] font-bold">
              {pinnedCoords.lat}, {pinnedCoords.lng}
            </span>
          ) : (
            <span className="italic text-slate-400">Click on the map or click auto-locate</span>
          )}
        </div>

        {pinnedCoords && (
          <span className="inline-flex items-center text-emerald-700 font-semibold text-[11px]">
            <Check className="w-3.5 h-3.5 mr-1" /> Location Coordinates Set
          </span>
        )}
      </div>
    </div>
  );
}
