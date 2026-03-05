import { useQuery } from "@tanstack/react-query";
import { getTrending, searchSeries, getSeriesDetail, getGenres } from "@/lib/tmdb";

export function useTrending(page = 1) {
  return useQuery({
    queryKey: ["tmdb", "trending", page],
    queryFn: () => getTrending(page),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSearchSeries(query: string, page = 1) {
  return useQuery({
    queryKey: ["tmdb", "search", query, page],
    queryFn: () => searchSeries(query, page),
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSeriesDetail(id: string) {
  return useQuery({
    queryKey: ["tmdb", "series", id],
    queryFn: () => getSeriesDetail(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

export function useGenres() {
  return useQuery({
    queryKey: ["tmdb", "genres"],
    queryFn: getGenres,
    staleTime: 60 * 60 * 1000,
  });
}
