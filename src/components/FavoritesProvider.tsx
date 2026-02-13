"use client";

import { useAuth } from "@/components/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

interface FavoritesProviderProps {
  children: React.ReactNode;
  initialFavorites: string[];
}

export default function FavoritesProvider({
  children,
  initialFavorites,
}: FavoritesProviderProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const initialized = useRef(false);

  // Initialize cache with server data immediately
  if (!initialized.current && user) {
    queryClient.setQueryData(["favorites", user.id], initialFavorites);
    initialized.current = true;
  }

  // Also update when user changes or initialFavorites updates
  useEffect(() => {
    if (user) {
      // Only set if not already in cache to avoid overwriting newer data
      const cached = queryClient.getQueryData(["favorites", user.id]);
      if (!cached) {
        queryClient.setQueryData(["favorites", user.id], initialFavorites);
      }
    }
  }, [user, initialFavorites, queryClient]);

  return <>{children}</>;
}
