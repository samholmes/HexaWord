import { useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { HexCell } from "@shared/schema";

const HEX_SIZE = 40;
const HEX_WIDTH = HEX_SIZE * 2;
const HEX_HEIGHT = Math.sqrt(3) * HEX_SIZE;
const SPACING = 1.08;

interface Point {
  x: number;
  y: number;
}

interface HexGridProps {
  grid: HexCell[];
  selectedCells: HexCell[];
  foundWordsCells: HexCell[][];
  onSelectionStart: (cell: HexCell) => void;
  onSelectionMove: (cell: HexCell) => void;
  onSelectionEnd: () => void;
  isProcessing: boolean;
}

export function HexGrid({
  grid,
  selectedCells,
  foundWordsCells,
  onSelectionStart,
  onSelectionMove,
  onSelectionEnd,
}: HexGridProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const isPointerDownRef = useRef(false);
  const cellPositionsRef = useRef<Map<string, { cell: HexCell; x: number; y: number }>>(new Map());

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

  const isFound = (cell: HexCell) => foundWordsCells.some(word =>
    word.some(c => c.q === cell.q && c.r === cell.r)
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

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    isPointerDownRef.current = true;
    const cell = findCellAtPoint(e.clientX, e.clientY);
    if (cell) {
      onSelectionStart(cell);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    e.preventDefault();
    if (!isPointerDownRef.current) return;
    const cell = findCellAtPoint(e.clientX, e.clientY);
    if (cell) {
      onSelectionMove(cell);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    if (isPointerDownRef.current) {
      isPointerDownRef.current = false;
      onSelectionEnd();
    }
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    e.preventDefault();
    isPointerDownRef.current = false;
    onSelectionEnd();
  };

  const aspectRatio = viewBoxData.width / viewBoxData.height;

  return (
    <div
      className="w-full select-none flex items-center justify-center"
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
          const found = isFound(cell);
          const lastSelected = selectedCells.length > 0 &&
            selectedCells[selectedCells.length - 1].q === cell.q &&
            selectedCells[selectedCells.length - 1].r === cell.r;

          return (
            <g
              key={`${cell.q}-${cell.r}`}
              transform={`translate(${x}, ${y})`}
              className="cursor-pointer"
              data-testid={`hex-cell-${cell.q}-${cell.r}`}
            >
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
                  stiffness: 800,
                  damping: 20,
                  delay: idx * 0.005
                }}
                className={cn(
                  "stroke-border stroke-2 transition-colors duration-75",
                  active ? "text-primary stroke-primary-foreground/20" :
                    found ? "text-secondary stroke-white" : "text-card"
                )}
              />

              <text
                className={cn(
                  "hex-text font-display text-2xl font-bold uppercase pointer-events-none transition-colors duration-75",
                  active ? "fill-primary-foreground" : "fill-foreground"
                )}
                textAnchor="middle"
                dominantBaseline="central"
                dy="2"
              >
                {cell.letter}
              </text>

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
