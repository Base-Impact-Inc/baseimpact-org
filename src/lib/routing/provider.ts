/**
 * Routing Provider Interface
 *
 * Abstract interface for road-network distance matrix providers.
 * Supports Stadia Maps, self-hosted OSRM/Valhalla, and Google Distance Matrix.
 *
 * Architecture:
 * 1. Client/server use Haversine for instant sort of all results
 * 2. Top N closest upgraded via batched matrix call (1 origin to many destinations)
 * 3. Displayed distances replaced with road miles; top N re-sorted
 * 4. Results cached in sessionStorage keyed by (origin, provider, mode)
 * 5. Graceful fallback to Haversine if API fails or no key configured
 */

export type TravelMode = 'walking' | 'driving' | 'transit';

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface MatrixRequest {
  origin: Coordinate;
  destinations: Coordinate[];
  mode: TravelMode;
}

export interface MatrixElement {
  distanceMiles: number;
  durationSeconds?: number;
  reachable: boolean;
}

export interface MatrixResponse {
  elements: MatrixElement[];
  meta?: {
    provider: string;
    mode: TravelMode;
    timestamp: number;
  };
}

export interface RoutingProvider {
  readonly id: string;
  readonly name: string;
  readonly supportedModes: TravelMode[];
  readonly requiresApiKey: boolean;
  readonly freeTierLimit?: string;
  getMatrix(request: MatrixRequest): Promise<MatrixResponse>;
  healthCheck(): Promise<boolean>;
}

export class HaversineProvider implements RoutingProvider {
  readonly id = 'haversine';
  readonly name = 'Straight-line (Haversine)';
  readonly supportedModes: TravelMode[] = ['walking', 'driving', 'transit'];
  readonly requiresApiKey = false;
  readonly freeTierLimit = 'Unlimited (client-side)';

  private static readonly EARTH_RADIUS_MILES = 3958.8;

  getMatrix(request: MatrixRequest): Promise<MatrixResponse> {
    const { origin, destinations } = request;
    const elements: MatrixElement[] = destinations.map((dest) => ({
      distanceMiles: this.haversineMiles(origin.lat, origin.lng, dest.lat, dest.lng),
      durationSeconds: undefined,
      reachable: true,
    }));
    return Promise.resolve({
      elements,
      meta: { provider: this.id, mode: request.mode, timestamp: Date.now() },
    });
  }

  healthCheck(): Promise<boolean> {
    return Promise.resolve(true);
  }

  private haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = HaversineProvider.EARTH_RADIUS_MILES;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
  }
}

import { OSRMProvider } from './osrm.js';

export const providerRegistry = new Map<string, () => RoutingProvider>([
  ['haversine', () => new HaversineProvider()],
  ['osrm', () => new OSRMProvider()],
  // Stadia needs STADIA_API_KEY; register explicitly once the owner supplies it.
  // ['stadia', () => new StadiaProvider()],
  // ['valhalla', () => new ValhallaProvider()],
  // ['google', () => new GoogleProvider()],
]);

export function getProvider(providerId?: string): RoutingProvider {
  const id = providerId || 'haversine';
  const factory = providerRegistry.get(id);
  if (!factory) {
    console.warn('Routing provider "' + id + '" not registered, falling back to Haversine');
    return new HaversineProvider();
  }
  try {
    return factory();
  } catch (e) {
    console.error('Failed to instantiate provider "' + id + '":', e);
    return new HaversineProvider();
  }
}

export interface ResourceWithCoords {
  id: string;
  lat: number;
  lng: number;
  distanceMiles?: number;
  [key: string]: any;
}

export interface HybridSortOptions {
  upgradeLimit?: number;
  mode?: TravelMode;
  provider?: RoutingProvider;
  origin: Coordinate;
  cacheKey?: string;
}

export async function upgradeDistances(
  resources: ResourceWithCoords[],
  options: HybridSortOptions
): Promise<ResourceWithCoords[]> {
  const {
    upgradeLimit = 20,
    mode = 'driving',
    provider = getProvider(),
    origin,
    cacheKey,
  } = options;

  const sorted = [...resources].sort((a, b) => (a.distanceMiles || 9999) - (b.distanceMiles || 9999));
  const toUpgrade = sorted.slice(0, upgradeLimit);
  const remaining = sorted.slice(upgradeLimit);

  if (toUpgrade.length === 0) return sorted;

  if (cacheKey) {
    const cached = getCachedDistances(cacheKey, origin, provider.id, mode, toUpgrade);
    if (cached) {
      applyCachedDistances(toUpgrade, cached);
      return [...toUpgrade, ...remaining].sort((a, b) => (a.distanceMiles || 9999) - (b.distanceMiles || 9999));
    }
  }

  try {
    const destinations = toUpgrade.map((r) => ({ lat: r.lat, lng: r.lng }));
    const response = await provider.getMatrix({ origin, destinations, mode });

    toUpgrade.forEach((resource, index) => {
      const element = response.elements[index];
      if (element.reachable && Number.isFinite(element.distanceMiles)) {
        resource.distanceMiles = element.distanceMiles;
      }
    });

    if (cacheKey) {
      cacheDistances(cacheKey, origin, provider.id, mode, toUpgrade);
    }
  } catch (e) {
    console.warn('Routing upgrade failed, keeping Haversine distances:', e);
  }

  const upgradedSorted = toUpgrade.sort((a, b) => (a.distanceMiles || 9999) - (b.distanceMiles || 9999));
  return [...upgradedSorted, ...remaining];
}

function buildCacheKey(prefix: string, origin: Coordinate, providerId: string, mode: TravelMode, resourceIds: string[]): string {
  const coordKey = origin.lat.toFixed(4) + ',' + origin.lng.toFixed(4);
  const idsKey = resourceIds.slice(0, 50).join(',');
  return prefix + ':' + providerId + ':' + mode + ':' + coordKey + ':' + idsKey;
}

function getCachedDistances(
  prefix: string,
  origin: Coordinate,
  providerId: string,
  mode: TravelMode,
  resources: ResourceWithCoords[]
): Map<string, number> | null {
  try {
    const key = buildCacheKey(prefix, origin, providerId, mode, resources.map((r) => r.id));
    const stored = sessionStorage.getItem(key);
    if (!stored) return null;
    const data = JSON.parse(stored);
    if (Date.now() - data.timestamp > 3600000) {
      sessionStorage.removeItem(key);
      return null;
    }
    return new Map(Object.entries(data.distances));
  } catch {
    return null;
  }
}

function cacheDistances(
  prefix: string,
  origin: Coordinate,
  providerId: string,
  mode: TravelMode,
  resources: ResourceWithCoords[]
): void {
  try {
    const key = buildCacheKey(prefix, origin, providerId, mode, resources.map((r) => r.id));
    const distances: Record<string, number> = {};
    resources.forEach((r) => {
      const d = r.distanceMiles;
      if (typeof d === 'number' && Number.isFinite(d)) distances[r.id] = d;
    });
    sessionStorage.setItem(
      key,
      JSON.stringify({ distances, timestamp: Date.now(), provider: providerId, mode })
    );
  } catch {
    // Ignore cache errors
  }
}

function applyCachedDistances(resources: ResourceWithCoords[], cached: Map<string, number>): void {
  resources.forEach((r) => {
    const cachedDistance = cached.get(r.id);
    if (Number.isFinite(cachedDistance)) r.distanceMiles = cachedDistance;
  });
}
