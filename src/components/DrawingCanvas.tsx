'use client';

import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { RotateCcw, Trash2, PenTool } from 'lucide-react';

export interface DrawingCanvasHandle {
  getImageDataUrl: () => string | null;
  clear: () => void;
  undo: () => void;
  isEmpty: () => boolean;
}

interface DrawingCanvasProps {
  showCrossGuide?: boolean; // 十字リーダー（マス目）
  initialImage?: string;
  onStrokeEnd?: () => void;
}

interface StrokePoint {
  x: number;
  y: number;
  pressure: number;
}

interface Stroke {
  color: string;
  width: number;
  points: StrokePoint[];
}

export const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(
  ({ showCrossGuide = true, initialImage, onStrokeEnd }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Drawing state
    const [penColor, setPenColor] = useState<string>('#263238'); // Deep slate/black
    const [penWidth, setPenWidth] = useState<number>(6); // Default 6px
    const [canUndo, setCanUndo] = useState<boolean>(false);

    // In-memory stroke history for clean rendering and Undo
    const strokesRef = useRef<Stroke[]>([]);
    const currentStrokeRef = useRef<Stroke | null>(null);
    const isDrawingRef = useRef<boolean>(false);

    // Draw background guide (十字リーダー) and all strokes
    const redrawCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Clear all
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Paper background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Cross Guide (十字リーダー) for Japanese / Kanji
      if (showCrossGuide) {
        ctx.save();
        ctx.strokeStyle = '#E0E0E0';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);

        // Horizontal dashed line
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        // Vertical dashed line
        ctx.beginPath();
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.stroke();

        // Solid outer border guide
        ctx.setLineDash([]);
        ctx.strokeStyle = '#D7CCC8';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, width - 2, height - 2);
        ctx.restore();
      }

      // 3. Draw all completed strokes
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      strokesRef.current.forEach((stroke) => {
        if (stroke.points.length < 1) return;
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;

        if (stroke.points.length === 1) {
          // Single dot
          const p = stroke.points[0];
          ctx.beginPath();
          ctx.arc(p.x, p.y, stroke.width / 2, 0, Math.PI * 2);
          ctx.fillStyle = stroke.color;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          for (let i = 1; i < stroke.points.length; i++) {
            // Smooth curve with quadratic Bezier
            const p1 = stroke.points[i - 1];
            const p2 = stroke.points[i];
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
          }
          ctx.stroke();
        }
      });

      // 4. Draw currently active stroke
      if (currentStrokeRef.current && currentStrokeRef.current.points.length > 0) {
        const stroke = currentStrokeRef.current;
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;

        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          const p1 = stroke.points[i - 1];
          const p2 = stroke.points[i];
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
        }
        ctx.stroke();
      }
    }, [showCrossGuide]);

    // Resize canvas to match display container
    const handleResize = useCallback(() => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      // Keep fixed aspect or fill container
      const displayWidth = Math.floor(rect.width);
      const displayHeight = Math.floor(rect.height);

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        redrawCanvas();
      }
    }, [redrawCanvas]);

    useEffect(() => {
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);

    // Initial image load if provided
    useEffect(() => {
      if (initialImage) {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = initialImage;
      }
    }, [initialImage]);

    // Helper: get canvas-relative coordinates
    const getPointerPos = (e: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number } => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    // Pointer Event Handlers for Chromebook Touch/Stylus/Mouse
    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
      // Prevent default scrolling and gesture handling
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Capture pointer for continuous tracking outside canvas edge
      canvas.setPointerCapture(e.pointerId);

      isDrawingRef.current = true;
      const pos = getPointerPos(e);

      // If pressure is supported (Stylus), scale penWidth slightly
      const pressure = e.pressure && e.pressure > 0 ? e.pressure : 0.5;
      const effectiveWidth = Math.max(2, penWidth * (0.6 + pressure * 0.8));

      currentStrokeRef.current = {
        color: penColor,
        width: effectiveWidth,
        points: [{ x: pos.x, y: pos.y, pressure }],
      };

      redrawCanvas();
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current || !currentStrokeRef.current) return;
      e.preventDefault();

      const pos = getPointerPos(e);
      const pressure = e.pressure && e.pressure > 0 ? e.pressure : 0.5;

      currentStrokeRef.current.points.push({
        x: pos.x,
        y: pos.y,
        pressure,
      });

      redrawCanvas();
    };

    const finishStroke = (e?: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;

      if (e && canvasRef.current && canvasRef.current.hasPointerCapture(e.pointerId)) {
        canvasRef.current.releasePointerCapture(e.pointerId);
      }

      if (currentStrokeRef.current && currentStrokeRef.current.points.length > 0) {
        strokesRef.current.push(currentStrokeRef.current);
        currentStrokeRef.current = null;
        setCanUndo(strokesRef.current.length > 0);
        redrawCanvas();
        if (onStrokeEnd) onStrokeEnd();
      }
    };

    // External imperative handle
    useImperativeHandle(ref, () => ({
      getImageDataUrl: () => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        if (strokesRef.current.length === 0) return null;
        return canvas.toDataURL('image/png');
      },
      clear: () => {
        strokesRef.current = [];
        currentStrokeRef.current = null;
        setCanUndo(false);
        redrawCanvas();
      },
      undo: () => {
        if (strokesRef.current.length > 0) {
          strokesRef.current.pop();
          setCanUndo(strokesRef.current.length > 0);
          redrawCanvas();
        }
      },
      isEmpty: () => strokesRef.current.length === 0,
    }));

    const handleClear = () => {
      strokesRef.current = [];
      currentStrokeRef.current = null;
      setCanUndo(false);
      redrawCanvas();
    };

    const handleUndo = () => {
      if (strokesRef.current.length > 0) {
        strokesRef.current.pop();
        setCanUndo(strokesRef.current.length > 0);
        redrawCanvas();
      }
    };

    return (
      <div className="flex flex-col w-full h-full select-none">
        {/* Pen & Eraser Tool Bar */}
        <div className="flex items-center justify-between bg-amber-50/80 px-3 py-2 rounded-t-2xl border-2 border-b-0 border-amber-200">
          {/* Colors */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-900 hidden sm:inline">ペン:</span>
            <button
              type="button"
              onClick={() => setPenColor('#263238')}
              className={`w-8 h-8 rounded-full border-2 transition-transform ${
                penColor === '#263238'
                  ? 'border-amber-600 scale-110 shadow-sm'
                  : 'border-transparent hover:scale-105'
              } bg-[#263238]`}
              title="くろペン"
              aria-label="黒ペン"
            />
            <button
              type="button"
              onClick={() => setPenColor('#E53935')}
              className={`w-8 h-8 rounded-full border-2 transition-transform ${
                penColor === '#E53935'
                  ? 'border-amber-600 scale-110 shadow-sm'
                  : 'border-transparent hover:scale-105'
              } bg-[#E53935]`}
              title="あかペン"
              aria-label="赤ペン"
            />
            <button
              type="button"
              onClick={() => setPenColor('#1E88E5')}
              className={`w-8 h-8 rounded-full border-2 transition-transform ${
                penColor === '#1E88E5'
                  ? 'border-amber-600 scale-110 shadow-sm'
                  : 'border-transparent hover:scale-105'
              } bg-[#1E88E5]`}
              title="あおペン"
              aria-label="青ペン"
            />
          </div>

          {/* Stroke Widths */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-900 hidden sm:inline">太さ:</span>
            {[
              { label: '細', width: 3, dotSize: 'w-2 h-2' },
              { label: '中', width: 6, dotSize: 'w-3 h-3' },
              { label: '太', width: 12, dotSize: 'w-4 h-4' },
            ].map((item) => (
              <button
                key={item.width}
                type="button"
                onClick={() => setPenWidth(item.width)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-colors ${
                  penWidth === item.width
                    ? 'bg-amber-400 text-amber-950 font-black shadow-sm'
                    : 'bg-white text-stone-600 border border-amber-200 hover:bg-amber-100'
                }`}
                title={`太さ: ${item.label}`}
                aria-label={`太さ: ${item.label}`}
              >
                <span className={`rounded-full bg-current ${item.dotSize}`} />
              </button>
            ))}
          </div>

          {/* Undo & Clear Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleUndo}
              disabled={!canUndo}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                canUndo
                  ? 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100 shadow-sm'
                  : 'bg-stone-200/50 text-stone-400 cursor-not-allowed border border-transparent'
              }`}
              title="1つ戻す"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">もどす</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-all shadow-sm"
              title="ぜんぶ消す"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">消す</span>
            </button>
          </div>
        </div>

        {/* Canvas Drawing Area with touch-action: none for Palm Rejection */}
        <div
          ref={containerRef}
          className="relative flex-1 w-full min-h-[280px] sm:min-h-[340px] bg-white rounded-b-2xl border-2 border-amber-200 overflow-hidden shadow-inner cursor-crosshair"
          style={{ touchAction: 'none' }}
        >
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishStroke}
            onPointerCancel={finishStroke}
            className="w-full h-full block"
            style={{ touchAction: 'none' }}
          />
          {strokesRef.current.length === 0 && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-stone-300/80 font-bold text-sm sm:text-base select-none">
              <span className="flex items-center gap-2 bg-white/70 px-4 py-2 rounded-full border border-stone-200/50">
                <PenTool className="w-4 h-4 text-stone-400" />
                ここにペンや指で文字や数字を書こう！
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

DrawingCanvas.displayName = 'DrawingCanvas';

