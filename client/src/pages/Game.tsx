import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useGameStart } from "@/hooks/use-game";
import { HexGrid } from "@/components/HexGrid";
import { WordList } from "@/components/WordList";
import { GameHeader } from "@/components/GameUI";
import { WinModal } from "@/components/WinModal";
import { HexCell } from "@shared/schema";
import { Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import canvasConfetti from "canvas-confetti";

export default function Game() {
  const [, setLocation] = useLocation();
  const { data: level, isLoading, error, refetch } = useGameStart();
  const [selectedCells, setSelectedCells] = useState<HexCell[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundWordsData, setFoundWordsData] = useState<{word: string; cells: HexCell[]}[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [showNameInput, setShowNameInput] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Load saved name from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem("hexaword_player_name");
    if (savedName) {
      setPlayerName(savedName);
      setShowNameInput(false);
    }
  }, []);
  
  // Reset state when new level loads
  useEffect(() => {
    if (level) {
      setFoundWords([]);
      setFoundWordsData([]);
      setSelectedCells([]);
      setElapsedSeconds(0);
      setIsWon(false);
      // Only show name input if no saved name in localStorage
      const savedName = localStorage.getItem("hexaword_player_name");
      if (savedName) {
        setPlayerName(savedName);
        setShowNameInput(false);
      } else {
        setShowNameInput(true);
      }
    }
  }, [level]);

  // Timer effect
  useEffect(() => {
    if (!showNameInput && !isWon && level) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [showNameInput, isWon, level]);

  const areNeighbors = (c1: HexCell, c2: HexCell) => {
    const dq = c2.q - c1.q;
    const dr = c2.r - c1.r;
    const isValid =
      (dq === 1 && dr === 0) || (dq === 1 && dr === -1) || (dq === 0 && dr === -1) ||
      (dq === -1 && dr === 0) || (dq === -1 && dr === 1) || (dq === 0 && dr === 1);
    return isValid;
  };

  const handleSelectionStart = (cell: HexCell) => {
    if (isWon || showNameInput) return;
    setSelectedCells([cell]);
  };

  const handleSelectionMove = (cell: HexCell) => {
    if (isWon || selectedCells.length === 0 || showNameInput || !level) return;

    const lastCell = selectedCells[selectedCells.length - 1];

    if (cell.q === lastCell.q && cell.r === lastCell.r) return;

    if (selectedCells.length > 1) {
      const prevCell = selectedCells[selectedCells.length - 2];
      if (cell.q === prevCell.q && cell.r === prevCell.r) {
        setSelectedCells(prev => prev.slice(0, -1));
        return;
      }
    }

    if (areNeighbors(lastCell, cell) && !selectedCells.some(c => c.q === cell.q && c.r === cell.r)) {
      const newSelection = [...selectedCells, cell];
      const word = newSelection.map(c => c.letter).join("");
      
      if (level.words.includes(word) && !foundWords.includes(word)) {
        setFoundWords(prev => [...prev, word]);
        setFoundWordsData(prev => [...prev, { word, cells: newSelection }]);
        setSelectedCells([]);

        toast({
          title: "Word Found!",
          description: `"${word}"`,
          className: "bg-green-500 text-white border-none font-bold",
          duration: 1500,
        });

        if (foundWords.length + 1 === level.words.length) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsWon(true);
          canvasConfetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#FF69B4', '#00BFFF']
          });
        }
      } else {
        setSelectedCells(newSelection);
      }
    }
  };

  const handleSelectionEnd = () => {
    if (!level || selectedCells.length === 0 || showNameInput) return;

    const word = selectedCells.map(c => c.letter).join("");

    if (level.words.includes(word) && !foundWords.includes(word)) {
      setFoundWords(prev => [...prev, word]);
      setFoundWordsData(prev => [...prev, { word, cells: [...selectedCells] }]);

      toast({
        title: "Word Found!",
        description: `"${word}"`,
        className: "bg-green-500 text-white border-none font-bold",
        duration: 1500,
      });

      if (foundWords.length + 1 === level.words.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsWon(true);
        canvasConfetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FF69B4', '#00BFFF']
        });
      }
    }

    setSelectedCells([]);
  };

  const handleStartGame = () => {
    if (playerName.trim()) {
      localStorage.setItem("hexaword_player_name", playerName.trim());
      setShowNameInput(false);
    }
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
    <div className="fixed inset-0 bg-background flex flex-col">
      
      {/* Name Input Modal */}
      {showNameInput && level && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4">
            <h2 className="text-3xl font-display font-black mb-2 text-center">Enter Your Name</h2>
            <p className="text-muted-foreground text-center mb-6">Your time will be saved to the leaderboard</p>
            <Input
              placeholder="Your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStartGame()}
              className="mb-4 h-12 text-lg"
              data-testid="input-player-name"
              autoFocus
            />
            <Button
              onClick={handleStartGame}
              className="w-full h-12 font-bold"
              disabled={!playerName.trim()}
              data-testid="button-start-game"
            >
              Start Game
            </Button>
          </div>
        </div>
      )}
      
      {/* Header Area - Fixed at top */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-white/80 backdrop-blur rounded-2xl m-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/")}
          data-testid="button-back-to-menu"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <GameHeader 
          elapsedSeconds={elapsedSeconds}
          onReset={() => {
            if (confirm("Restart game? Progress will be lost.")) refetch();
          }}
        />
        <div className="w-10" />
      </div>

      {/* Main Game Area - Takes remaining space */}
      <div className="flex-1 w-full overflow-hidden relative">
        
        {/* Background decorative blob */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-secondary/5 to-accent/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        
        {/* Hex Grid - Fills full width and height */}
        <HexGrid
          grid={level.grid}
          selectedCells={selectedCells}
          foundWords={foundWordsData}
          onSelectionStart={handleSelectionStart}
          onSelectionMove={handleSelectionMove}
          onSelectionEnd={handleSelectionEnd}
          isProcessing={false}
        />
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
        score={elapsedSeconds}
        playerName={playerName}
        onPlayAgain={() => {
          refetch();
        }}
      />
    </div>
  );
}
