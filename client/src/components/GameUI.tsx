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
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4 text-muted-foreground" />
      <span className="text-lg font-display font-bold font-mono">{formatTime(elapsedSeconds)}</span>
    </div>
  );
}
