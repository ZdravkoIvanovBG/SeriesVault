import { supabase } from "@/integrations/supabase/client";

export interface NextEpisodeInfo {
  seriesId: string;
  seriesName: string;
  posterPath: string | null;
  status: string;
  inProduction: boolean;
  nextEpisode: {
    air_date: string | null;
    episode_number: number;
    season_number: number;
    name: string;
    overview: string;
    runtime?: number | null;
  } | null;
  lastEpisode: {
    air_date: string | null;
    episode_number: number;
    season_number: number;
    name: string;
  } | null;
  networks: string[];
}

async function callTMDB(endpoint: string, params?: Record<string, string>) {
  const { data, error } = await supabase.functions.invoke("tmdb", {
    body: { endpoint, params },
  });
  if (error) throw new Error(error.message || "Failed to fetch from TMDB");
  return data;
}

export async function getUpcomingForSeries(id: string): Promise<NextEpisodeInfo> {
  const data = await callTMDB(`/tv/${id}`);
  return {
    seriesId: String(data.id),
    seriesName: data.name,
    posterPath: data.poster_path,
    status: data.status,
    inProduction: !!data.in_production,
    nextEpisode: data.next_episode_to_air ?? null,
    lastEpisode: data.last_episode_to_air ?? null,
    networks: (data.networks || []).map((n: any) => n.name),
  };
}
