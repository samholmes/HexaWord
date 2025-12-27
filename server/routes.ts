import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { HexCell } from "@shared/schema";

const WORDS_POOL = [
  // Technology
  "REACT", "TYPESCRIPT", "NODE", "EXPRESS", "VITE", 
  "TAILWIND", "DRIZZLE", "POSTGRES", "REPLIT", "CODING", 
  "DEBUG", "DEPLOY", "COMPONENT", "HOOK", "STATE",
  "JAVASCRIPT", "PYTHON", "JAVA", "DATABASE", "NETWORK",
  "SERVER", "CLIENT", "API", "CACHE", "QUERY",
  "FUNCTION", "VARIABLE", "COMPILE", "RUNTIME", "KERNEL",
  "BROWSER", "SOFTWARE", "HARDWARE", "MEMORY", "PROCESSOR",
  
  // Animals
  "LION", "TIGER", "ELEPHANT", "BEAR", "WOLF",
  "EAGLE", "PENGUIN", "DOLPHIN", "SHARK", "WHALE",
  "ZEBRA", "GIRAFFE", "MONKEY", "RABBIT", "DEER",
  "SNAKE", "TURTLE", "FISH", "BIRD", "CAT",
  "DOG", "HORSE", "COW", "PIG", "SHEEP",
  "PANDA", "KOALA", "OTTER", "FOX", "BADGER",
  
  // Food & Drink
  "APPLE", "BANANA", "ORANGE", "GRAPE", "LEMON",
  "BREAD", "CHEESE", "BUTTER", "MILK", "YOGURT",
  "PIZZA", "PASTA", "RICE", "BEANS", "CORN",
  "CARROT", "ONION", "GARLIC", "LETTUCE", "TOMATO",
  "MEAT", "FISH", "CHICKEN", "BEEF", "PORK",
  "CHOCOLATE", "COOKIE", "CAKE", "CANDY", "COFFEE",
  "TEA", "JUICE", "WATER", "WINE", "BEER",
  
  // Nature & Geography
  "MOUNTAIN", "FOREST", "RIVER", "OCEAN", "DESERT",
  "BEACH", "ISLAND", "VALLEY", "CANYON", "GLACIER",
  "VOLCANO", "LAKE", "POND", "CREEK", "WATERFALL",
  "TREE", "FLOWER", "GRASS", "MOSS", "FERN",
  "SUN", "MOON", "STAR", "CLOUD", "RAIN",
  "SNOW", "WIND", "STORM", "THUNDER", "LIGHTNING",
  
  // Sports
  "SOCCER", "FOOTBALL", "BASKETBALL", "BASEBALL", "TENNIS",
  "HOCKEY", "RUGBY", "CRICKET", "GOLF", "BOWLING",
  "SWIMMING", "RUNNING", "JUMPING", "SKIING", "BOXING",
  "WRESTLING", "ARCHERY", "CYCLING", "SKATING", "CLIMBING",
  
  // Colors
  "RED", "BLUE", "GREEN", "YELLOW", "ORANGE",
  "PURPLE", "PINK", "BROWN", "BLACK", "WHITE",
  "GRAY", "SILVER", "GOLD", "CYAN", "MAGENTA",
  
  // Body Parts
  "HEAD", "HAND", "FOOT", "HEART", "BRAIN",
  "EYES", "EARS", "NOSE", "MOUTH", "TEETH",
  "ARM", "LEG", "BACK", "CHEST", "STOMACH",
  "FINGER", "THUMB", "TOE", "NAIL", "BONE",
  
  // Objects & Tools
  "HAMMER", "KNIFE", "FORK", "SPOON", "PLATE",
  "CHAIR", "TABLE", "DOOR", "WINDOW", "WALL",
  "LAMP", "MIRROR", "CLOCK", "BOOK", "PENCIL",
  "PEN", "PAPER", "PAINT", "BRUSH", "ROPE",
  "BALL", "TOY", "DOLL", "PUZZLE", "GAME",
  
  // Professions
  "DOCTOR", "NURSE", "TEACHER", "LAWYER", "ENGINEER",
  "ARTIST", "ACTOR", "SINGER", "DANCER", "WRITER",
  "COOK", "WAITER", "PILOT", "CAPTAIN", "SOLDIER",
  "POLICE", "FARMER", "BUILDER", "MECHANIC", "MANAGER",
  
  // Weather & Seasons
  "SUMMER", "WINTER", "SPRING", "AUTUMN", "SUNNY",
  "RAINY", "CLOUDY", "WINDY", "COLD", "HOT",
  "WARM", "COOL", "FREEZING", "HUMID", "DRY",
  
  // Emotions & Feelings
  "HAPPY", "SAD", "ANGRY", "SCARED", "EXCITED",
  "TIRED", "SLEEPY", "HUNGRY", "THIRSTY", "NERVOUS",
  "BRAVE", "CALM", "QUIET", "LOUD", "SILENT",
  
  // Numbers & Shapes
  "CIRCLE", "SQUARE", "TRIANGLE", "RECTANGLE", "DIAMOND",
  "OVAL", "SPHERE", "CUBE", "PYRAMID", "CYLINDER",
  
  // Actions & Verbs
  "JUMP", "WALK", "RUN", "FLY", "SWIM",
  "DANCE", "SING", "LAUGH", "CRY", "SLEEP",
  "EAT", "DRINK", "READ", "WRITE", "DRAW",
  "PAINT", "BUILD", "BREAK", "CATCH", "THROW",
  "KICK", "PUSH", "PULL", "CLIMB", "FALL",
  
  // Adjectives
  "BIG", "SMALL", "TALL", "SHORT", "LONG",
  "FAST", "SLOW", "HARD", "SOFT", "ROUGH",
  "SMOOTH", "SHARP", "DULL", "BRIGHT", "DARK",
  "HEAVY", "LIGHT", "THICK", "THIN", "WIDE",
  
  // Musical Instruments
  "PIANO", "GUITAR", "VIOLIN", "DRUMS", "TRUMPET",
  "FLUTE", "HARP", "HORN", "ORGAN", "CELLO",
  
  // Vehicles
  "BIKE", "CAR", "TRUCK", "TRAIN", "PLANE",
  "BOAT", "SHIP", "BUS", "TAXI", "JEEP",
  
  // Countries & Places
  "FRANCE", "CHINA", "JAPAN", "MEXICO", "EGYPT",
  "BRAZIL", "CANADA", "RUSSIA", "INDIA", "AFRICA",
  "EUROPE", "AMERICA", "PARIS", "LONDON", "TOKYO"
];

