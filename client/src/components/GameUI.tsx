import { motion, AnimatePresence } from "framer-motion";
import { Clock, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GameHeaderProps {
  elapsedSeconds: number;
  onReset?: () => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export function GameHeader({ elapsedSeconds, onReset }: GameHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-4 mb-2">
      <div className="w-full flex justify-between items-center px-4">
        <div className="bg-white/80 backdrop-blur rounded-2xl p-3 shadow-sm border border-white/50 flex items-center gap-2">
          <div className="bg-accent/20 p-2 rounded-xl text-accent-foreground">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Time</span>
            <span className="text-xl font-display font-black leading-none font-mono">{formatTime(elapsedSeconds)}</span>
          </div>
        </div>
        
        {onReset && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onReset}
            className="hover:bg-destructive/10 hover:text-destructive rounded-full"
            data-testid="button-reset-game"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        )}
      </div>

      <div className="h-16 flex items-center justify-center relative w-full">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            className="text-4xl md:text-5xl font-display font-black tracking-wide text-center uppercase text-shadow-sm text-muted-foreground/30"
          >
            Find All Words
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
