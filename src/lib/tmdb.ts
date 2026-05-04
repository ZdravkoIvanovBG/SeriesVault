import { supabase } from "@/integrations/supabase/client";

export interface TMDBSeries {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  origin_country: string[];
  original_language: string;
  status?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  genres?: { id: number; name: string }[];
  seasons?: TMDBSeason[];
  networks?: { id: number; name: string; logo_path: string | null }[];
  in_production?: boolean;
}

export interface TMDBSeason {
  id: number;
  season_number: number;
  name: string;
  episode_count: number;
  air_date: string | null;
  poster_path: string | null;
  overview: string;
}

export interface Series {
  id: string;
  title: string;
  year: string;
  genre: string[];
  rating: number;
  seasons: number;
  description: string;
  image: string;
  backdrop: string;
  status: "Ended" | "Ongoing" | "Upcoming";
}

// TMDB genre map
const GENRE_MAP: Record<number, string> = {
  10759: "Action & Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  10762: "Kids",
  9648: "Mystery",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
  37: "Western",
};

export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export function posterUrl(path: string | null, size = "w500"): string {
  if (!path) return "/placeholder.svg";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function backdropUrl(path: string | null, size = "w1280"): string {
  if (!path) return "/placeholder.svg";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

function mapStatus(
  status?: string,
  inProduction?: boolean,
  firstAirDate?: string,
): "Ended" | "Ongoing" | "Upcoming" {
  // Explicit TMDB statuses (only present on detail endpoint)
  if (status === "Returning Series" || status === "In Production" || inProduction) return "Ongoing";
  if (status === "Planned" || status === "Pilot") return "Upcoming";
  if (status === "Ended" || status === "Canceled") return "Ended";

  // Infer from first_air_date when status is not provided (list endpoints)
  if (!firstAirDate) return "Upcoming";
  const airTime = new Date(firstAirDate).getTime();
  if (isNaN(airTime)) return "Ongoing";
  const now = Date.now();
  if (airTime > now) return "Upcoming";
  // Default to Ongoing when we have no authoritative status; detail page corrects it.
  return "Ongoing";
}

export function tmdbToSeries(t: TMDBSeries): Series {
  const year = t.first_air_date ? t.first_air_date.substring(0, 4) : "TBA";
  const genres = t.genre_ids
    ? t.genre_ids.map((id) => GENRE_MAP[id] || "Other").slice(0, 3)
    : t.genres
    ? t.genres.map((g) => g.name).slice(0, 3)
    : [];

  return {
    id: String(t.id),
    title: t.name,
    year: year,
    genre: genres,
    rating: Math.round(t.vote_average * 10) / 10,
    seasons: t.number_of_seasons || 1,
    description: t.overview || "No description available.",
    image: posterUrl(t.poster_path),
    backdrop: backdropUrl(t.backdrop_path),
    status: mapStatus(t.status, t.in_production, t.first_air_date),
  };
}

async function callTMDB(endpoint: string, params?: Record<string, string>) {
  const { data, error } = await supabase.functions.invoke("tmdb", {
    body: { endpoint, params },
  });

  if (error) throw new Error(error.message || "Failed to fetch from TMDB");
  return data;
}

export type BrowseCategory = "trending" | "popular" | "top_rated" | "airing_today";

export async function getTrending(page = 1): Promise<{ results: Series[]; totalPages: number }> {
  const data = await callTMDB("/trending/tv/week", { page: String(page) });
  return {
    results: (data.results || []).map(tmdbToSeries),
    totalPages: data.total_pages || 1,
  };
}

export async function getPopular(page = 1): Promise<{ results: Series[]; totalPages: number }> {
  const data = await callTMDB("/tv/popular", { page: String(page) });
  return {
    results: (data.results || []).map(tmdbToSeries),
    totalPages: data.total_pages || 1,
  };
}

export async function getTopRated(page = 1): Promise<{ results: Series[]; totalPages: number }> {
  const data = await callTMDB("/tv/top_rated", { page: String(page) });
  return {
    results: (data.results || []).map(tmdbToSeries),
    totalPages: data.total_pages || 1,
  };
}

export async function getAiringToday(page = 1): Promise<{ results: Series[]; totalPages: number }> {
  const data = await callTMDB("/tv/airing_today", { page: String(page) });
  return {
    results: (data.results || []).map(tmdbToSeries),
    totalPages: data.total_pages || 1,
  };
}

export async function browseByCategory(category: BrowseCategory, page = 1) {
  switch (category) {
    case "trending": return getTrending(page);
    case "popular": return getPopular(page);
    case "top_rated": return getTopRated(page);
    case "airing_today": return getAiringToday(page);
  }
}

export async function searchSeries(query: string, page = 1): Promise<{ results: Series[]; totalPages: number }> {
  const data = await callTMDB("/search/tv", { query, page: String(page) });
  return {
    results: (data.results || []).map(tmdbToSeries),
    totalPages: data.total_pages || 1,
  };
}

export async function getSeriesDetail(id: string): Promise<Series & { seasonDetails: TMDBSeason[]; networks: string[] }> {
  const data: TMDBSeries = await callTMDB(`/tv/${id}`, { append_to_response: "external_ids" });
  const series = tmdbToSeries(data);
  // Override with detailed data
  if (data.genres) {
    series.genre = data.genres.map((g) => g.name);
  }
  if (data.number_of_seasons) {
    series.seasons = data.number_of_seasons;
  }
  if (data.first_air_date) {
    const startYear = data.first_air_date.substring(0, 4);
    if (data.status === "Ended" || data.status === "Canceled") {
      series.year = data.seasons && data.seasons.length > 0
        ? `${startYear}–${data.seasons[data.seasons.length - 1].air_date?.substring(0, 4) || startYear}`
        : startYear;
    } else {
      series.year = `${startYear}–`;
    }
  }
  series.status = mapStatus(data.status, data.in_production);

  return {
    ...series,
    seasonDetails: (data.seasons || []).filter((s) => s.season_number > 0),
    networks: (data.networks || []).map((n) => n.name),
  };
}

export async function discoverByGenre(genreId: number, page = 1): Promise<{ results: Series[]; totalPages: number }> {
  const data = await callTMDB("/discover/tv", {
    with_genres: String(genreId),
    sort_by: "vote_average.desc",
    "vote_count.gte": "100",
    page: String(page),
  });
  return {
    results: (data.results || []).map(tmdbToSeries),
    totalPages: data.total_pages || 1,
  };
}

export async function getGenres(): Promise<{ id: number; name: string }[]> {
  const data = await callTMDB("/genre/tv/list");
  return data.genres || [];
}
