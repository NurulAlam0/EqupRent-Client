"use client";

import * as React from "react";
import { api, useAuth } from "@/lib/auth-context";

/** Equipment fields the favorites list, dashboard table and hearts render. */
export type FavoriteEquipment = {
  _id: string;
  name: string;
  image: string;
  category: string;
  rentalPrice: number;
  rentalType: string;
  location: string;
  availableQuantity: number;
  rating: number;
  reviews: number;
};

/** A saved row: the favorite's own id plus the populated equipment. */
export type FavoriteEntry = {
  _id: string;
  equipment: FavoriteEquipment;
};

type FavoritesValue = {
  /** Saved rows for the signed-in user (empty while signed out). */
  items: FavoriteEntry[];
  /** True until the first load settles — lets the UI show a spinner. */
  loading: boolean;
  isFavorite: (equipmentId: string) => boolean;
  /**
   * Saves or removes the equipment and returns its new saved state.
   * The list updates optimistically and rolls back if the API fails.
   */
  toggle: (equipment: FavoriteEquipment) => Promise<boolean>;
};

const FavoritesContext = React.createContext<FavoritesValue | null>(null);

/** Stable reference so an empty list never re-renders consumers. */
const EMPTY: FavoriteEntry[] = [];

type Cache = {
  /** Whose favorites `items` holds — mismatch means the cache is stale. */
  email: string | null;
  items: FavoriteEntry[];
};

/**
 * Loads the signed-in user's favorites once per session and keeps them in
 * one place, so the card hearts, the details page button and the dashboard
 * table always agree — and a save made anywhere shows up everywhere.
 *
 * The list is keyed by the session's email and only surfaced once it
 * belongs to the current visitor: signing out or switching accounts shows
 * an empty list immediately, with no flash of the previous user's data.
 */
export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cache, setCache] = React.useState<Cache>({
    email: null,
    items: [],
  });

  /** Null while hydrating or signed out. */
  const email = user?.role === "customer" ? user.email : null;
  /** True once `cache.items` is known to belong to this session. */
  const loaded = email !== null && cache.email === email;

  const apply = React.useCallback((next: FavoriteEntry[], owner: string) => {
    setCache({ email: owner, items: next });
  }, []);

  // Reload the saved list whenever the session changes (sign in / sign out).
  // State only changes inside these async callbacks, never in the effect body.
  React.useEffect(() => {
    if (!email) return; // hydrating or signed out — nothing to ask for

    let cancelled = false;
    api<{ items: FavoriteEntry[] }>("/api/favorites")
      .then((data) => {
        if (!cancelled) apply(data.items, email);
      })
      .catch(() => {
        // Signed in but the feed failed — show an empty list, not an error.
        if (!cancelled) apply([], email);
      });

    return () => {
      cancelled = true;
    };
  }, [email, apply]);

  const items = loaded ? cache.items : EMPTY;

  const toggle = React.useCallback<FavoritesValue["toggle"]>(
    async (equipment) => {
      if (!email) {
        throw new Error("Favorites are only available to customer accounts.");
      }

      const before = items;
      const wasSaved = before.some((f) => f.equipment._id === equipment._id);
      const next = wasSaved
        ? before.filter((f) => f.equipment._id !== equipment._id)
        : [{ _id: equipment._id, equipment }, ...before];

      // Optimistic save — the server call below confirms or we roll back.
      apply(next, email);

      try {
        const data = await api<{ saved: boolean }>(
          `/api/favorites/${equipment._id}`,
          { method: wasSaved ? "DELETE" : "POST" }
        );
        return data.saved;
      } catch (err) {
        apply(before, email); // undo the optimistic update
        throw err;
      }
    },
    [items, email, apply]
  );

  const value = React.useMemo<FavoritesValue>(
    () => ({
      items,
      loading: Boolean(email) && !loaded,
      isFavorite: (equipmentId: string) =>
        items.some((f) => f.equipment._id === equipmentId),
      toggle,
    }),
    [items, email, loaded, toggle]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesValue {
  const ctx = React.useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within <FavoritesProvider>");
  }
  return ctx;
}
