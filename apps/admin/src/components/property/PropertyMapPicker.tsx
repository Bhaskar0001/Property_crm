import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { MapPin, Search, Check, RefreshCw, XCircle } from 'lucide-react';

interface PropertyMapPickerProps {
  latitude?: number | string;
  longitude?: number | string;
  city?: string;
  country?: string;
  address?: string;
  onChange: (coords: { latitude: number; longitude: number }) => void;
}

// Deterministic instant city coordinates for zero-latency locating
const CITY_CENTERS: Record<string, [number, number]> = {
  // Ireland
  dublin: [53.3498, -6.2603],
  cork: [51.8985, -8.4756],
  galway: [53.2707, -9.0568],
  limerick: [52.6638, -8.6267],
  waterford: [52.2593, -7.1101],
  drogheda: [53.7189, -6.3478],
  dundalk: [54.0039, -6.4022],
  swords: [53.4557, -6.2197],
  bray: [53.2009, -6.0989],
  navan: [53.6528, -6.6814],
  kilkenny: [52.6541, -7.2448],
  sligo: [54.2766, -8.4761],

  // United Kingdom
  london: [51.5074, -0.1278],
  manchester: [53.4808, -2.2426],
  birmingham: [52.4862, -1.8904],
  edinburgh: [55.9533, -3.1883],
  glasgow: [55.8642, -4.2518],
  liverpool: [53.4084, -2.9916],
  bristol: [51.4545, -2.5879],
  leeds: [53.8008, -1.5491],
  sheffield: [53.3811, -1.4701],
  newcastle: [54.9783, -1.6178],
  cardiff: [51.4816, -3.1791],
  belfast: [54.5973, -5.9301],
  cambridge: [52.2053, 0.1218],
  oxford: [51.7520, -1.2577],

  // France
  paris: [48.8566, 2.3522],
  caen: [49.1828, -0.3707],
  lyon: [45.7640, 4.8357],
  marseille: [43.2965, 5.3698],
  nice: [43.7102, 7.2620],
  toulouse: [43.6047, 1.4442],
  bordeaux: [44.8378, -0.5792],
  lille: [50.6292, 3.0573],
  strasbourg: [48.5734, 7.7521],
  nantes: [47.2184, -1.5536],

  // Germany
  berlin: [52.5200, 13.4050],
  munich: [48.1351, 11.5820],
  frankfurt: [50.1109, 8.6821],
  hamburg: [53.5511, 9.9937],
  cologne: [50.9375, 6.9603],
  dusseldorf: [51.2277, 6.7735],
  stuttgart: [48.7758, 9.1829],
  leipzig: [51.3397, 12.3731],

  // Netherlands
  amsterdam: [52.3676, 4.9041],
  rotterdam: [51.9244, 4.4777],
  hague: [52.0705, 4.3007],
  'the hague': [52.0705, 4.3007],
  utrecht: [52.0907, 5.1214],
  eindhoven: [51.4416, 5.4697],
  groningen: [53.2194, 6.5665],

  // UAE & Middle East
  dubai: [25.2048, 55.2708],
  'abu dhabi': [24.4539, 54.3773],
  sharjah: [25.3463, 55.4209],
  doha: [25.2854, 51.5310],
  riyadh: [24.7136, 46.6753],

  // Spain & Italy
  madrid: [40.4168, -3.7038],
  barcelona: [41.3879, 2.1699],
  valencia: [39.4699, -0.3763],
  seville: [37.3891, -5.9845],
  rome: [41.9028, 12.4964],
  milan: [45.4642, 9.1900],
  florence: [43.7696, 11.2558],

  // Other European
  brussels: [50.8503, 4.3517],
  zurich: [47.3769, 8.5417],
  geneva: [46.2044, 6.1432],
  vienna: [48.2082, 16.3738],
  lisbon: [38.7223, -9.1393],
  porto: [41.1579, -8.6291],
  stockholm: [59.3293, 18.0686],
  copenhagen: [55.6761, 12.5683],

  // North America & Australia
  'new york': [40.7128, -74.0060],
  boston: [42.3601, -71.0589],
  toronto: [43.6532, -79.3832],
  vancouver: [49.2827, -123.1207],
  sydney: [-33.8688, 151.2093],
  melbourne: [-37.8136, 144.9631],
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
  const [manualLat, setManualLat] = useState<string>(latitude !== undefined ? String(latitude) : '');
  const [manualLng, setManualLng] = useState<string>(longitude !== undefined ? String(longitude) : '');

  const numLat = latitude !== undefined && latitude !== '' ? Number(latitude) : undefined;
  const numLng = longitude !== undefined && longitude !== '' ? Number(longitude) : undefined;
  const hasValidCoords = typeof numLat === 'number' && !isNaN(numLat) && typeof numLng === 'number' && !isNaN(numLng) && numLat !== 0;

  // Custom Pin Icon
  const createPinIcon = useCallback(() => {
    return L.divIcon({
      className: 'admin-marker-pin',
      html: `
        <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; inset: -4px; border-radius: 50%; background: rgba(0, 66, 116, 0.25); animation: pulse 2s infinite;"></div>
          <div style="background-color: #004274; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.35); border: 2.5px solid white;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 38],
    });
  }, []);

  // Set position helper
  const updatePinPosition = useCallback(
    (lat: number, lng: number, panMap = false) => {
      const cleanLat = Number(lat.toFixed(6));
      const cleanLng = Number(lng.toFixed(6));
      setManualLat(String(cleanLat));
      setManualLng(String(cleanLng));
      onChange({ latitude: cleanLat, longitude: cleanLng });

      const map = mapInstanceRef.current;
      if (!map) return;

      if (markerRef.current) {
        markerRef.current.setLatLng([cleanLat, cleanLng]);
      } else {
        const marker = L.marker([cleanLat, cleanLng], {
          icon: createPinIcon(),
          draggable: true,
        }).addTo(map);

        marker.on('dragend', (dragEv: any) => {
          const pos = dragEv.target.getLatLng();
          const dLat = Number(pos.lat.toFixed(6));
          const dLng = Number(pos.lng.toFixed(6));
          setManualLat(String(dLat));
          setManualLng(String(dLng));
          onChange({ latitude: dLat, longitude: dLng });
        });

        markerRef.current = marker;
      }

      if (panMap) {
        map.flyTo([cleanLat, cleanLng], Math.max(map.getZoom(), 15), { duration: 1 });
      }
    },
    [createPinIcon, onChange]
  );

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const defaultCenter: [number, number] = hasValidCoords
        ? [numLat!, numLng!]
        : [53.3498, -6.2603]; // Default to Dublin / Europe

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: hasValidCoords ? 15 : 11,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Click to pin anywhere
      map.on('click', (e: L.LeafletMouseEvent) => {
        updatePinPosition(e.latlng.lat, e.latlng.lng, false);
      });

      mapInstanceRef.current = map;

      // Invalidate sizes so tiles load properly
      setTimeout(() => map.invalidateSize(), 150);
      setTimeout(() => map.invalidateSize(), 500);

      // If initial valid coords exist, place marker
      if (hasValidCoords) {
        updatePinPosition(numLat!, numLng!, false);
      }
    }

    // ResizeObserver ensures Leaflet updates whenever container changes
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

  // Sync coords if external props change (e.g. data loaded from API)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (hasValidCoords) {
      setManualLat(String(numLat));
      setManualLng(String(numLng));

      if (markerRef.current) {
        markerRef.current.setLatLng([numLat!, numLng!]);
      } else {
        const marker = L.marker([numLat!, numLng!], {
          icon: createPinIcon(),
          draggable: true,
        }).addTo(map);

        marker.on('dragend', (dragEv: any) => {
          const pos = dragEv.target.getLatLng();
          const dLat = Number(pos.lat.toFixed(6));
          const dLng = Number(pos.lng.toFixed(6));
          setManualLat(String(dLat));
          setManualLng(String(dLng));
          onChange({ latitude: dLat, longitude: dLng });
        });

        markerRef.current = marker;
      }

      // Check distance from current map center; if far, pan map
      const center = map.getCenter();
      const dist = Math.abs(center.lat - numLat!) + Math.abs(center.lng - numLng!);
      if (dist > 0.05) {
        map.setView([numLat!, numLng!], 15);
      }
    }
  }, [numLat, numLng, hasValidCoords, createPinIcon, onChange]);

  // Fast Geocode Helper
  const handleAutoLocate = async () => {
    setIsGeocoding(true);

    // 1. Fast local dictionary match
    const normCity = (city || '').toLowerCase().trim();
    if (normCity && CITY_CENTERS[normCity]) {
      const [lat, lng] = CITY_CENTERS[normCity];
      updatePinPosition(lat, lng, true);
      setIsGeocoding(false);
      return;
    }

    const queryParts = [address, city, country].filter(Boolean);
    const query = queryParts.join(', ').trim();

    if (!query) {
      alert('Please enter a City, Town, or Address above first to auto-locate.');
      setIsGeocoding(false);
      return;
    }

    try {
      // 2. Try Photon Komoot API with 4s timeout (Fast, CORS friendly, free)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`;
      const res = await fetch(photonUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].geometry.coordinates;
          updatePinPosition(lat, lng, true);
          setIsGeocoding(false);
          return;
        }
      }
    } catch {
      // Proceed to fallback
    }

    try {
      // 3. Fallback to OpenStreetMap Nominatim with 4s timeout
      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 4000);

      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&limit=1`;
      const res2 = await fetch(nominatimUrl, {
        headers: { 'Accept-Language': 'en' },
        signal: controller2.signal,
      });
      clearTimeout(timeoutId2);

      if (res2.ok) {
        const data2 = await res2.json();
        if (data2 && data2.length > 0) {
          const lat = Number(data2[0].lat);
          const lng = Number(data2[0].lon);
          updatePinPosition(lat, lng, true);
          setIsGeocoding(false);
          return;
        }
      }
    } catch {
      // Nominatim failed or timed out
    }

    // 4. Fallback to Dublin city center if nothing matched
    const [defLat, defLng] = [53.3498, -6.2603];
    updatePinPosition(defLat, defLng, true);
    setIsGeocoding(false);
  };

  // Handle Manual Input Apply
  const handleApplyManual = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      updatePinPosition(lat, lng, true);
    }
  };

  // Clear pin
  const handleClearPin = () => {
    setManualLat('');
    setManualLng('');
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    onChange({ latitude: 0, longitude: 0 });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-bold text-gray-800 flex items-center space-x-1.5">
          <MapPin className="w-4 h-4 text-[#004274]" />
          <span>Interactive Location & Geo-Coordinates Pin</span>
        </label>

        <button
          type="button"
          onClick={handleAutoLocate}
          disabled={isGeocoding}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#004274] rounded-lg text-xs font-bold border border-slate-300 transition shadow-xs disabled:opacity-60 cursor-pointer"
        >
          <Search className={`w-3.5 h-3.5 ${isGeocoding ? 'animate-spin' : ''}`} />
          <span>{isGeocoding ? 'Searching coordinates...' : 'Auto-Locate from City / Address'}</span>
        </button>
      </div>

      {/* Map Container */}
      <div className="relative h-72 sm:h-80 w-full rounded-xl overflow-hidden border border-gray-300 shadow-inner bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
        <div className="absolute top-2.5 left-2.5 z-[1000] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-700 shadow-md border border-slate-200 pointer-events-none">
          Click map to drop pin, or drag pin to exact building
        </div>
      </div>

      {/* Coordinates Status Bar & Manual Inputs */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">Pinned Location:</span>
            {hasValidCoords ? (
              <span className="font-mono text-[#004274] font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                {numLat}, {numLng}
              </span>
            ) : (
              <span className="italic text-slate-400">No pin set yet. Click on the map or click auto-locate.</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {hasValidCoords && (
              <>
                <span className="inline-flex items-center text-emerald-700 font-bold text-[11px]">
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Coords Active
                </span>
                <button
                  type="button"
                  onClick={handleClearPin}
                  title="Clear coordinates"
                  className="text-rose-600 hover:text-rose-800 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" /> Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Manual Latitude & Longitude Input Row */}
        <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="text-[11px] font-semibold text-slate-500">Fine-tune GPS:</span>
          <div className="flex items-center space-x-1">
            <span className="text-[10px] uppercase font-mono text-slate-400">Lat:</span>
            <input
              type="text"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
              placeholder="e.g. 53.3498"
              className="w-28 px-2 py-1 text-xs border border-slate-300 rounded bg-white font-mono"
            />
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-[10px] uppercase font-mono text-slate-400">Lng:</span>
            <input
              type="text"
              value={manualLng}
              onChange={(e) => setManualLng(e.target.value)}
              placeholder="e.g. -6.2603"
              className="w-28 px-2 py-1 text-xs border border-slate-300 rounded bg-white font-mono"
            />
          </div>
          <button
            type="button"
            onClick={handleApplyManual}
            className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-semibold text-[11px] transition flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Set Pin
          </button>
        </div>
      </div>
    </div>
  );
}
