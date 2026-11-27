# Distance research: findhelp.org vs Base Impact directory

Checked 2026-11-27. Question: does findhelp.org use a "better" distance calculation than ours, and should we copy it?

## Conclusion

No algorithm change is warranted. findhelp.org displays **straight-line (Haversine) distance from a ZIP-code centroid**. Our directory already does the same, then offers an optional road-distance upgrade through OSRM. The differing numbers come from *which point is used for ZIP 32754*, not from the formula.

## Evidence

The findhelp food results for ZIP 32754 show Head Start at 2582 U.S. 1, Mims as **6.89 miles** away, with more locations at 7.54, 9.37, 10.63 and 13.41 miles.[1]

Our `/api/geocode?zip=32754` returns **28.6974, -80.8663** from zippopotam.us.[5][2] Nominatim places 2582 US 1 at **28.6679, -80.8462**.[3] From our ZIP point:

| Measure | 2582 US 1 from 32754 |
|---|---|
| findhelp displayed distance | 6.89 mi[1] |
| Haversine from our ZIP point | 2.37 mi |
| OSRM driving distance from our ZIP point | 3.15 mi[4] |

Fitting a Haversine origin to all five findhelp distances gives **28.722, -80.943** with RMSE **0.055 miles**:

| Location | findhelp | Haversine from fitted origin |
|---|---|---|
| Mims Elementary, 2582 US 1 | 6.89 | 6.96 |
| Cuyler Park, 2329 Harry T Moore Ave | 7.54 | 7.55 |
| Titusville Clinic, 611 N Singleton Ave | 9.37 | 9.30 |
| Titusville Branch, 126 Grannis Ave S | 10.63 | 10.62 |
| Coquina Elementary, 850 Knox McRae Dr | 13.41 | 13.48 |

That fit is far too tight to be road routing. findhelp is using a different ZIP centroid (roughly 4-5 miles from ours), then applying plain great-circle distance. Reverse geocoding the fitted point returns Brevard County, Florida; we did not find a published source for that exact centroid, so it is not safe to hard-code it.

## What we changed

- The directory now says **"straight-line distance (road distances load shortly)"** in the status line when a location is set, and switches to **"road distance (driving/walking)"** once OSRM responds. This makes the basis explicit instead of showing an unlabeled number that later changes.
- No change to the Haversine formula, ZIP geocoder, or OSRM upgrade. Replacing zippopotam with an undocumented centroid would move numbers without making them more correct for the visitor.

## What would genuinely improve it

1. Let visitors use GPS (already supported) — a real location beats any ZIP centroid.
2. Keep road distance for the nearest results (already supported, 20 results, driving/walking profiles).
3. If we adopt a Census ZCTA centroid dataset later, apply it to all ZIPs uniformly and record the source. Do not special-case 32754.

## Access note

findhelp.org returns HTTP 403 with a Cloudflare challenge to direct `curl` and headless Chrome from this host. The page content used here came from a server-side extraction of the live URL; no source code or API response from findhelp was available, so the algorithm conclusion is inferred from measured distances, not from reading their code.

## Sources

[1] https://www.findhelp.org/food/all?postal=32754&cursor=0&sort_by=distance — findhelp food results near 32754
[2] https://api.zippopotam.us/us/32754 — zippopotam 32754
[3] https://nominatim.openstreetmap.org/search?format=json&q=2582+US-1+Mims+FL+32754&limit=1 — Nominatim geocode of 2582 US 1
[4] https://routing.openstreetmap.de/routed-car/route/v1/driving/-80.8663,28.6974;-80.8462,28.6679?overview=false — OSRM road route Mims centroid to 2582 US 1
[5] https://baseimpact.org/api/geocode?zip=32754 — Base Impact geocode API
