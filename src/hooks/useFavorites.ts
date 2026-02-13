import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";

export function useFavorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: favoriteIds = [], isLoading } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch("/api/favorites");
      if (!res.ok) throw new Error("Failed to fetch favorites");
      return (await res.json()) as string[];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 mins
  });

  const addFavorite = useMutation({
    mutationFn: async (toolId: string) => {
      await fetch("/api/favorites", {
        method: "POST",
        body: JSON.stringify({ tool_id: toolId }),
      });
    },
    onMutate: async (toolId) => {
      await queryClient.cancelQueries({ queryKey: ["favorites", user?.id] });
      const previousFavorites = queryClient.getQueryData<string[]>(["favorites", user?.id]);
      queryClient.setQueryData<string[]>(["favorites", user?.id], (old = []) => [
        ...old,
        toolId,
      ]);
      return { previousFavorites };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(["favorites", user?.id], context?.previousFavorites);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites", user?.id] });
    },
  });

  const removeFavorite = useMutation({
    mutationFn: async (toolId: string) => {
      await fetch(`/api/favorites?tool_id=${toolId}`, {
        method: "DELETE",
      });
    },
    onMutate: async (toolId) => {
      await queryClient.cancelQueries({ queryKey: ["favorites", user?.id] });
      const previousFavorites = queryClient.getQueryData<string[]>(["favorites", user?.id]);
      queryClient.setQueryData<string[]>(["favorites", user?.id], (old = []) =>
        old.filter((id) => id !== toolId)
      );
      return { previousFavorites };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(["favorites", user?.id], context?.previousFavorites);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites", user?.id] });
    },
  });

  return {
    favoriteIds,
    isLoading,
    addFavorite,
    removeFavorite,
    isFavorited: (toolId: string) => favoriteIds.includes(toolId),
  };
}
