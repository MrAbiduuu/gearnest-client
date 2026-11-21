"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { useSession } from "@/lib/auth-client";
import type { Equipment } from "@/lib/equipment";
import {
  addToFavorites,
  FavoriteRequestError,
  getMyFavorites,
  removeFromFavorites,
} from "@/lib/favorites-api";

type FavoritesContextValue = {
  items: Equipment[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isFavorite: (equipmentId: string) => boolean;
  isPending: (equipmentId: string) => boolean;
  refresh: () => Promise<void>;
  toggleFavorite: (equipment: Equipment) => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

const getSignInUrl = () => {
  // URL is only needed inside an event handler; reading window.location here
  // avoids a useSearchParams/usePathname Suspense boundary in prerendered routes.
  const path =
    typeof window === "undefined"
      ? "/"
      : `${window.location.pathname}${window.location.search}`;

  return `/signin?callbackUrl=${encodeURIComponent(path)}`;
};

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();
  const userId = session?.user?.id ?? null;

  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const pendingRef = useRef<Set<string>>(new Set());

  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!userId) {
        setItems([]);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getMyFavorites(signal);
        if (signal?.aborted) return;
        setItems(data);
      } catch (caught) {
        if (signal?.aborted) return;
        setError(
          caught instanceof Error
            ? caught.message
            : "Could not load your favorites.",
        );
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    if (isSessionPending) return;

    const controller = new AbortController();
    // Defer the fetch so initial state updates don't run synchronously in the
    // effect body (React's cascading-render rule).
    queueMicrotask(() => void load(controller.signal));

    return () => controller.abort();
  }, [isSessionPending, load]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  const setPending = useCallback((equipmentId: string, pending: boolean) => {
    if (pending) pendingRef.current.add(equipmentId);
    else pendingRef.current.delete(equipmentId);

    setPendingIds(new Set(pendingRef.current));
  }, []);

  const toggleFavorite = useCallback(
    async (equipment: Equipment) => {
      const equipmentId = equipment._id;

      // Guard against rapid repeated clicks while a request is in flight.
      if (pendingRef.current.has(equipmentId)) return;

      if (!userId) {
        toast.add({
          type: "info",
          title: "Sign in to save equipment",
          description: "Log in to add equipment to your favorites list.",
          timeout: 5000,
        });
        router.push(getSignInUrl());
        return;
      }

      const wasFavorite = items.some((item) => item._id === equipmentId);
      const previousIndex = items.findIndex((item) => item._id === equipmentId);

      // Optimistic update - rolled back if the request fails.
      setItems((current) =>
        wasFavorite
          ? current.filter((item) => item._id !== equipmentId)
          : current.some((item) => item._id === equipmentId)
            ? current
            : [equipment, ...current],
      );
      setPending(equipmentId, true);

      try {
        if (wasFavorite) {
          await removeFromFavorites(equipmentId);
          toast.add({
            type: "success",
            title: "Removed from Favorites",
            description: `${equipment.name} was removed from your favorites.`,
            timeout: 4000,
          });
        } else {
          await addToFavorites(equipmentId);
          toast.add({
            type: "success",
            title: "Added to Favorites",
            description: `${equipment.name} was saved to your favorites.`,
            timeout: 4000,
          });
        }
      } catch (caught) {
        setItems((current) => {
          if (wasFavorite) {
            if (current.some((item) => item._id === equipmentId)) return current;
            const restored = [...current];
            restored.splice(previousIndex < 0 ? 0 : previousIndex, 0, equipment);
            return restored;
          }

          return current.filter((item) => item._id !== equipmentId);
        });

        const message =
          caught instanceof Error
            ? caught.message
            : "Could not update your favorites.";

        toast.add({
          type: "error",
          title: "Favorites update failed",
          description: message,
          timeout: 6000,
        });

        if (caught instanceof FavoriteRequestError && caught.status === 401) {
          router.push(getSignInUrl());
        }
      } finally {
        setPending(equipmentId, false);
      }
    },
    [items, router, setPending, userId],
  );

  const favoriteIds = useMemo(
    () => new Set(items.map((item) => item._id)),
    [items],
  );

  const isFavorite = useCallback(
    (equipmentId: string) => favoriteIds.has(equipmentId),
    [favoriteIds],
  );

  const isPending = useCallback(
    (equipmentId: string) => pendingIds.has(equipmentId),
    [pendingIds],
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({
      items,
      isAuthenticated: Boolean(userId),
      isLoading: isSessionPending || (Boolean(userId) && loading),
      error,
      isFavorite,
      isPending,
      refresh,
      toggleFavorite,
    }),
    [
      error,
      isFavorite,
      isPending,
      isSessionPending,
      items,
      loading,
      refresh,
      toggleFavorite,
      userId,
    ],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites must be used inside FavoritesProvider.");
  }

  return context;
};
