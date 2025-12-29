import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { Trophy, Medal, Clock, CalendarDays, CalendarRange, Play, Loader2 } from "lucide-react";
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

type TimePeriod = 'today' | 'week' | 'month' | 'all';

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const periods: { key: TimePeriod; label: string; icon: typeof Clock }[] = [
  { key: 'today', label: 'Today', icon: Clock },
  { key: 'week', label: 'This Week', icon: CalendarDays },
  { key: 'month', label: 'This Month', icon: CalendarRange },
  { key: 'all', label: 'All Time', icon: Trophy },
];

function LeaderboardSection({ 
  period, 
  currentEntryId, 
  playerScore,
  playerName,
  isReady
}: { 
  period: typeof periods[number]; 
  currentEntryId: number | null;
  playerScore: number;
  playerName: string;
  isReady: boolean;
}) {
  const Icon = period.icon;
  
  const { data: scores = [], isLoading, isFetching } = useQuery<Score[]>({
    queryKey: [`/api/scores?period=${period.key}&limit=5`],
    enabled: isReady,
    staleTime: 0,
  });

  const { data: allScores = [] } = useQuery<Score[]>({
    queryKey: [`/api/scores?period=${period.key}`],
    enabled: isReady,
    staleTime: 0,
  });

  const userRank = currentEntryId 
    ? allScores.findIndex(s => s.id === currentEntryId) + 1 
    : 0;
  const isInTop5 = userRank > 0 && userRank <= 5;
  const currentEntry = allScores.find(s => s.id === currentEntryId);

  const getRankBadge = (rank: number, isHighlight: boolean) => {
    const baseClass = "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0";
    if (isHighlight) {
      return <div className={cn(baseClass, "bg-primary text-primary-foreground")}>{rank}</div>;
    }
    if (rank === 1) return <div className={cn(baseClass, "bg-yellow-400 text-yellow-900")}>{rank}</div>;
    if (rank === 2) return <div className={cn(baseClass, "bg-slate-300 text-slate-800")}>{rank}</div>;
    if (rank === 3) return <div className={cn(baseClass, "bg-amber-600 text-amber-100")}>{rank}</div>;
    return <div className={cn(baseClass, "bg-muted text-muted-foreground")}>{rank}</div>;
  };

  if (!isReady || isLoading || isFetching) {
    return (
      <div className="bg-muted/30 dark:bg-muted/20 rounded-xl p-3">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{period.label}</span>
        </div>
        <div className="flex items-center justify-center py-4 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 dark:bg-muted/20 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{period.label}</span>
      </div>
      
      {scores.length > 0 ? (
        <div className="space-y-1.5">
          {scores.map((entry, index) => {
            const isCurrentUser = entry.id === currentEntryId;
            return (
              <div
                key={entry.id}
                className={cn(
                  "flex items-center justify-between px-2 py-1.5 rounded-lg text-sm",
                  isCurrentUser 
                    ? "bg-primary/10 ring-2 ring-primary" 
                    : "bg-background/50"
                )}
                data-testid={`leaderboard-${period.key}-entry-${index + 1}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {getRankBadge(index + 1, isCurrentUser)}
                  <span className={cn(
                    "font-medium truncate",
                    isCurrentUser && "text-primary font-bold"
                  )}>
                    {entry.username}
                    {isCurrentUser && " (You)"}
                  </span>
                </div>
                <span className={cn(
                  "font-mono font-bold text-xs flex-shrink-0",
                  isCurrentUser && "text-primary"
                )}>
                  {formatTime(entry.score)}
                </span>
              </div>
            );
          })}
          
          {!isInTop5 && currentEntry && userRank > 0 && (
            <>
              <div className="text-center text-muted-foreground text-xs py-0.5">...</div>
              <div
                className="flex items-center justify-between px-2 py-1.5 rounded-lg text-sm bg-primary/10 ring-2 ring-primary"
                data-testid={`leaderboard-${period.key}-entry-user`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {getRankBadge(userRank, true)}
                  <span className="font-bold text-primary truncate">
                    {currentEntry.username} (You)
                  </span>
                </div>
                <span className="font-mono font-bold text-xs text-primary flex-shrink-0">
                  {formatTime(currentEntry.score)}
                </span>
              </div>
            </>
          )}
          
          {!isInTop5 && !currentEntry && userRank === 0 && (
            <div className="flex items-center justify-between px-2 py-1.5 rounded-lg text-sm bg-primary/10 ring-2 ring-primary">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-muted text-muted-foreground">-</div>
                <span className="font-bold text-primary truncate">
                  {playerName} (You)
                </span>
              </div>
              <span className="font-mono font-bold text-xs text-primary flex-shrink-0">
                {formatTime(playerScore)}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg text-sm bg-primary/10 ring-2 ring-primary">
            <div className="flex items-center gap-2 min-w-0">
              {getRankBadge(1, true)}
              <span className="font-bold text-primary truncate">
                {playerName} (You)
              </span>
            </div>
            <span className="font-mono font-bold text-xs text-primary flex-shrink-0">
              {formatTime(playerScore)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function WinModal({ isOpen, score, playerName, onPlayAgain }: WinModalProps) {
  const hasSubmittedRef = useRef(false);
  const [currentEntryId, setCurrentEntryId] = useState<number | null>(null);
  const [isDataReady, setIsDataReady] = useState(false);
  const queryClient = useQueryClient();

  const submitScoreMutation = useMutation({
    mutationFn: async (data: { username: string; score: number }) => {
      const res = await apiRequest('POST', '/api/scores', data);
      return res.json() as Promise<Score>;
    },
    onSuccess: async (newScore) => {
      setCurrentEntryId(newScore.id);
      
      await Promise.all(
        periods.flatMap(period => [
          queryClient.invalidateQueries({ queryKey: [`/api/scores?period=${period.key}&limit=5`] }),
          queryClient.invalidateQueries({ queryKey: [`/api/scores?period=${period.key}`] }),
        ])
      );
      
      setIsDataReady(true);
    },
  });

  useEffect(() => {
    if (isOpen && playerName.trim() && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      setIsDataReady(false);
      submitScoreMutation.mutate({ username: playerName.trim(), score });
    }
    
    if (!isOpen) {
      hasSubmittedRef.current = false;
      setCurrentEntryId(null);
      setIsDataReady(false);
    }
  }, [isOpen, playerName, score]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-card dark:bg-card rounded-3xl p-6 max-w-lg w-full shadow-2xl my-4"
          >
            <div className="text-center mb-4">
              <div className="flex justify-center mb-3">
                <Trophy className="w-12 h-12 text-yellow-500 fill-yellow-300" />
              </div>

              <h2 className="text-2xl font-display font-black mb-1">You Won!</h2>
              <p className="text-muted-foreground text-sm">All words found!</p>
            </div>

            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-4 mb-4 text-center">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Your Time
              </p>
              <p className="text-3xl font-display font-black text-primary font-mono" data-testid="text-final-time">
                {formatTime(score)}
              </p>
            </div>

            {submitScoreMutation.isPending ? (
              <div className="flex items-center justify-center gap-2 text-muted-foreground py-8">
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting score...
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 mb-4">
                {periods.map((period) => (
                  <LeaderboardSection 
                    key={period.key} 
                    period={period} 
                    currentEntryId={currentEntryId}
                    playerScore={score}
                    playerName={playerName}
                    isReady={isDataReady}
                  />
                ))}
              </div>
            )}

            <Button
              onClick={onPlayAgain}
              className="w-full font-bold gap-2"
              data-testid="button-play-again"
            >
              <Play className="w-4 h-4" />
              Play Again
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
