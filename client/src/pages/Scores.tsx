import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Medal, Trophy, Clock, CalendarDays, CalendarRange, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import type { Score } from "@shared/schema";

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

function LeaderboardSection({ period }: { period: typeof periods[number] }) {
  const Icon = period.icon;
  
  const { data: scores = [], isLoading } = useQuery<Score[]>({
    queryKey: [`/api/scores?period=${period.key}&limit=5`],
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-display">
          <Icon className="w-5 h-5 text-primary" />
          {period.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 text-center text-muted-foreground text-sm">Loading...</div>
        ) : scores.length > 0 ? (
          <>
            <div className="divide-y divide-border/50">
              {scores.map((score, index) => (
                <motion.div
                  key={score.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "flex items-center justify-between gap-3 px-4 py-3",
                    index === 0 && "bg-gradient-to-r from-yellow-50/50 dark:from-yellow-900/10 to-transparent"
                  )}
                  data-testid={`row-score-${period.key}-${score.id}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0",
                      index === 0 ? "bg-yellow-400 text-yellow-900" :
                      index === 1 ? "bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-slate-200" :
                      index === 2 ? "bg-amber-600 text-amber-100" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground truncate flex items-center gap-1.5">
                        {score.username}
                        {index === 0 && <Medal className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {score.createdAt ? format(new Date(score.createdAt), 'MMM d') : ''}
                      </div>
                    </div>
                  </div>
                  <div className="font-display font-bold text-primary font-mono text-sm flex-shrink-0">
                    {formatTime(score.score)}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="p-3 border-t border-border/50">
              <Link href={`/leaderboard/${period.key}`}>
                <Button variant="ghost" className="w-full gap-2 text-muted-foreground" data-testid={`button-see-all-${period.key}`}>
                  See All
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="p-6 text-center text-muted-foreground text-sm">
            No scores yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Scores() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <Link href="/">
            <Button variant="ghost" className="gap-2 font-bold text-muted-foreground">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-primary font-display font-black text-xl md:text-2xl uppercase tracking-wider">
            <Trophy className="w-6 h-6 md:w-8 md:h-8 fill-current" />
            Leaderboards
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {periods.map((period) => (
            <LeaderboardSection key={period.key} period={period} />
          ))}
        </div>
      </div>
    </div>
  );
}
