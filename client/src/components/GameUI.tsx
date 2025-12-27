import { motion, AnimatePresence } from "framer-motion";
import { Clock } from "lucide-react";

interface GameHeaderProps {
  elapsedSeconds: number;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export function GameHeader({ elapsedSeconds }: GameHeaderProps) {
  return (
    <div className="w-full flex justify-between items-center px-4 py-2">
      <div className="bg-white/80 backdrop-blur rounded-2xl p-3 shadow-sm border border-white/50 flex items-center gap-2">
        <div className="bg-accent/20 p-2 rounded-xl text-accent-foreground">
          <Clock className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Time</span>
          <span className="text-xl font-display font-black leading-none font-mono">{formatTime(elapsedSeconds)}</span>
        </div>
      </div>
    </div>
  );
}
