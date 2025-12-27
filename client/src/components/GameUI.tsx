import { motion, AnimatePresence } from "framer-motion";
import { Trophy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GameHeaderProps {
  currentWord: string;
  score: number;
  onReset?: () => void;
}

export function GameHeader({ currentWord, score, onReset }: GameHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-4 mb-2">
      <div className="w-full flex justify-between items-center px-4">
        <div className="bg-white/80 backdrop-blur rounded-2xl p-3 shadow-sm border border-white/50 flex items-center gap-2">
          <div className="bg-accent/20 p-2 rounded-xl text-accent-foreground">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Score</span>
            <span className="text-xl font-display font-black leading-none">{score}</span>
          </div>
        </div>
        
        {onReset && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onReset}
            className="hover:bg-destructive/10 hover:text-destructive rounded-full"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        )}
      </div>

      <div className="h-16 flex items-center justify-center relative w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWord || "placeholder"}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            className={cn(
              "text-4xl md:text-5xl font-display font-black tracking-wide text-center uppercase text-shadow-sm",
              currentWord ? "text-primary scale-110" : "text-muted-foreground/30"
            )}
          >
            {currentWord || "Connect Letters"}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
