import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useGameStart() {
  return useQuery({
    queryKey: [api.game.start.path],
    queryFn: async () => {
      const res = await fetch(api.game.start.path);
      if (!res.ok) throw new Error("Failed to start game");
      return api.game.start.responses[200].parse(await res.json());
    },
    // Don't refetch on window focus to prevent resetting the grid mid-game
    refetchOnWindowFocus: false,
    staleTime: Infinity, 
  });
}
