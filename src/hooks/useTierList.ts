import { useEffect, useState, useCallback } from "react";

export type TierKey = "S" | "A" | "B" | "C" | "D" | "F";
export const TIERS: TierKey[] = ["S", "A", "B", "C", "D", "F"];

export type TierMap = Record<TierKey, string[]>;

const STORAGE_KEY = "tierlist";

const empty = (): TierMap => ({ S: [], A: [], B: [], C: [], D: [], F: [] });

export const useTierList = () => {
  const [tiers, setTiers] = useState<TierMap>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...empty(), ...parsed };
      }
    } catch {}
    return empty();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tiers));
  }, [tiers]);

  /** Move a series id to a tier (or null = unranked). Removes from any other tier. */
  const assign = useCallback((id: string, tier: TierKey | null, beforeId?: string | null) => {
    setTiers((prev) => {
      const next: TierMap = { S: [...prev.S], A: [...prev.A], B: [...prev.B], C: [...prev.C], D: [...prev.D], F: [...prev.F] };
      // remove from all
      for (const k of TIERS) {
        next[k] = next[k].filter((x) => x !== id);
      }
      if (tier) {
        if (beforeId && beforeId !== id) {
          const idx = next[tier].indexOf(beforeId);
          if (idx >= 0) {
            next[tier].splice(idx, 0, id);
            return next;
          }
        }
        next[tier].push(id);
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => setTiers(empty()), []);

  const tierOf = useCallback(
    (id: string): TierKey | null => {
      for (const k of TIERS) if (tiers[k].includes(id)) return k;
      return null;
    },
    [tiers],
  );

  return { tiers, assign, reset, tierOf };
};
