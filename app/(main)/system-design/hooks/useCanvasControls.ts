import { useState, useRef, useCallback } from "react";
import { GRID_SIZE } from "../constants";

export function useCanvasControls(initialPan = { x: 0, y: 0 }, initialScale = 1) {
  const [pan, setPan] = useState(initialPan);
  const [scale, setScale] = useState(initialScale);
  const isPanningRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent, activeTool: string, canvasRef: React.RefObject<HTMLDivElement>) => {
    if (activeTool === "Pan" || e.button === 1 || (e.button === 0 && e.altKey)) {
      isPanningRef.current = true;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanningRef.current) {
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const handleMouseUp = useCallback((activeTool: string, canvasRef: React.RefObject<HTMLDivElement>) => {
    isPanningRef.current = false;
    if (canvasRef.current) canvasRef.current.style.cursor = activeTool === "Pan" ? 'grab' : 'crosshair';
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale(s => Math.min(Math.max(0.2, s + delta), 3));
    } else {
      setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
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
