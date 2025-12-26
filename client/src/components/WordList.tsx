import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface WordListProps {
  words: string[];
  foundWords: string[];
}

export function WordList({ words, foundWords }: WordListProps) {
  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-white/60 shadow-lg">
      <h3 className="text-lg font-display font-bold text-foreground/80 mb-4 text-center uppercase tracking-wider">
        Words to Find
      </h3>
      <div className="flex flex-wrap justify-center gap-3">
        {words.map((word) => {
          const isFound = foundWords.includes(word);
          return (
            <motion.div
              key={word}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "px-4 py-2 rounded-full font-bold text-sm border-2 transition-colors duration-300 flex items-center gap-2",
                isFound
                  ? "bg-green-100 border-green-200 text-green-700 line-through decoration-2 decoration-green-500/50"
                  : "bg-white border-white text-foreground shadow-sm hover:scale-105"
              )}
            >
              {word}
              {isFound && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                >
                  <Check className="w-4 h-4" />
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
