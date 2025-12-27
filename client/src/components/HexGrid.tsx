import { useRef, useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { HexCell } from "@shared/schema";

const HEX_SIZE = 40;
const ZOOM_SCALE = 1.6;
const ZOOM_OFFSET_Y = -80; // Pan up so finger doesn't cover selection
const HEX_WIDTH = HEX_SIZE * 2;
const HEX_HEIGHT = Math.sqrt(3) * HEX_SIZE;
const SPACING = 1.08;

interface Point {
  x: number;
  y: number;
}

// 10 unique, evenly-spaced hues for word highlights
const WORD_HUES = [0, 36, 72, 108, 144, 180, 216, 252, 288, 324];

// Generate a color from word index (0-9) for guaranteed unique colors
function indexToColor(index: number): string {
  const hue = WORD_HUES[index % WORD_HUES.length];
  return `hsla(${hue}, 70%, 55%, 0.45)`;
}

interface FoundWord {
  word: string;
  cells: HexCell[];
}

interface HexGridProps {
  grid: HexCell[];
  selectedCells: HexCell[];
  foundWords: FoundWord[];
  onSelectionStart: (cell: HexCell) => void;
  onSelectionMove: (cell: HexCell) => void;
  onSelectionEnd: () => void;
  isProcessing: boolean;
}

export function HexGrid({
  grid,
  selectedCells,
  foundWords,
  onSelectionStart,
  onSelectionMove,
  onSelectionEnd,
}: HexGridProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isPointerDownRef = useRef(false);
  const cellPositionsRef = useRef<Map<string, { cell: HexCell; x: number; y: number }>>(new Map());
  
  // Zoom and pan state
  const [isZoomed, setIsZoomed] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const hexToPixel = useCallback((q: number, r: number): Point => {
    const x = HEX_SIZE * (3 / 2 * q) * SPACING;
    const y = HEX_SIZE * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r) * SPACING;
    return { x, y };
  }, []);

  const viewBoxData = useMemo(() => {
    if (grid.length === 0) return { viewBox: "0 0 100 100", width: 100, height: 100 };

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    const positions = new Map<string, { cell: HexCell; x: number; y: number }>();

    grid.forEach(cell => {
      const { x, y } = hexToPixel(cell.q, cell.r);
      positions.set(`${cell.q}-${cell.r}`, { cell, x, y });
      minX = Math.min(minX, x - HEX_WIDTH / 2);
      maxX = Math.max(maxX, x + HEX_WIDTH / 2);
      minY = Math.min(minY, y - HEX_HEIGHT / 2);
      maxY = Math.max(maxY, y + HEX_HEIGHT / 2);
    });

    cellPositionsRef.current = positions;

    const padding = HEX_SIZE * 0.5;
    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;

    return {
      viewBox: `${minX - padding} ${minY - padding} ${width} ${height}`,
      width,
      height,
      minX: minX - padding,
      minY: minY - padding
    };
  }, [grid, hexToPixel]);

  const hexPoints = useMemo(() => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle_deg = 60 * i;
      const angle_rad = Math.PI / 180 * angle_deg;
      points.push(`${HEX_SIZE * Math.cos(angle_rad)},${HEX_SIZE * Math.sin(angle_rad)}`);
    }
    return points.join(" ");
  }, []);

  const isSelected = (cell: HexCell) => selectedCells.some(c => c.q === cell.q && c.r === cell.r);

  // Get all words that contain this cell
  const getWordIndicesForCell = (cell: HexCell): number[] => {
    const indices: number[] = [];
    foundWords.forEach((fw, idx) => {
      if (fw.cells.some(c => c.q === cell.q && c.r === cell.r)) {
        indices.push(idx);
      }
    });
    return indices;
  };

  const isFound = (cell: HexCell) => foundWords.some(fw =>
    fw.cells.some(c => c.q === cell.q && c.r === cell.r)
  );

  const getLinePath = () => {
    if (selectedCells.length < 2) return "";
    return selectedCells.map((cell, i) => {
      const { x, y } = hexToPixel(cell.q, cell.r);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");
  };

  const findCellAtPoint = (clientX: number, clientY: number): HexCell | null => {
    const svg = svgRef.current;
    if (!svg) return null;

    const rect = svg.getBoundingClientRect();
    const scaleX = viewBoxData.width / rect.width;
    const scaleY = viewBoxData.height / rect.height;
    
    const svgX = (clientX - rect.left) * scaleX + (viewBoxData.minX || 0);
    const svgY = (clientY - rect.top) * scaleY + (viewBoxData.minY || 0);

    let closestCell: HexCell | null = null;
    let closestDist = HEX_SIZE * 1.1;

    cellPositionsRef.current.forEach(({ cell, x, y }) => {
      const dist = Math.sqrt((svgX - x) ** 2 + (svgY - y) ** 2);
      if (dist < closestDist) {
        closestDist = dist;
        closestCell = cell;
      }
    });

    return closestCell;
  };

  const calculatePanOffset = (clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };
    
    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate how far the touch point is from center
    const touchX = clientX - rect.left;
    const touchY = clientY - rect.top;
    
    // Pan to move the touch point toward the center, offset up from finger
    const offsetX = (centerX - touchX) * (ZOOM_SCALE - 1);
    const offsetY = (centerY - touchY) * (ZOOM_SCALE - 1) + ZOOM_OFFSET_Y;
    
    return { x: offsetX, y: offsetY };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    isPointerDownRef.current = true;
    const cell = findCellAtPoint(e.clientX, e.clientY);
    if (cell) {
      setIsZoomed(true);
      setPanOffset(calculatePanOffset(e.clientX, e.clientY));
      onSelectionStart(cell);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    e.preventDefault();
    if (!isPointerDownRef.current) return;
    const cell = findCellAtPoint(e.clientX, e.clientY);
    if (cell) {
      setPanOffset(calculatePanOffset(e.clientX, e.clientY));
      onSelectionMove(cell);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    if (isPointerDownRef.current) {
      isPointerDownRef.current = false;
      setIsZoomed(false);
      setPanOffset({ x: 0, y: 0 });
      onSelectionEnd();
    }
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    e.preventDefault();
    isPointerDownRef.current = false;
    setIsZoomed(false);
    setPanOffset({ x: 0, y: 0 });
    onSelectionEnd();
  };

  const aspectRatio = viewBoxData.width / viewBoxData.height;

  return (
    <div
      ref={containerRef}
      className="w-full select-none flex items-center justify-center overflow-hidden"
      style={{
        touchAction: "none",
        maxHeight: "100%",
      }}
    >
      <svg
        ref={svgRef}
        viewBox={viewBoxData.viewBox}
        className="drop-shadow-xl"
        style={{
          width: "100%",
          height: "auto",
          maxHeight: "100%",
          aspectRatio: `${aspectRatio}`,
          transform: isZoomed 
            ? `scale(${ZOOM_SCALE}) translate(${panOffset.x / ZOOM_SCALE}px, ${panOffset.y / ZOOM_SCALE}px)`
            : "scale(1) translate(0, 0)",
          transition: "transform 0.15s ease-out",
          transformOrigin: "center center",
        }}
        preserveAspectRatio="xMidYMid meet"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={(e) => handlePointerUp(e as React.PointerEvent)}
        onPointerCancel={handlePointerCancel}
      >
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

        {grid.map((cell, idx) => {
          const { x, y } = hexToPixel(cell.q, cell.r);
          const active = isSelected(cell);
          const wordIndices = getWordIndicesForCell(cell);
          const hasFoundWords = wordIndices.length > 0;

          return (
            <g
              key={`${cell.q}-${cell.r}`}
              transform={`translate(${x}, ${y})`}
              className="cursor-pointer"
              data-testid={`hex-cell-${cell.q}-${cell.r}`}
            >
              {/* Base hexagon - white background */}
              <motion.polygon
                points={hexPoints}
                fill={active ? "hsl(var(--primary))" : "white"}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 800,
                  damping: 20,
                  delay: idx * 0.005
                }}
                className={cn(
                  "stroke-border stroke-2",
                  active ? "text-primary stroke-primary-foreground/20" : "text-card"
                )}
              />

              {/* Transparent color overlays for each found word */}
              {!active && wordIndices.map((wordIdx) => (
                <polygon
                  key={`overlay-${wordIdx}`}
                  points={hexPoints}
                  fill={indexToColor(wordIdx)}
                  style={{ mixBlendMode: "multiply", pointerEvents: "none" }}
                />
              ))}

              <text
                className={cn(
                  "hex-text font-display text-2xl font-bold uppercase pointer-events-none transition-colors duration-75",
                  active ? "fill-primary-foreground" : 
                    hasFoundWords ? "fill-foreground" : "fill-foreground"
                )}
                textAnchor="middle"
                dominantBaseline="central"
                dy="2"
              >
                {cell.letter}
              </text>

              {selectedCells.length > 0 &&
                selectedCells[selectedCells.length - 1].q === cell.q &&
                selectedCells[selectedCells.length - 1].r === cell.r && (
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

        {selectedCells.length > 0 && (() => {
          const lastSelectedCell = selectedCells[selectedCells.length - 1];
          const { x, y } = hexToPixel(lastSelectedCell.q, lastSelectedCell.r);
          return (
            <g key="tooltip" transform={`translate(${x}, ${y})`} style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.25))" }}>
              <rect
                x={-HEX_SIZE * 0.5}
                y={-HEX_SIZE * 2.8}
                width={HEX_SIZE * 1}
                height={HEX_SIZE * 1}
                fill="hsl(var(--primary))"
              />
              <rect
                x={-HEX_SIZE * 1.1}
                y={-HEX_SIZE * 3.2}
                width={HEX_SIZE * 2.2}
                height={HEX_SIZE * 2.2}
                rx={HEX_SIZE * 0.35}
                fill="hsl(var(--primary))"
              />
              <text
                y={-HEX_SIZE * 2.1}
                className="font-display font-black uppercase pointer-events-none"
                fill="hsl(var(--primary-foreground))"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={HEX_SIZE * 1.4}
              >
                {lastSelectedCell.letter}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