const GRID_RADIUS = 4; // Hex grid radius

function getHexNeighbors(q: number, r: number) {
  const directions = [
    { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
    { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
  ];
  return directions.map(d => ({ q: q + d.q, r: r + d.r }));
}

function generateLevel() {
  // 1. Initialize Grid
  const grid: Map<string, HexCell> = new Map();
  for (let q = -GRID_RADIUS; q <= GRID_RADIUS; q++) {
    const r1 = Math.max(-GRID_RADIUS, -q - GRID_RADIUS);
    const r2 = Math.min(GRID_RADIUS, -q + GRID_RADIUS);
    for (let r = r1; r <= r2; r++) {
      grid.set(`${q},${r}`, { q, r, letter: '' });
    }
  }

  // 2. Place Words
  const selectedWords: string[] = [];
  const wordsToPlace = [...WORDS_POOL].sort(() => 0.5 - Math.random()).slice(0, 6); // Pick 6 random words

  for (const word of wordsToPlace) {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 50) {
      attempts++;
      // Pick random start cell
      const cells = Array.from(grid.values());
      let current = cells[Math.floor(Math.random() * cells.length)];
      const path: HexCell[] = [];
      let valid = true;
      
      // Try to walk for the word
      for (let i = 0; i < word.length; i++) {
        // Check if current cell is compatible
        if (current.letter && current.letter !== word[i]) {
          valid = false;
          break;
        }
        
        path.push(current);
        
        if (i < word.length - 1) {
          // Find valid neighbors for next letter
          const neighbors = getHexNeighbors(current.q, current.r)
            .map(n => grid.get(`${n.q},${n.r}`))
            .filter(n => n !== undefined && !path.includes(n!)); // Don't loop back immediately in same word placement (optional)
            
          if (neighbors.length === 0) {
            valid = false;
            break;
          }
          current = neighbors[Math.floor(Math.random() * neighbors.length)]!;
        }
      }

      if (valid) {
        // Commit path
        path.forEach((cell, i) => {
          cell.letter = word[i];
          grid.set(`${cell.q},${cell.r}`, cell);
        });
        selectedWords.push(word);
        placed = true;
      }
    }
  }

  // 3. Fill remaining
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (const cell of grid.values()) {
    if (!cell.letter) {
      cell.letter = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    }
  }

  return {
    grid: Array.from(grid.values()),
    words: selectedWords
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.game.start.path, (_req, res) => {
    const level = generateLevel();
    res.json(level);
  });

  app.get(api.scores.list.path, async (_req, res) => {
    const scores = await storage.getTopScores();
    res.json(scores);
  });

  app.post(api.scores.submit.path, async (req, res) => {
    try {
      const input = api.scores.submit.input.parse(req.body);
      const score = await storage.createScore(input);
      res.status(201).json(score);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  return httpServer;
}
