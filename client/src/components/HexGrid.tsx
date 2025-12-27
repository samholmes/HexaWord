import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { HexCell } from "@shared/schema";

// Geometric constants for flat-topped hexagons
const HEX_SIZE = 45; // Radius
const HEX_WIDTH = HEX_SIZE * 2;
const HEX_HEIGHT = Math.sqrt(3) * HEX_SIZE;
const SPACING = 1.05; // Gap between hexes

interface Point {
  x: number;
  y: number;
}

interface HexGridProps {
  grid: HexCell[];
  selectedCells: HexCell[];
  foundWordsCells: HexCell[][]; // Array of arrays of cells that make up found words
  onSelectionStart: (cell: HexCell) => void;
  onSelectionMove: (cell: HexCell) => void;
  onSelectionEnd: () => void;
  isProcessing: boolean; // Visual feedback while validating
}

export function HexGrid({
  grid,
  selectedCells,
  foundWordsCells,
  onSelectionStart,
  onSelectionMove,
  onSelectionEnd,
  isProcessing
}: HexGridProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Convert axial (q,r) to pixel (x,y)
  const hexToPixel = useCallback((q: number, r: number): Point => {
    const x = HEX_SIZE * (3/2 * q) * SPACING;
    const y = HEX_SIZE * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r) * SPACING;
    return { x, y };
  }, []);

  // Calculate center offset to center the grid in SVG
  const calculateViewBox = () => {
    if (grid.length === 0) return "0 0 100 100";
    
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    
    grid.forEach(cell => {
      const { x, y } = hexToPixel(cell.q, cell.r);
      minX = Math.min(minX, x - HEX_WIDTH/2);
      maxX = Math.max(maxX, x + HEX_WIDTH/2);
      minY = Math.min(minY, y - HEX_HEIGHT/2);
      maxY = Math.max(maxY, y + HEX_HEIGHT/2);
    });

    const padding = HEX_SIZE * 2;
    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;
    
    return `${minX - padding} ${minY - padding} ${width} ${height}`;
  };

  // Generate hexagon path points
  const hexPoints = (() => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle_deg = 60 * i;
      const angle_rad = Math.PI / 180 * angle_deg;
      points.push(`${HEX_SIZE * Math.cos(angle_rad)},${HEX_SIZE * Math.sin(angle_rad)}`);
    }
    return points.join(" ");
  })();

  // Interaction handlers
  const getCellFromEvent = (e: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return null;

    // This is a naive hit test, but for hexagons, usually easier to trust the event target
    // if we put the handler on the polygon itself.
    // However, for drag fluidity, we might need coordinates.
    // Let's rely on onPointerEnter on the individual cells for simplicity.
    return null; 
  };

  // Visual state helpers
  const isSelected = (cell: HexCell) => selectedCells.some(c => c.q === cell.q && c.r === cell.r);
  
  // Check if a cell is part of a found word - complicated because one cell can be in multiple words?
  // Game logic says "reuse letters". 
  // We want to highlight PERMANENTLY if it's been used? Or just fade it? 
  // Let's highlight if it's been found at least once.
  const isFound = (cell: HexCell) => foundWordsCells.some(word => 
    word.some(c => c.q === cell.q && c.r === cell.r)
  );

  // Calculate connection line path
  const getLinePath = () => {
    if (selectedCells.length < 2) return "";
    return selectedCells.map((cell, i) => {
      const { x, y } = hexToPixel(cell.q, cell.r);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");
  };

  return (
    <div className="w-full h-full flex items-center justify-center select-none touch-none">
      <svg
        ref={svgRef}
        viewBox={calculateViewBox()}
        className="w-full h-full drop-shadow-xl max-h-[90vh] max-w-[90vw]"
        style={{ aspectRatio: "1", objectFit: "contain" }}
        onPointerUp={onSelectionEnd}
        onPointerLeave={onSelectionEnd}
      >
        {/* Connection Line Layer - Behind cells */}
        <motion.path
          d={getLinePath()}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={HEX_SIZE * 0.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 0.1 }}
        />

        {/* Cells Layer */}
        {grid.map((cell, idx) => {
          const { x, y } = hexToPixel(cell.q, cell.r);
          const active = isSelected(cell);
          const found = isFound(cell);
          const lastSelected = selectedCells.length > 0 && 
            selectedCells[selectedCells.length - 1].q === cell.q &&
            selectedCells[selectedCells.length - 1].r === cell.r;

          return (
            <g 
              key={`${cell.q}-${cell.r}`} 
              transform={`translate(${x}, ${y})`}
              className="cursor-pointer"
              onPointerDown={(e) => {
                e.currentTarget.releasePointerCapture(e.pointerId); // Allow smooth drag over other elements
                onSelectionStart(cell);
              }}
              onPointerEnter={(e) => {
                if (e.buttons > 0) {
                  onSelectionMove(cell);
                }
              }}
            >
              {/* Hexagon Shape */}
              <motion.polygon
                points={hexPoints}
                fill="currentColor"
                initial={{ scale: 0, rotate: -30 }}
                animate={{ 
                  scale: active ? 1.1 : 1,
                  rotate: active ? 5 : 0,
                  fill: active 
                    ? "hsl(var(--primary))" 
                    : found 
                      ? "hsl(var(--secondary))" 
                      : "white"
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 20,
                  delay: idx * 0.02 // Staggered entry
                }}
                className={cn(
                  "stroke-border stroke-2 transition-colors duration-200",
                  active ? "text-primary stroke-primary-foreground/20" : 
                  found ? "text-secondary stroke-white" : "text-card"
                )}
              />
              
              {/* Text Label */}
              <text
                className={cn(
                  "hex-text font-display text-2xl font-bold uppercase pointer-events-none transition-colors duration-200",
                  active ? "fill-primary-foreground" : "fill-foreground"
                )}
                dy="2" // Small optical adjustment
              >
                {cell.letter}
              </text>

              {/* Selection Ring (Last selected only) */}
              {lastSelected && (
                <motion.circle
                  r={HEX_SIZE * 0.8}
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeDasharray="4 4"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
