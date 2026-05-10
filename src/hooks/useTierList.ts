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
      const { data, error } = await supabase
        .from("user_tierlist")
        .select("series_id, tier, position")
        .eq("user_id", user.id)
        .order("position", { ascending: true });
      if (error) {
        console.error("[tierlist] load error:", error);
        return;
      }
      const next = empty();
      (data ?? []).forEach((row: any) => {
        if (TIERS.includes(row.tier)) next[row.tier as TierKey].push(row.series_id);
      });
      setTiers(next);
    })();
  }, [user]);

  const persistTier = useCallback(async (tier: TierKey, ids: string[]) => {
    if (!user || ids.length === 0) return;
    const rows = ids.map((series_id, position) => ({
      user_id: user.id,
      series_id,
      tier,
      position,
    }));
    const { error } = await supabase
      .from("user_tierlist")
      .upsert(rows, { onConflict: "user_id,series_id" });
    if (error) console.error("[tierlist] upsert error:", error);
  }, [user]);

  const assign = useCallback(async (id: string, tier: TierKey | null, beforeId?: string | null) => {
    if (!user) return;

    // Compute next state synchronously from current tiers
    const next: TierMap = { S: [...tiers.S], A: [...tiers.A], B: [...tiers.B], C: [...tiers.C], D: [...tiers.D], F: [...tiers.F] };
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
    setTiers(next);

    // Persist
    if (tier) {
      await persistTier(tier, next[tier]);
    } else {
      const { error } = await supabase
        .from("user_tierlist")
        .delete()
        .eq("user_id", user.id)
        .eq("series_id", id);
      if (error) console.error("[tierlist] delete error:", error);
    }
  }, [user, persistTier, tiers]);

  const reset = useCallback(async () => {
    if (!user) return;
    setTiers(empty());
    const { error } = await supabase.from("user_tierlist").delete().eq("user_id", user.id);
    if (error) console.error("[tierlist] reset error:", error);
  }, [user]);

  const tierOf = useCallback((id: string): TierKey | null => {
    for (const k of TIERS) if (tiers[k].includes(id)) return k;
    return null;
  }, [tiers]);

  return { tiers, assign, reset, tierOf };
};
