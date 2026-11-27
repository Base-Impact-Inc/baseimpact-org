/**
 * Public OSRM routing provider (FOSSGIS community server).
 *
 * Interim provider chosen because it needs NO API key and NO hosting.
 * Verified 2026-11-22 against Brevard County, FL coordinates:
 *   - GET /routed-car/table/v1/driving/<coords>?sources=0&destinations=1;2&annotations=distance,duration
 *   - GET /routed-foot/table/v1/... (walking)
 *   - CORS: access-control-allow-origin: *  (browser-safe)
 *
 * Caveats: community demo server, best-effort availability, no SLA.
 * Always keep Haversine as a graceful fallback. For production reliability
 * swap in StadiaProvider (API key) or a self-hosted OSRM/Valhalla instance.
 */

import type {
  RoutingProvider,
  MatrixRequest,
  MatrixResponse,
  MatrixElement,
  TravelMode,
} from './provider.js';

const METERS_PER_MILE = 1609.344;

interface OSRMTableResponse {
  code: string;
  distances?: (number | null)[][];
  durations?: (number | null)[][];
  message?: string;
}

export class OSRMProvider implements RoutingProvider {
  readonly id = 'osrm';
  readonly name = 'Public OSRM (FOSSGIS)';
  readonly supportedModes: TravelMode[] = ['driving', 'walking'];
  readonly requiresApiKey = false;
  readonly freeTierLimit = 'Community demo server — no key, no SLA, moderate use expected';

  private readonly baseUrls = [
    'https://routing.openstreetmap.de',
    'https://router.project-osrm.org',
  ];
  private readonly profiles: Partial<Record<TravelMode, string>> = {
    driving: 'routed-car',
    walking: 'routed-foot',
  };

  async getMatrix(request: MatrixRequest): Promise<MatrixResponse> {
    const profile = this.profiles[request.mode];
    if (!profile) {
      throw new Error(`OSRMProvider: mode "${request.mode}" is not supported (no transit)`);
    }

    const { origin, destinations, mode } = request;
    if (destinations.length === 0) return { elements: [], meta: { provider: this.id, mode, timestamp: Date.now() } };

    // OSRM expects lng,lat and the matrix is 1 source row -> N destination columns.
    const coords = [
      `${origin.lng},${origin.lat}`,
      ...destinations.map((d) => `${d.lng},${d.lat}`),
    ].join(';');
    const destIndices = destinations.map((_, i) => i + 1).join(';');
    const urls = this.baseUrls.map((base) => {
      // The OSRM demo server only exposes the driving profile.
      const profile = base.includes('openstreetmap.de')
        ? this.profiles[request.mode]
        : 'driving';
      return (
        `${base}/${profile}/table/v1/driving/${coords}` +
        `?sources=0&destinations=${destIndices}&annotations=distance,duration`
      );
    });

    let data: OSRMTableResponse | null = null;
    let lastError: unknown = null;
    for (const url of urls) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`OSRM ${response.status}`);
        const parsed = (await response.json()) as OSRMTableResponse;
        if (parsed.code !== 'Ok') throw new Error(`OSRM error: ${parsed.message || parsed.code}`);
        data = parsed;
        break;
      } catch (err) {
        lastError = err;
      } finally {
        clearTimeout(timeout);
      }
    }
    if (!data) throw lastError ?? new Error('No road-distance provider available');

    const row = data.distances?.[0] || [];
    const durations = data.durations?.[0] || [];
    const elements: MatrixElement[] = destinations.map((_, i) => {
      const meters = row[i];
      const reachable = typeof meters === 'number' && Number.isFinite(meters);
      return {
        distanceMiles: reachable ? Math.round((meters / METERS_PER_MILE) * 10) / 10 : 9999,
        durationSeconds: typeof durations[i] === 'number' ? Math.round(durations[i]) : undefined,
        reachable,
      };
    });

    return { elements, meta: { provider: this.id, mode, timestamp: Date.now() } };
  }

  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.getMatrix({
        origin: { lat: 28.326, lng: -80.751 }, // Mims, FL 32754
        destinations: [{ lat: 28.1, lng: -80.6 }],
        mode: 'driving',
      });
      return result.elements[0]?.reachable === true;
    } catch {
      return false;
    }
  }
}

export function createOSRMProvider(): OSRMProvider {
  return new OSRMProvider();
}
