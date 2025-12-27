import { useState, useEffect, useRef } from "react";
import { useGameStart } from "@/hooks/use-game";
import { HexGrid } from "@/components/HexGrid";
import { WordList } from "@/components/WordList";
import { GameHeader } from "@/components/GameUI";
import { WinModal } from "@/components/WinModal";
import { HexCell } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import canvasConfetti from "canvas-confetti";

export default function Game() {
  const { data: level, isLoading, error, refetch } = useGameStart();
  const [selectedCells, setSelectedCells] = useState<HexCell[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundWordsCells, setFoundWordsCells] = useState<HexCell[][]>([]);
  const [score, setScore] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const { toast } = useToast();
  
  // Reset state when new level loads
  useEffect(() => {
    if (level) {
      setFoundWords([]);
      setFoundWordsCells([]);
      setSelectedCells([]);
      setScore(0);
      setIsWon(false);
    }
  }, [level]);

  // Derived state
  const currentWord = selectedCells.map(c => c.letter).join("");

  // Game Logic Helpers
  const areNeighbors = (c1: HexCell, c2: HexCell) => {
    const dq = c2.q - c1.q;
    const dr = c2.r - c1.r;
    // Axial neighbor offsets: (+1,0), (+1,-1), (0,-1), (-1,0), (-1,+1), (0,+1)
    const isValid = 
      (dq === 1 && dr === 0) || (dq === 1 && dr === -1) || (dq === 0 && dr === -1) ||
      (dq === -1 && dr === 0) || (dq === -1 && dr === 1) || (dq === 0 && dr === 1);
    return isValid;
  };

  const handleSelectionStart = (cell: HexCell) => {
    if (isWon) return;
    setSelectedCells([cell]);
  };

  const handleSelectionMove = (cell: HexCell) => {
    if (isWon || selectedCells.length === 0) return;

    const lastCell = selectedCells[selectedCells.length - 1];
    
    // Prevent selecting the same cell twice consecutively (no loops in place)
    if (cell.q === lastCell.q && cell.r === lastCell.r) return;

    // Allow backtracking: if we move to the 2nd to last cell, pop the last one
    if (selectedCells.length > 1) {
      const prevCell = selectedCells[selectedCells.length - 2];
      if (cell.q === prevCell.q && cell.r === prevCell.r) {
        setSelectedCells(prev => prev.slice(0, -1));
        return;
      }
    }

    // Only add if neighbor and not already in current selection path
    // (Actually game rules often allow crossing path? Implementation note 2 says "reuse letters" but usually not in same word instance. Let's block self-intersection for simplicity unless rules say otherwise. "reuse letters" usually means across different words.)
    if (areNeighbors(lastCell, cell) && !selectedCells.some(c => c.q === cell.q && c.r === cell.r)) {
      setSelectedCells(prev => [...prev, cell]);
    }
  };

  const handleSelectionEnd = () => {
    if (!level || selectedCells.length === 0) return;

    const word = selectedCells.map(c => c.letter).join("");
    
    if (level.words.includes(word) && !foundWords.includes(word)) {
      // Success!
      setFoundWords(prev => [...prev, word]);
      setFoundWordsCells(prev => [...prev, [...selectedCells]]);
      
      // Score calculation: length * 100
      const wordScore = word.length * 100;
      setScore(prev => prev + wordScore);

      toast({
        title: "Nice find!",
        description: `Found "${word}" (+${wordScore} pts)`,
        className: "bg-green-500 text-white border-none font-bold",
        duration: 1500,
      });

      // Check win condition
      if (foundWords.length + 1 === level.words.length) {
        setIsWon(true);
        canvasConfetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FF69B4', '#00BFFF']
        });
      }
    } else if (word.length > 0) {
      // Invalid word feedback could go here (shake animation maybe?)
    }

    setSelectedCells([]);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-display text-lg animate-pulse">Generating Grid...</p>
      </div>
    );
  }

  if (error || !level) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-destructive mb-2">Oops!</h2>
        <p className="text-muted-foreground mb-6">Something went wrong loading the level.</p>
        <button 
          onClick={() => refetch()}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg hover:opacity-90 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden">
      
      {/* Header Area - Fixed at top */}
      <div className="flex-shrink-0 px-4 py-3">
        <GameHeader 
          currentWord={currentWord} 
          score={score} 
          onReset={() => {
            if (confirm("Restart game? Progress will be lost.")) refetch();
          }}
        />
      </div>

      {/* Main Game Area - Takes remaining space */}
      <div className="flex-1 w-full flex flex-col overflow-hidden relative">
        
        {/* Background decorative blob */}
        <div className="absolute inset-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-gradient-to-tr from-primary/10 via-secondary/10 to-accent/10 rounded-full blur-3xl -z-10 animate-pulse-slow pointer-events-none"></div>
        
        {/* Hex Grid - Centered and responsive */}
        <div className="flex-1 flex items-center justify-center overflow-hidden p-4">
          <HexGrid
            grid={level.grid}
            selectedCells={selectedCells}
            foundWordsCells={foundWordsCells}
            onSelectionStart={handleSelectionStart}
            onSelectionMove={handleSelectionMove}
            onSelectionEnd={handleSelectionEnd}
            isProcessing={false}
          />
        </div>
      </div>

      {/* Word List - Fixed at bottom, horizontally scrollable */}
      <div className="flex-shrink-0 border-t border-border/30 bg-background/80 backdrop-blur-sm">
        <WordList 
          words={level.words} 
          foundWords={foundWords} 
        />
      </div>

      {/* Win Modal */}
      <WinModal 
        isOpen={isWon} 
        score={score} 
        onPlayAgain={() => refetch()} 
      />
    </div>
  );
}
