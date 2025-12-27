import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

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
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (playerName.trim()) {
      const scores = JSON.parse(localStorage.getItem("hexaword_scores") || "[]");
      scores.push({
        id: Date.now(),
        username: playerName.trim(),
        score,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem("hexaword_scores", JSON.stringify(scores));
      setSubmitted(true);
    }
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
            className="bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border border-primary/20 rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Trophy className="w-16 h-16 text-yellow-500 fill-yellow-300" />
              </div>

              <h2 className="text-3xl font-display font-black mb-2">You Won!</h2>
              <p className="text-muted-foreground mb-6">All words found!</p>

              <div className="bg-white/80 backdrop-blur rounded-2xl p-4 mb-6">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Final Time
                </p>
                <p className="text-4xl font-display font-black text-primary font-mono">{formatTime(score)}</p>
              </div>

              {!submitted ? (
                <Button
                  onClick={handleSubmit}
                  className="w-full font-bold mb-4"
                  disabled={!playerName.trim()}
                  data-testid="button-submit-score"
                >
                  Save to Leaderboard
                </Button>
              ) : (
                <div className="bg-green-100 text-green-700 rounded-2xl p-4 font-bold mb-4">
                  Time saved to leaderboard!
                </div>
              )}

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
