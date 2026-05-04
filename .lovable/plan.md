## Problem

Every series card shows **"Ended"** regardless of its real status.

**Root cause:** TMDB's list endpoints (`/trending/tv/week`, `/tv/popular`, `/tv/top_rated`, `/tv/airing_today`, `/search/tv`, `/discover/tv`) do **not** return the `status` or `in_production` fields — those only come from the `/tv/{id}` detail endpoint. In `src/lib/tmdb.ts`, `mapStatus(undefined, undefined)` falls through to `"Ended"`, so every card on the discover/search/watchlist pages is mislabeled.

## Fix

Infer status from fields that **are** available on list endpoints — primarily `first_air_date` — and only fall back to "Ended" when we genuinely know the show ended.

### Changes to `src/lib/tmdb.ts`

1. Update `mapStatus` to accept the air date and derive a sensible default:
   - If `first_air_date` is missing or in the future → `"Upcoming"`
   - If `first_air_date` is within roughly the last 18 months and no explicit "Ended"/"Canceled" status → `"Ongoing"` (most recent shows are still running)
   - If TMDB explicitly returns `"Ended"` or `"Canceled"` → `"Ended"`
   - If TMDB returns `"Returning Series"`, `"In Production"`, or `in_production: true` → `"Ongoing"`
   - Otherwise (older show, no status info) → `"Ongoing"` as a neutral default rather than the misleading "Ended" (the detail page will show the authoritative value).

2. Update `tmdbToSeries` to pass `t.first_air_date` into `mapStatus`.

3. Keep the detail-page behavior in `getSeriesDetail` unchanged — it already overrides with the real `status` from `/tv/{id}`.

### Optional polish (same file)

- For the **Airing Today** category, force `status = "Ongoing"` on results (by definition they air today).
- For results from `/tv/top_rated` where `first_air_date` is older than ~5 years and we have no status, leave as "Ongoing" default; the detail view corrects it on click.

No other files need changes — `SeriesCard` and `SeriesDetail` already render whatever `status` is set.

## Result

Cards will show a realistic mix of **Ongoing**, **Ended**, and **Upcoming** based on air dates, and the detail page continues to show the precise TMDB-reported status.
