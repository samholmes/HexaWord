import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Clock, CalendarDays, CalendarRange, Play, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Score } from "@shared/schema";

interface GameResultProps {
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
  submittedScore,
  isSubmitting
}: { 
  period: typeof periods[number]; 
  currentEntryId: number | null;
  playerScore: number;
  playerName: string;
  submittedScore: Score | null;
  isSubmitting: boolean;
}) {
  const Icon = period.icon;
  
  const { data: scores = [], isLoading } = useQuery<Score[]>({
    queryKey: [`/api/scores?period=${period.key}&limit=5`],
    enabled: !!currentEntryId,
    staleTime: 0,
    refetchOnMount: true,
  });

  const { data: allScores = [] } = useQuery<Score[]>({
    queryKey: [`/api/scores?period=${period.key}`],
    enabled: !!currentEntryId,
    staleTime: 0,
    refetchOnMount: true,
  });

  const userRank = currentEntryId 
    ? allScores.findIndex(s => s.id === currentEntryId) + 1 
    : 0;
  const isInTop5 = userRank > 0 && userRank <= 5;
  const currentEntry = allScores.find(s => s.id === currentEntryId);

  const loading = isSubmitting || (!currentEntryId);
  const dataLoading = isLoading && !!currentEntryId;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-display">
          <Icon className="w-5 h-5 text-primary" />
          {period.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 flex items-center justify-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : dataLoading ? (
          <div className="divide-y divide-border/50">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between gap-3 px-4 py-3 bg-primary/10 ring-2 ring-inset ring-primary"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 bg-primary text-primary-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-primary truncate">
                    {playerName} (You)
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(), 'MMM d')}
                  </div>
                </div>
              </div>
              <div className="font-display font-bold text-primary font-mono text-sm flex-shrink-0">
                {formatTime(playerScore)}
              </div>
            </motion.div>
            <div className="p-4 flex items-center justify-center text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading rankings...
            </div>
          </div>
        ) : scores.length > 0 ? (
          <div className="divide-y divide-border/50">
            {scores.map((score, index) => {
              const isCurrentUser = score.id === currentEntryId;
              return (
                <motion.div
                  key={score.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "flex items-center justify-between gap-3 px-4 py-3",
                    isCurrentUser 
                      ? "bg-primary/10 ring-2 ring-inset ring-primary" 
                      : index === 0 && "bg-gradient-to-r from-yellow-50/50 dark:from-yellow-900/10 to-transparent"
                  )}
                  data-testid={`row-result-${period.key}-${score.id}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0",
                      isCurrentUser ? "bg-primary text-primary-foreground" :
                      index === 0 ? "bg-yellow-400 text-yellow-900" :
                      index === 1 ? "bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-slate-200" :
                      index === 2 ? "bg-amber-600 text-amber-100" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <div className={cn(
                        "font-semibold truncate flex items-center gap-1.5",
                        isCurrentUser ? "text-primary" : "text-foreground"
                      )}>
                        {score.username}
                        {isCurrentUser && " (You)"}
                        {index === 0 && !isCurrentUser && <Medal className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {score.createdAt ? format(new Date(score.createdAt), 'MMM d') : ''}
                      </div>
                    </div>
                  </div>
                  <div className={cn(
                    "font-display font-bold font-mono text-sm flex-shrink-0",
                    isCurrentUser ? "text-primary" : "text-primary"
                  )}>
                    {formatTime(score.score)}
                  </div>
                </motion.div>
              );
            })}
            
            {!isInTop5 && currentEntry && userRank > 0 && (
              <>
                <div className="text-center text-muted-foreground text-xs py-2 bg-muted/30">...</div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between gap-3 px-4 py-3 bg-primary/10 ring-2 ring-inset ring-primary"
                  data-testid={`row-result-${period.key}-user`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 bg-primary text-primary-foreground">
                      {userRank}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-primary truncate">
                        {currentEntry.username} (You)
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {currentEntry.createdAt ? format(new Date(currentEntry.createdAt), 'MMM d') : ''}
                      </div>
                    </div>
                  </div>
                  <div className="font-display font-bold text-primary font-mono text-sm flex-shrink-0">
                    {formatTime(currentEntry.score)}
                  </div>
                </motion.div>
              </>
            )}
          </div>
        ) : submittedScore ? (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between gap-3 px-4 py-3 bg-primary/10 ring-2 ring-inset ring-primary"
            data-testid={`row-result-${period.key}-first`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 bg-primary text-primary-foreground">
                1
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-primary truncate">
                  {playerName} (You)
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(), 'MMM d')}
                </div>
              </div>
            </div>
            <div className="font-display font-bold text-primary font-mono text-sm flex-shrink-0">
              {formatTime(playerScore)}
            </div>
          </motion.div>
        ) : (
          <div className="p-6 text-center text-muted-foreground text-sm">
            No scores yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function GameResult({ score, playerName, onPlayAgain }: GameResultProps) {
  const [, setLocation] = useLocation();
  const hasSubmittedRef = useRef(false);
  const [currentEntryId, setCurrentEntryId] = useState<number | null>(null);
  const [submittedScore, setSubmittedScore] = useState<Score | null>(null);
  const queryClient = useQueryClient();

  const submitScoreMutation = useMutation({
    mutationFn: async (data: { username: string; score: number }) => {
      const res = await apiRequest('POST', '/api/scores', data);
      return res.json() as Promise<Score>;
    },
    onSuccess: async (newScore) => {
      setSubmittedScore(newScore);
      setCurrentEntryId(newScore.id);
      
      await Promise.all(
        periods.flatMap(period => [
          queryClient.invalidateQueries({ queryKey: [`/api/scores?period=${period.key}&limit=5`] }),
          queryClient.invalidateQueries({ queryKey: [`/api/scores?period=${period.key}`] }),
        ])
      );
    },
  });

  useEffect(() => {
    if (playerName.trim() && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      submitScoreMutation.mutate({ username: playerName.trim(), score });
    }
  }, [playerName, score]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4"
        >
          <Button
            variant="ghost"
            className="gap-2 font-bold text-muted-foreground"
            onClick={() => setLocation("/")}
            data-testid="button-back-to-menu"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="flex justify-center mb-3">
            <Trophy className="w-12 h-12 text-yellow-500 fill-yellow-300" />
          </div>
          <h1 className="text-3xl font-display font-black mb-1">You Won!</h1>
          <p className="text-muted-foreground">All words found!</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 mb-6 text-center"
        >
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
            Your Time
          </p>
          <p className="text-4xl font-display font-black text-primary font-mono" data-testid="text-final-time">
            {formatTime(score)}
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2">
          {periods.map((period, index) => (
            <motion.div
              key={period.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <LeaderboardSection 
                period={period} 
                currentEntryId={currentEntryId}
                playerScore={score}
                playerName={playerName}
                submittedScore={submittedScore}
                isSubmitting={submitScoreMutation.isPending}
              />
            </motion.div>
          ))}
        </div>

        {/* Spacer for fixed button */}
        <div className="h-20" />
      </div>

      {/* Fixed Play Again button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t border-border/50"
      >
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={onPlayAgain}
            className="w-full h-12 font-bold gap-2 text-lg"
            data-testid="button-play-again"
          >
            <Play className="w-5 h-5" />
            Play Again
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
