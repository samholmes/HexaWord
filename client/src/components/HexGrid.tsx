import { useRef, useCallback, useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { HexCell } from "@shared/schema";
import { useSettings } from "@/hooks/use-settings";

interface Ripple {
  id: string;
  x: number;
  y: number;
  type: 'select' | 'deselect';
  timestamp: number;
}

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
  const lastSelectedCenterRef = useRef<{ x: number; y: number } | null>(null);
  const prevSelectedCellsRef = useRef<HexCell[]>([]);
  
  // Load settings
  const { settings } = useSettings();
  
  // Zoom and pan state
  const [isZoomed, setIsZoomed] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isActivelyPanning, setIsActivelyPanning] = useState(false);
  
  // Ripple effects state
  const [ripples, setRipples] = useState<Ripple[]>([]);
  
  // Track selection changes for ripple effects
  useEffect(() => {
    const prevCells = prevSelectedCellsRef.current;
    const currentCells = selectedCells;
    
    // Find newly selected cells (in current but not in prev)
    const newlySelected = currentCells.filter(
      curr => !prevCells.some(prev => prev.q === curr.q && prev.r === curr.r)
    );
    
    // Find deselected cells (in prev but not in current)
    const deselected = prevCells.filter(
      prev => !currentCells.some(curr => curr.q === prev.q && curr.r === prev.r)
    );
    
    const newRipples: Ripple[] = [];
    const now = Date.now();
    
    // Create expand ripples for newly selected cells
    newlySelected.forEach(cell => {
      const pos = cellPositionsRef.current.get(`${cell.q}-${cell.r}`);
      if (pos) {
        newRipples.push({
          id: `select-${cell.q}-${cell.r}-${now}`,
          x: pos.x,
          y: pos.y,
          type: 'select',
          timestamp: now,
        });
      }
    });
    
    // Create contract ripples for deselected cells
    deselected.forEach(cell => {
      const pos = cellPositionsRef.current.get(`${cell.q}-${cell.r}`);
      if (pos) {
        newRipples.push({
          id: `deselect-${cell.q}-${cell.r}-${now}`,
          x: pos.x,
          y: pos.y,
          type: 'deselect',
          timestamp: now,
        });
      }
    });
    
    if (newRipples.length > 0) {
      setRipples(prev => [...prev, ...newRipples]);
    }
    
    prevSelectedCellsRef.current = currentCells;
  }, [selectedCells]);
  
  // Clean up old ripples after animation completes
  useEffect(() => {
    if (ripples.length === 0) return;
    
    const timer = setTimeout(() => {
      const now = Date.now();
      setRipples(prev => prev.filter(r => now - r.timestamp < 600));
    }, 600);
    
    return () => clearTimeout(timer);
  }, [ripples]);

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

  // Convert screen coordinates to SVG coordinates
  const screenToSvg = (clientX: number, clientY: number, currentZoom: boolean, currentPanOffset: Point): { x: number; y: number } | null => {
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

    return { x: svgX, y: svgY };
  };

  // Find the closest cell to a given SVG coordinate
  const findClosestCell = (svgX: number, svgY: number): HexCell | null => {
    let closestCell: HexCell | null = null;
    let closestDist = Infinity;

    cellPositionsRef.current.forEach(({ cell, x, y }) => {
      const dist = Math.sqrt((svgX - x) ** 2 + (svgY - y) ** 2);
      if (dist < closestDist) {
        closestDist = dist;
        closestCell = cell;
      }
    });

    // Only return if within a reasonable distance
    return closestDist < HEX_SIZE * 1.5 ? closestCell : null;
  };

  const findCellAtPoint = (clientX: number, clientY: number, currentZoom: boolean, currentPanOffset: Point): HexCell | null => {
    const svgCoords = screenToSvg(clientX, clientY, currentZoom, currentPanOffset);
    if (!svgCoords) return null;

    let closestCell: HexCell | null = null;
    let closestDist = HEX_SIZE * 1.1;

    cellPositionsRef.current.forEach(({ cell, x, y }) => {
      const dist = Math.sqrt((svgCoords.x - x) ** 2 + (svgCoords.y - y) ** 2);
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
      // Store the center of the initial selected cell for distance-based detection
      const cellPos = cellPositionsRef.current.get(`${cell.q}-${cell.r}`);
      if (cellPos) {
        lastSelectedCenterRef.current = { x: cellPos.x, y: cellPos.y };
      }
      
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
    
    // Get touch position in SVG coordinates
    const svgCoords = screenToSvg(e.clientX, e.clientY, effectiveZoom, panOffset);
    if (!svgCoords) return;
    
    // Distance-based selection: only select a new cell when touch moves 
    // at least one hex diameter away from the last selected cell's center
    const hexDiameter = HEX_SIZE * 2;
    const lastCenter = lastSelectedCenterRef.current;
    
    if (lastCenter) {
      const distFromLastCenter = Math.sqrt(
        (svgCoords.x - lastCenter.x) ** 2 + (svgCoords.y - lastCenter.y) ** 2
      );
      
      // Only trigger new selection when distance exceeds hex diameter
      if (distFromLastCenter >= hexDiameter) {
        const cell = findClosestCell(svgCoords.x, svgCoords.y);
        if (cell) {
          // Update the last selected center to the new cell's center
          const cellPos = cellPositionsRef.current.get(`${cell.q}-${cell.r}`);
          if (cellPos) {
            lastSelectedCenterRef.current = { x: cellPos.x, y: cellPos.y };
          }
          
          if (settings.zoomEnabled) {
            const newPanOffset = calculatePanOffset(e.clientX, e.clientY);
            setPanOffset(newPanOffset);
          }
          onSelectionMove(cell);
        }
      } else {
        // Still update pan offset for smooth tracking even without new selection
        if (settings.zoomEnabled) {
          const newPanOffset = calculatePanOffset(e.clientX, e.clientY);
          setPanOffset(newPanOffset);
        }
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    if (isPointerDownRef.current) {
      isPointerDownRef.current = false;
      lastSelectedCenterRef.current = null;
      setIsActivelyPanning(false); // Re-enable transition for zoom out
      setIsZoomed(false);
      setPanOffset({ x: 0, y: 0 });
      onSelectionEnd();
    }
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    e.preventDefault();
    isPointerDownRef.current = false;
    lastSelectedCenterRef.current = null;
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

        {/* Ripple effects for selection feedback */}
        <AnimatePresence>
          {ripples.map((ripple) => {
            const maxRadius = HEX_SIZE * 3; // Three hex sizes in radius
            const isSelect = ripple.type === 'select';
            
            return (
              <g key={ripple.id} transform={`translate(${ripple.x}, ${ripple.y})`}>
                {/* Three concentric rings */}
                {[0, 1, 2].map((ringIndex) => {
                  const delay = ringIndex * 0.08;
                  const baseRadius = HEX_SIZE * (ringIndex + 1);
                  
                  return (
                    <motion.circle
                      key={`ring-${ringIndex}`}
                      cx={0}
                      cy={0}
                      r={isSelect ? 0 : maxRadius}
                      fill="none"
                      stroke="hsl(270 70% 60%)"
                      strokeWidth={3 - ringIndex * 0.5}
                      initial={{
                        r: isSelect ? 0 : baseRadius,
                        opacity: isSelect ? 0.8 : 0,
                        strokeWidth: 3 - ringIndex * 0.5,
                      }}
                      animate={{
                        r: isSelect ? baseRadius : 0,
                        opacity: isSelect ? [0.8, 0.6, 0] : [0, 0.6, 0.8, 0],
                        strokeWidth: isSelect ? [3 - ringIndex * 0.5, 1] : [1, 3 - ringIndex * 0.5],
                      }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: delay,
                        ease: isSelect ? "easeOut" : "easeIn",
                      }}
                    />
                  );
                })}
              </g>
            );
          })}
        </AnimatePresence>

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
