import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { Trophy, Medal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Score } from "@shared/schema";

interface WinModalProps {
  isOpen: boolean;
  score: number;
  playerName: string;
  onPlayAgain: () => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export function WinModal({ isOpen, score, playerName, onPlayAgain }: WinModalProps) {
  const hasSubmittedRef = useRef(false);
  const [currentEntryId, setCurrentEntryId] = useState<number | null>(null);
  const [userRank, setUserRank] = useState<number>(0);
  const queryClient = useQueryClient();

  const { data: leaderboard = [] } = useQuery<Score[]>({
    queryKey: ['/api/scores'],
  });

  const submitScoreMutation = useMutation({
    mutationFn: async (data: { username: string; score: number }) => {
      const res = await apiRequest('POST', '/api/scores', data);
      return res.json() as Promise<Score>;
    },
    onSuccess: (newScore) => {
      setCurrentEntryId(newScore.id);
      queryClient.invalidateQueries({ queryKey: ['/api/scores'] });
    },
  });

  useEffect(() => {
    if (isOpen && playerName.trim() && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      submitScoreMutation.mutate({ username: playerName.trim(), score });
    }
    
    if (!isOpen) {
      hasSubmittedRef.current = false;
      setCurrentEntryId(null);
      setUserRank(0);
    }
  }, [isOpen, playerName, score]);

  useEffect(() => {
    if (currentEntryId && leaderboard.length > 0) {
      const rank = leaderboard.findIndex(e => e.id === currentEntryId) + 1;
      setUserRank(rank);
    }
  }, [currentEntryId, leaderboard]);

  const top5 = leaderboard.slice(0, 5);
  const isInTop5 = userRank > 0 && userRank <= 5;
  const currentEntry = leaderboard.find(e => e.id === currentEntryId);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-4 h-4 text-yellow-500 fill-yellow-300" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-gray-400" />;
    if (rank === 3) return <Medal className="w-4 h-4 text-amber-600" />;
    return null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Trophy className="w-16 h-16 text-yellow-500 fill-yellow-300" />
              </div>

              <h2 className="text-3xl font-display font-black mb-2">You Won!</h2>
              <p className="text-muted-foreground mb-6">All words found!</p>

              <div className="bg-white/80 backdrop-blur rounded-2xl p-4 mb-6">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Your Time
                </p>
                <p className="text-4xl font-display font-black text-primary font-mono" data-testid="text-final-time">
                  {formatTime(score)}
                </p>
              </div>

              <div className="bg-muted/50 rounded-2xl p-4 mb-6">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Leaderboard
                </p>
                {submitScoreMutation.isPending ? (
                  <div className="text-muted-foreground text-sm py-4">Submitting score...</div>
                ) : (
                  <div className="space-y-2">
                    {top5.map((entry, index) => {
                      const isCurrentUser = entry.id === currentEntryId;
                      return (
                        <div
                          key={entry.id}
                          className={cn(
                            "flex items-center justify-between px-3 py-2 rounded-xl",
                            isCurrentUser 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-background"
                          )}
                          data-testid={`leaderboard-entry-${index + 1}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "w-6 text-sm font-bold",
                              isCurrentUser ? "text-primary-foreground" : "text-muted-foreground"
                            )}>
                              {getRankIcon(index + 1) || `#${index + 1}`}
                            </span>
                            <span className="font-medium truncate max-w-[120px]">
                              {entry.username}
                              {isCurrentUser && " (You)"}
                            </span>
                          </div>
                          <span className="font-mono font-bold">{formatTime(entry.score)}</span>
                        </div>
                      );
                    })}
                    
                    {!isInTop5 && currentEntry && (
                      <>
                        <div className="text-muted-foreground text-xs py-1">...</div>
                        <div
                          className="flex items-center justify-between px-3 py-2 rounded-xl bg-primary text-primary-foreground"
                          data-testid="leaderboard-entry-user"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 text-sm font-bold">#{userRank}</span>
                            <span className="font-medium truncate max-w-[120px]">
                              {currentEntry.username} (You)
                            </span>
                          </div>
                          <span className="font-mono font-bold">{formatTime(currentEntry.score)}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <Button
                onClick={onPlayAgain}
                variant="outline"
                className="w-full font-bold"
                data-testid="button-play-again"
              >
                Play Again
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
