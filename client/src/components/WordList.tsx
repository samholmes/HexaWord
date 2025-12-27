import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface WordListProps {
  words: string[];
  foundWords: string[];
}

export function WordList({ words, foundWords }: WordListProps) {
  const sortedWords = [...words].sort((a, b) => {
    const aFound = foundWords.includes(a);
    const bFound = foundWords.includes(b);
    if (aFound === bFound) return 0;
    return aFound ? 1 : -1;
  });

  return (
    <div className="w-full overflow-x-auto overflow-y-hidden">
      <div className="px-4 py-3 pb-8 flex items-center gap-3 min-w-max">
        <h3 className="text-sm font-display font-bold text-muted-foreground uppercase tracking-wider flex-shrink-0">
          Words to Find:
        </h3>
        {sortedWords.map((word) => {
          const isFound = foundWords.includes(word);
          return (
            <motion.div
              key={word}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "px-3 py-1.5 rounded-full font-bold text-xs border-2 transition-colors duration-300 flex items-center gap-2 flex-shrink-0 whitespace-nowrap",
                isFound
                  ? "bg-green-100 border-green-300 text-green-700 line-through decoration-2 decoration-green-500/50"
                  : "bg-white border-white text-foreground shadow-sm hover-elevate"
              )}
            >
              {word}
              {isFound && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                >
                  <Check className="w-3 h-3" />
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
