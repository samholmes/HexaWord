import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Medal, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useState, useEffect } from "react";

interface Score {
  id: number;
  username: string;
  score: number;
  createdAt: string;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function Scores() {
  const [scores, setScores] = useState<Score[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedScores = localStorage.getItem("hexaword_scores");
    if (savedScores) {
      setScores(JSON.parse(savedScores));
    }
    setIsLoading(false);
  }, []);

  const sortedScores = [...scores].sort((a, b) => a.score - b.score);

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost" className="gap-2 font-bold text-muted-foreground hover:text-primary">
              <ArrowLeft className="w-4 h-4" />
              Back to Game
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-primary font-display font-black text-2xl uppercase tracking-wider">
            <Trophy className="w-8 h-8 fill-current" />
            Fastest Times
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-border/50 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground">Loading leaderboard...</div>
          ) : sortedScores && sortedScores.length > 0 ? (
            <div className="divide-y divide-border/50">
              {sortedScores.map((score, index) => {
                const isTop3 = index < 3;
                return (
                  <motion.div
                    key={score.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "flex items-center justify-between p-4 md:p-6 hover:bg-muted/30 transition-colors",
                      isTop3 && "bg-gradient-to-r from-yellow-50/50 to-transparent"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-black text-lg",
                        index === 0 ? "bg-yellow-400 text-yellow-900 shadow-lg shadow-yellow-200" :
                        index === 1 ? "bg-slate-300 text-slate-800" :
                        index === 2 ? "bg-amber-600 text-amber-100" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-lg text-foreground flex items-center gap-2">
                          {score.username}
                          {isTop3 && <Medal className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {score.createdAt ? format(new Date(score.createdAt), 'MMM d, yyyy') : 'Unknown Date'}
                        </div>
                      </div>
                    </div>
                    <div className="font-display font-black text-2xl text-primary font-mono">
                      {formatTime(score.score)}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              No times recorded yet. Be the first to play!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
