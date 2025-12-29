import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Play, Trophy, Hexagon } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { SettingsSheet } from "@/components/SettingsSheet";

export default function Home() {
  const [, setLocation] = useLocation();
  const [savedName, setSavedName] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("hexaword_player_name");
    if (name) {
      setSavedName(name);
    }
  }, []);

  const handleStartGame = () => {
    setLocation("/game");
  };

  const handleStartNewGame = () => {
    localStorage.removeItem("hexaword_player_name");
    setSavedName("");
    setLocation("/game");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Settings Button */}
      <SettingsSheet />
      
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl" 
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/20 rounded-full blur-3xl" 
        />
      </div>

      <div className="z-10 text-center space-y-8 px-6 max-w-lg w-full">
        {/* Logo/Title */}
        <div className="space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-24 h-24 bg-gradient-to-br from-primary to-purple-600 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-primary/30 rotate-12 mb-6"
          >
            <Hexagon className="w-12 h-12 text-white fill-white/20 stroke-[3]" />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight text-foreground drop-shadow-sm">
            HEXA<span className="text-primary">WORD</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-xs mx-auto">
            Connect letters, find words, challenge your brain!
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4 w-full pt-8">
          {savedName ? (
            <>
              <Button
                onClick={handleStartGame}
                size="lg"
                className="w-full text-xl py-8 rounded-2xl shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300 bg-primary hover:bg-primary/90"
              >
                <Play className="w-6 h-6 mr-3 fill-current" />
                Continue as {savedName}
              </Button>
              <Button
                onClick={handleStartNewGame}
                variant="outline"
                size="lg"
                className="w-full text-xl py-8 rounded-2xl border-2 hover:bg-muted/50 transition-all duration-200"
              >
                New Player
              </Button>
            </>
          ) : (
            <Button
              onClick={handleStartGame}
              size="lg"
              className="w-full text-xl py-8 rounded-2xl shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300 bg-primary hover:bg-primary/90"
            >
              <Play className="w-6 h-6 mr-3 fill-current" />
              Start Game
            </Button>
          )}
          
          <Link href="/scores">
            <Button variant="outline" size="lg" className="w-full text-xl py-8 rounded-2xl border-2 hover:bg-muted/50 transition-all duration-200">
              <Trophy className="w-6 h-6 mr-3" />
              Leaderboard
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="absolute bottom-6 text-sm text-muted-foreground font-medium opacity-50">
        © 2024 HexaWord Game
      </div>
    </div>
  );
}
