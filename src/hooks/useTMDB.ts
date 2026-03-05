import { useQuery } from "@tanstack/react-query";
import { browseByCategory, searchSeries, getSeriesDetail, getGenres, BrowseCategory } from "@/lib/tmdb";

export function useBrowse(category: BrowseCategory, page = 1) {
  return useQuery({
    queryKey: ["tmdb", "browse", category, page],
    queryFn: () => browseByCategory(category, page),
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
