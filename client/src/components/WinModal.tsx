import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useSubmitScore } from "@/hooks/use-scores";
import { motion } from "framer-motion";
import { Trophy, RefreshCw } from "lucide-react";

interface WinModalProps {
  isOpen: boolean;
  score: number;
  onPlayAgain: () => void;
}

export function WinModal({ isOpen, score, onPlayAgain }: WinModalProps) {
  const [username, setUsername] = useState("");
  const { mutate, isPending, isSuccess } = useSubmitScore();

  const handleSubmit = () => {
    if (!username.trim()) return;
    mutate({ username, score });
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border-white/40 shadow-2xl rounded-3xl p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-primary to-accent p-8 text-center relative overflow-hidden">
          {/* Confetti-like decorations */}
          <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
          
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 1 }}
            className="bg-white rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center shadow-lg relative z-10"
          >
            <Trophy className="w-12 h-12 text-accent" />
          </motion.div>
          
          <DialogTitle className="text-3xl font-display font-black text-white mb-2 relative z-10 text-shadow-lg">
            Level Complete!
          </DialogTitle>
          <div className="text-white/90 font-bold relative z-10">
            Final Score: <span className="text-2xl ml-1">{score}</span>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {!isSuccess ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                  Save your high score
                </label>
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter your name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="flex-1 rounded-xl border-2 border-muted focus-visible:ring-primary/30 text-lg font-display"
                    maxLength={10}
                  />
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isPending || !username}
                    className="rounded-xl px-6 font-bold shadow-lg shadow-primary/20 hover:translate-y-[-2px] transition-all"
                  >
                    {isPending ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 text-green-800 p-4 rounded-xl border border-green-100 text-center font-bold"
            >
              Score saved! You're a legend. 🌟
            </motion.div>
          )}

          <Button 
            onClick={onPlayAgain}
            variant="outline"
            className="w-full rounded-xl py-6 font-bold text-lg border-2 hover:bg-muted/50 gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Play Again
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
