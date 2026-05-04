import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export type TierKey = "S" | "A" | "B" | "C" | "D" | "F";
export const TIERS: TierKey[] = ["S", "A", "B", "C", "D", "F"];

export type TierMap = Record<TierKey, string[]>;

const empty = (): TierMap => ({ S: [], A: [], B: [], C: [], D: [], F: [] });

export const useTierList = () => {
  const { user } = useAuth();
  const [tiers, setTiers] = useState<TierMap>(empty());

  // Load
  useEffect(() => {
    if (!user) { setTiers(empty()); return; }
    (async () => {
      const { data } = await supabase
        .from("user_tierlist")
        .select("series_id, tier, position")
        .eq("user_id", user.id)
        .order("position", { ascending: true });
      const next = empty();
      (data ?? []).forEach((row: any) => {
        if (TIERS.includes(row.tier)) next[row.tier as TierKey].push(row.series_id);
      });
      setTiers(next);
    })();
  }, [user]);

  const persistTier = useCallback(async (tier: TierKey, ids: string[]) => {
    if (!user) return;
    // Remove existing rows for these series in this tier scope and reinsert in order
    if (ids.length === 0) return;
    const rows = ids.map((series_id, position) => ({
      user_id: user.id,
      series_id,
      tier,
      position,
    }));
    await supabase.from("user_tierlist").upsert(rows, { onConflict: "user_id,series_id" });
  }, [user]);

  const assign = useCallback(async (id: string, tier: TierKey | null, beforeId?: string | null) => {
    if (!user) return;
    let nextState: TierMap = empty();
    setTiers((prev) => {
      const next: TierMap = { S: [...prev.S], A: [...prev.A], B: [...prev.B], C: [...prev.C], D: [...prev.D], F: [...prev.F] };
      for (const k of TIERS) next[k] = next[k].filter((x) => x !== id);
      if (tier) {
        if (beforeId && beforeId !== id) {
          const idx = next[tier].indexOf(beforeId);
          if (idx >= 0) next[tier].splice(idx, 0, id);
          else next[tier].push(id);
        } else {
          next[tier].push(id);
        }
      }
      nextState = next;
      return next;
    });

    // Persist
    if (tier) {
      await persistTier(tier, nextState[tier]);
    } else {
      await supabase.from("user_tierlist").delete().eq("user_id", user.id).eq("series_id", id);
    }
  }, [user, persistTier]);

  const reset = useCallback(async () => {
    if (!user) return;
    setTiers(empty());
    await supabase.from("user_tierlist").delete().eq("user_id", user.id);
  }, [user]);

  const tierOf = useCallback((id: string): TierKey | null => {
    for (const k of TIERS) if (tiers[k].includes(id)) return k;
    return null;
  }, [tiers]);

  return { tiers, assign, reset, tierOf };
};
