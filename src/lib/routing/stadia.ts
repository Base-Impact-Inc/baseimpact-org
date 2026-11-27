/**
 * Stadia Maps (Valhalla) Routing Provider
 *
 * Managed Valhalla backend — no server to run.
 * Free tier: 200,000 credits/month
 * Matrix API: 10 credits per element (1 origin × N destinations = N elements)
 * → ~20,000 matrix requests/month @ 10 destinations each, or ~2,000 @ 100 destinations
 * Supports: walking, driving, transit (with GTFS)
 * API: https://api.stadiamaps.com/route/matrix
 * Docs: https://docs.stadiamaps.com/routing/matrix/
 */

import type { RoutingProvider, MatrixRequest, MatrixResponse, MatrixElement, TravelMode, Coordinate } from './provider.js';

interface StadiaMatrixResponse {
  sources_to_targets: number[][]; // distances in meters
  sources_to_targets_durations?: number[][]; // durations in seconds
  status: string;
  status_message?: string;
}

export class StadiaProvider implements RoutingProvider {
  readonly id = 'stadia';
  readonly name = 'Stadia Maps (Valhalla)';
  readonly supportedModes: TravelMode[] = ['walking', 'driving', 'transit'];
  readonly requiresApiKey = true;
  readonly freeTierLimit = '200k credits/mo (~20k matrix requests @ 10 targets)';

  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.stadiamaps.com/route/matrix';

  constructor(apiKey?: string) {
    const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
    this.apiKey = apiKey || env?.STADIA_API_KEY || '';
    if (!this.apiKey) {
      console.warn('StadiaProvider: No API key provided. Set STADIA_API_KEY env var.');
    }
  }

  async getMatrix(request: MatrixRequest): Promise<MatrixResponse> {
    if (!this.apiKey) {
      throw new Error('StadiaProvider: API key not configured');
    }

    const { origin, destinations, mode } = request;
    const costing = this.mapModeToCosting(mode);

    // Build sources (1) and targets (N) arrays
    const sources = [{ lat: origin.lat, lon: origin.lng }];
    const targets = destinations.map((d) => ({ lat: d.lat, lon: d.lng }));

    const body = {
      sources,
      targets,
      costing,
      units: 'miles' as const, // Returns miles directly
    };

    const url = `${this.baseUrl}?api_key=${encodeURIComponent(this.apiKey)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text().catch(() => 'Unknown error');
      throw new Error(`Stadia API ${response.status}: ${error}`);
    }

    const data: StadiaMatrixResponse = await response.json();

    if (data.status !== 'OK' && data.status !== 'Ok') {
      throw new Error(`Stadia API error: ${data.status_message || data.status}`);
    }

    // sources_to_targets is [sources][targets] — we have 1 source
    const distances = data.sources_to_targets[0] || [];
    const durations = data.sources_to_targets_durations?.[0] || [];

    const elements: MatrixElement[] = destinations.map((_, i) => ({
      distanceMiles: Number.isFinite(distances[i]) ? Math.round(distances[i] * 10) / 10 : 9999,
      durationSeconds: Number.isFinite(durations[i]) ? Math.round(durations[i]) : undefined,
      reachable: Number.isFinite(distances[i]) && distances[i] < 9999,
    }));

    return {
      elements,
      meta: { provider: this.id, mode, timestamp: Date.now() },
    };
  }

  async healthCheck(): Promise<boolean> {
    if (!this.apiKey) return false;
    try {
      // Quick test: matrix with 1 target
      const testResp = await this.getMatrix({
        origin: { lat: 28.326, lng: -80.751 }, // Mims, FL 32754
        destinations: [{ lat: 28.1, lng: -80.6 }],
        mode: 'driving',
      });
      return testResp.elements[0]?.reachable === true;
    } catch {
      return false;
    }
  }

  private mapModeToCosting(mode: TravelMode): string {
    switch (mode) {
      case 'walking':
        return 'pedestrian';
      case 'driving':
        return 'auto';
      case 'transit':
        return 'multimodal'; // Valhalla multimodal supports transit with GTFS
      default:
        return 'auto';
    }
  }
}

// Register if API key is available
// Note: This is imported conditionally in the registry to avoid requiring the key at load time
export function createStadiaProvider(apiKey?: string): StadiaProvider {
  return new StadiaProvider(apiKey);
}