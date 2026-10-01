import { useState, useRef, useCallback, useEffect } from "react";

export function useCanvasControls(initialPan = { x: 0, y: 0 }, initialScale = 1) {
  const [pan, setPan] = useState(initialPan);
  const [scale, setScale] = useState(initialScale);
  const isPanningRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const pendingPan = useRef<{ x: number; y: number } | null>(null);
  const rafId = useRef<number | null>(null);

  // Cleanup pending RAF on unmount
  useEffect(() => {
    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent, activeTool: string, canvasRef: React.RefObject<HTMLDivElement>) => {
    if (activeTool === "Pan" || e.button === 1 || (e.button === 0 && e.altKey)) {
      isPanningRef.current = true;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanningRef.current) {
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };

      if (!pendingPan.current) {
        pendingPan.current = { x: dx, y: dy };
      } else {
        pendingPan.current.x += dx;
        pendingPan.current.y += dy;
      }

      if (rafId.current === null) {
        rafId.current = requestAnimationFrame(() => {
          if (pendingPan.current) {
            const { x, y } = pendingPan.current;
            pendingPan.current = null;
            setPan((prev) => ({ x: prev.x + x, y: prev.y + y }));
          }
          rafId.current = null;
        });
      }
    }
  }, []);

  const handleMouseUp = useCallback((activeTool: string, canvasRef: React.RefObject<HTMLDivElement>) => {
    isPanningRef.current = false;
    if (pendingPan.current) {
      const { x, y } = pendingPan.current;
      pendingPan.current = null;
      setPan((prev) => ({ x: prev.x + x, y: prev.y + y }));
    }
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    if (canvasRef.current) canvasRef.current.style.cursor = activeTool === "Pan" ? "grab" : "crosshair";
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      // Smooth exponential zoom
      const zoomSensitivity = 0.001;
      const multiplier = Math.exp(-e.deltaY * zoomSensitivity);
      setScale((s) => Math.min(Math.max(0.2, s * multiplier), 3));
    } else {
      setPan((p) => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
    }
  }, []);

  return {
    pan,
    setPan,
    scale,
    setScale,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel
  };
}
