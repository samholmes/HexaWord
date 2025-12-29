import { useEffect, useRef, useCallback } from "react";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Medal, Trophy, Clock, CalendarDays, CalendarRange, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useInfiniteQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Score } from "@shared/schema";

type TimePeriod = 'today' | 'week' | 'month' | 'all';

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const periodConfig: Record<TimePeriod, { label: string; icon: typeof Clock }> = {
  today: { label: 'Today', icon: Clock },
  week: { label: 'This Week', icon: CalendarDays },
  month: { label: 'This Month', icon: CalendarRange },
  all: { label: 'All Time', icon: Trophy },
};

const PAGE_SIZE = 20;

export default function LeaderboardFull() {
  const params = useParams<{ period: string }>();
  const period = (params.period as TimePeriod) || 'all';
  const validPeriod = ['today', 'week', 'month', 'all'].includes(period) ? period : 'all';
  
  const config = periodConfig[validPeriod];
  const Icon = config.icon;
  
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['leaderboard', validPeriod],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await apiRequest('GET', `/api/scores?period=${validPeriod}&limit=${PAGE_SIZE}&offset=${pageParam}`);
      return res.json() as Promise<Score[]>;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length * PAGE_SIZE;
    },
  });

  const scores = data?.pages.flat() ?? [];

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <Link href="/scores">
            <Button variant="ghost" className="gap-2 font-bold text-muted-foreground">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-primary font-display font-black text-xl uppercase tracking-wider">
            <Icon className="w-6 h-6" />
            {config.label}
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-lg border border-border/50 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading...
            </div>
          ) : scores.length > 0 ? (
            <div className="divide-y divide-border/50">
              {scores.map((score, index) => {
                const isTop3 = index < 3;
                return (
                  <motion.div
                    key={score.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(index * 0.02, 0.5) }}
                    className={cn(
                      "flex items-center justify-between gap-4 p-4 md:p-5",
                      isTop3 && "bg-gradient-to-r from-yellow-50/50 dark:from-yellow-900/10 to-transparent"
                    )}
                    data-testid={`row-score-${score.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-black text-lg flex-shrink-0",
                        index === 0 ? "bg-yellow-400 text-yellow-900 shadow-lg shadow-yellow-200 dark:shadow-yellow-900/30" :
                        index === 1 ? "bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-slate-200" :
                        index === 2 ? "bg-amber-600 text-amber-100" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-lg text-foreground flex items-center gap-2 flex-wrap">
                          <span className="truncate" data-testid={`text-username-${score.id}`}>{score.username}</span>
                          {isTop3 && <Medal className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {score.createdAt ? format(new Date(score.createdAt), 'MMM d, yyyy') : 'Unknown Date'}
                        </div>
                      </div>
                    </div>
                    <div className="font-display font-black text-xl md:text-2xl text-primary font-mono flex-shrink-0" data-testid={`text-time-${score.id}`}>
                      {formatTime(score.score)}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              No scores recorded yet for this period.
            </div>
          )}
          
          <div ref={loadMoreRef} className="p-4">
            {isFetchingNextPage && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading more...
              </div>
            )}
            {!hasNextPage && scores.length > 0 && (
              <div className="text-center text-sm text-muted-foreground">
                End of leaderboard
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
