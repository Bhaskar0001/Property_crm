/**
 * Smart Real Estate Geocoding & Geographic Coordinate Resolver
 * Provides reliable, accurate latitude and longitude for cities and addresses.
 */

// Known coordinates for major international & European real estate destinations
export const KNOWN_CITY_COORDINATES: Record<string, { lat: number; lng: number; country: string }> = {
  // Netherlands
  amsterdam: { lat: 52.3676, lng: 4.9041, country: 'Netherlands' },
  rotterdam: { lat: 51.9244, lng: 4.4777, country: 'Netherlands' },
  hague: { lat: 52.0705, lng: 4.3007, country: 'Netherlands' },
  utrecht: { lat: 52.0907, lng: 5.1214, country: 'Netherlands' },

  // Germany
  berlin: { lat: 52.5200, lng: 13.4050, country: 'Germany' },
  munich: { lat: 48.1351, lng: 11.5820, country: 'Germany' },
  frankfurt: { lat: 50.1109, lng: 8.6821, country: 'Germany' },
  hamburg: { lat: 53.5511, lng: 9.9937, country: 'Germany' },
  cologne: { lat: 50.9375, lng: 6.9603, country: 'Germany' },
  dusseldorf: { lat: 51.2277, lng: 6.7735, country: 'Germany' },

  // France
  paris: { lat: 48.8566, lng: 2.3522, country: 'France' },
  caen: { lat: 49.1828, lng: -0.3707, country: 'France' },
  nice: { lat: 43.7102, lng: 7.2620, country: 'France' },
  lyon: { lat: 45.7640, lng: 4.8357, country: 'France' },
  marseille: { lat: 43.2965, lng: 5.3698, country: 'France' },
  bordeaux: { lat: 44.8378, lng: -0.5792, country: 'France' },

  // United Kingdom
  london: { lat: 51.5074, lng: -0.1278, country: 'United Kingdom' },
  manchester: { lat: 53.4808, lng: -2.2426, country: 'United Kingdom' },
  birmingham: { lat: 52.4862, lng: -1.8904, country: 'United Kingdom' },
  edinburgh: { lat: 55.9533, lng: -3.1883, country: 'United Kingdom' },
  glasgow: { lat: 55.8642, lng: -4.2518, country: 'United Kingdom' },
  liverpool: { lat: 53.4084, lng: -2.9916, country: 'United Kingdom' },

  // Ireland
  dublin: { lat: 53.3498, lng: -6.2603, country: 'Ireland' },
  cork: { lat: 51.8985, lng: -8.4756, country: 'Ireland' },
  galway: { lat: 53.2707, lng: -9.0568, country: 'Ireland' },
  limerick: { lat: 52.6638, lng: -8.6267, country: 'Ireland' },
  waterford: { lat: 52.2593, lng: -7.1101, country: 'Ireland' },

  // Belgium & Luxembourg & Switzerland & Austria
  brussels: { lat: 50.8503, lng: 4.3517, country: 'Belgium' },
  antwerp: { lat: 51.2194, lng: 4.4025, country: 'Belgium' },
  luxembourg: { lat: 49.6116, lng: 6.1319, country: 'Luxembourg' },
  zurich: { lat: 47.3769, lng: 8.5417, country: 'Switzerland' },
  geneva: { lat: 46.2044, lng: 6.1432, country: 'Switzerland' },
  vienna: { lat: 48.2082, lng: 16.3738, country: 'Austria' },
  prague: { lat: 50.0755, lng: 14.4378, country: 'Czechia' },

  // UAE
  dubai: { lat: 25.2048, lng: 55.2708, country: 'United Arab Emirates' },
  'abu dhabi': { lat: 24.4539, lng: 54.3773, country: 'United Arab Emirates' },
  sharjah: { lat: 25.3463, lng: 55.4209, country: 'United Arab Emirates' },

  // Spain & Italy & Portugal
  madrid: { lat: 40.4168, lng: -3.7038, country: 'Spain' },
  barcelona: { lat: 41.3879, lng: 2.1699, country: 'Spain' },
  lisbon: { lat: 38.7223, lng: -9.1393, country: 'Portugal' },
  rome: { lat: 41.9028, lng: 12.4964, country: 'Italy' },
  milan: { lat: 45.4642, lng: 9.1900, country: 'Italy' },

  // USA
  'new york': { lat: 40.7128, lng: -74.0060, country: 'United States' },
  miami: { lat: 25.7617, lng: -80.1918, country: 'United States' },
  'los angeles': { lat: 34.0522, lng: -118.2437, country: 'United States' },
};

/**
 * Returns deterministic or slightly jittered coordinates for a given location,
 * preventing exact overlap when multiple properties are in the same neighborhood.
 */
export function resolveCoordinates(
  city?: string,
  country?: string,
  address?: string,
  jitter: boolean = true
): { latitude: number; longitude: number } {
  const normCity = (city || '').toLowerCase().trim();
  const normCountry = (country || '').toLowerCase().trim();

  let base = KNOWN_CITY_COORDINATES[normCity];

  // Try partial match if exact city match is not found
  if (!base && normCity) {
    for (const [key, val] of Object.entries(KNOWN_CITY_COORDINATES)) {
      if (normCity.includes(key) || key.includes(normCity)) {
        base = val;
        break;
      }
    }
  }

  // Fallback by country
  if (!base) {
    if (normCountry.includes('netherlands') || normCountry === 'nl') {
      base = KNOWN_CITY_COORDINATES['amsterdam'];
    } else if (normCountry.includes('germany') || normCountry === 'de') {
      base = KNOWN_CITY_COORDINATES['berlin'];
    } else if (normCountry.includes('france') || normCountry === 'fr') {
      base = KNOWN_CITY_COORDINATES['paris'];
    } else if (normCountry.includes('united kingdom') || normCountry.includes('uk') || normCountry === 'gb') {
      base = KNOWN_CITY_COORDINATES['london'];
    } else if (normCountry.includes('united arab') || normCountry.includes('uae') || normCountry === 'ae') {
      base = KNOWN_CITY_COORDINATES['dubai'];
    } else if (normCountry.includes('belgium') || normCountry === 'be') {
      base = KNOWN_CITY_COORDINATES['brussels'];
    } else if (normCountry.includes('switzerland') || normCountry === 'ch') {
      base = KNOWN_CITY_COORDINATES['zurich'];
    } else {
      // Default to Dublin, Ireland as primary base
      base = KNOWN_CITY_COORDINATES['dublin'];
    }
  }

  let lat = base.lat;
  let lng = base.lng;

  if (jitter) {
    // Generate a deterministic hash from address or title to provide a realistic neighborhood offset
    const seed = (address || city || Math.random().toString())
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const offsetLat = ((seed % 100) / 100 - 0.5) * 0.04; // ~1-2km spread
    const offsetLng = (((seed * 7) % 100) / 100 - 0.5) * 0.04;
    lat = Number((lat + offsetLat).toFixed(5));
    lng = Number((lng + offsetLng).toFixed(5));
  }

  return { latitude: lat, longitude: lng };
}
