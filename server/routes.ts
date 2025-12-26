import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { HexCell } from "@shared/schema";

const WORDS_POOL = [
  "REACT", "TYPESCRIPT", "NODE", "EXPRESS", "VITE", 
  "TAILWIND", "DRIZZLE", "POSTGRES", "REPLIT", "CODING", 
  "DEBUG", "DEPLOY", "COMPONENT", "HOOK", "STATE"
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
