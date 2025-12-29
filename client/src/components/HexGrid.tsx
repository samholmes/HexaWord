import { useRef, useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { HexCell } from "@shared/schema";
import { useSettings } from "@/hooks/use-settings";

const HEX_SIZE = 40;
const ZOOM_SCALE = 1.6;
const FINGER_OFFSET_PX = 70; // Offset so selected cell appears above finger
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
  
  // Load settings
  const { settings } = useSettings();
  
  // Zoom and pan state
  const [isZoomed, setIsZoomed] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isActivelyPanning, setIsActivelyPanning] = useState(false);

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

  const findCellAtPoint = (clientX: number, clientY: number, currentZoom: boolean, currentPanOffset: Point): HexCell | null => {
    const container = containerRef.current;
    if (!container) return null;

    // Get container bounds (stable, not affected by CSS transforms)
    const containerRect = container.getBoundingClientRect();
    
    // Calculate where the SVG is actually rendered within the container
    // accounting for letterboxing due to aspect ratio preservation
    const containerAspect = containerRect.width / containerRect.height;
    const svgAspect = viewBoxData.width / viewBoxData.height;
    
    let renderedWidth: number;
    let renderedHeight: number;
    let offsetX: number;
    let offsetY: number;
    
    if (containerAspect > svgAspect) {
      // Container is wider - SVG is height-constrained, centered horizontally
      renderedHeight = containerRect.height;
      renderedWidth = renderedHeight * svgAspect;
      offsetX = (containerRect.width - renderedWidth) / 2;
      offsetY = 0;
    } else {
      // Container is taller - SVG is width-constrained, centered vertically
      renderedWidth = containerRect.width;
      renderedHeight = renderedWidth / svgAspect;
      offsetX = 0;
      offsetY = (containerRect.height - renderedHeight) / 2;
    }
    
    // Calculate touch position relative to SVG center
    const containerCenterX = containerRect.width / 2;
    const containerCenterY = containerRect.height / 2;
    let touchX = clientX - containerRect.left;
    let touchY = clientY - containerRect.top;
    
    // If zoomed, reverse the CSS transform to get the actual SVG position
    // Transform is: scale(ZOOM_SCALE) translate(panOffset.x / ZOOM_SCALE, panOffset.y / ZOOM_SCALE)
    // The transform origin is center center
    if (currentZoom) {
      // Reverse the transform: first un-translate, then un-scale
      // Touch position relative to center
      const relX = touchX - containerCenterX;
      const relY = touchY - containerCenterY;
      
      // Reverse the scale (divide by zoom)
      const unscaledX = relX / ZOOM_SCALE;
      const unscaledY = relY / ZOOM_SCALE;
      
      // Reverse the translate (subtract the pan offset, which was divided by ZOOM_SCALE in CSS)
      const untranslatedX = unscaledX - currentPanOffset.x / ZOOM_SCALE;
      const untranslatedY = unscaledY - currentPanOffset.y / ZOOM_SCALE;
      
      // Convert back to absolute position
      touchX = untranslatedX + containerCenterX;
      touchY = untranslatedY + containerCenterY;
    }
    
    // Adjust for letterboxing offset
    touchX = touchX - offsetX;
    touchY = touchY - offsetY;
    
    const scaleX = viewBoxData.width / renderedWidth;
    const scaleY = viewBoxData.height / renderedHeight;
    
    const svgX = touchX * scaleX + (viewBoxData.minX || 0);
    const svgY = touchY * scaleY + (viewBoxData.minY || 0);

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
    
    // Zoom to touch point, optionally offset so cell appears above finger
    const fingerOffset = settings.fingerOffsetEnabled ? FINGER_OFFSET_PX : 0;
    const offsetX = (centerX - touchX) * (ZOOM_SCALE - 1);
    const offsetY = (centerY - touchY) * (ZOOM_SCALE - 1) - fingerOffset;
    
    return { x: offsetX, y: offsetY };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    isPointerDownRef.current = true;
    // On pointer down, we're not zoomed yet, so pass false and zero offset
    const cell = findCellAtPoint(e.clientX, e.clientY, false, { x: 0, y: 0 });
    if (cell) {
      setIsActivelyPanning(false); // Allow transition for initial zoom
      
      if (settings.zoomEnabled) {
        const newPanOffset = calculatePanOffset(e.clientX, e.clientY);
        setIsZoomed(true);
        setPanOffset(newPanOffset);
      }
      
      onSelectionStart(cell);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    e.preventDefault();
    if (!isPointerDownRef.current) return;
    
    // Determine effective zoom state based on settings
    const effectiveZoom = settings.zoomEnabled && isZoomed;
    
    setIsActivelyPanning(true); // Disable transition during panning
    // Pass current zoom state and pan offset for coordinate transformation
    const cell = findCellAtPoint(e.clientX, e.clientY, effectiveZoom, panOffset);
    if (cell) {
      if (settings.zoomEnabled) {
        const newPanOffset = calculatePanOffset(e.clientX, e.clientY);
        setPanOffset(newPanOffset);
      }
      onSelectionMove(cell);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    if (isPointerDownRef.current) {
      isPointerDownRef.current = false;
      setIsActivelyPanning(false); // Re-enable transition for zoom out
      setIsZoomed(false);
      setPanOffset({ x: 0, y: 0 });
      onSelectionEnd();
    }
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    e.preventDefault();
    isPointerDownRef.current = false;
    setIsActivelyPanning(false);
    setIsZoomed(false);
    setPanOffset({ x: 0, y: 0 });
    onSelectionEnd();
  };

  const aspectRatio = viewBoxData.width / viewBoxData.height;

  return (
    <div
      ref={containerRef}
      className="w-full h-full select-none flex items-center justify-center overflow-hidden relative"
      style={{
        touchAction: "none",
      }}
    >
      {/* Invisible overlay for stable touch tracking */}
      <div
        className="absolute inset-0 z-10"
        style={{ touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={(e) => handlePointerUp(e as React.PointerEvent)}
        onPointerCancel={handlePointerCancel}
      />
      
      <svg
        ref={svgRef}
        viewBox={viewBoxData.viewBox}
        className="drop-shadow-xl pointer-events-none"
        style={{
          width: "100%",
          height: "auto",
          maxHeight: "100%",
          aspectRatio: `${aspectRatio}`,
          transform: (settings.zoomEnabled && isZoomed)
            ? `scale(${ZOOM_SCALE}) translate(${panOffset.x / ZOOM_SCALE}px, ${panOffset.y / ZOOM_SCALE}px)`
            : "scale(1) translate(0, 0)",
          transition: isActivelyPanning ? "none" : "transform 0.15s ease-out",
          transformOrigin: "center center",
        }}
        preserveAspectRatio="xMidYMid meet"
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

      </svg>
    </div>
  );
}
