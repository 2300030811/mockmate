import { useEffect } from "react";
import { toast } from "sonner";
import { isInputActive } from "../utils";

interface UseSystemDesignKeyboardShortcutsProps {
  dispatch: any;
  deleteSelected: () => void;
  undo: () => void;
  redo: () => void;
  saveDesign: () => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

export function useSystemDesignKeyboardShortcuts({
  dispatch,
  deleteSelected,
  undo,
  redo,
  saveDesign,
  canvasRef,
}: UseSystemDesignKeyboardShortcutsProps) {

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (isInputActive()) return;
      if (e.key === "Delete" || e.key === "Backspace") deleteSelected();
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { 
        e.preventDefault(); 
        e.shiftKey ? redo() : undo(); 
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { 
        e.preventDefault(); 
        saveDesign(); 
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') { 
        e.preventDefault(); 
        dispatch({ type: "SET_SHOW_TUTORIAL", show: true }); 
      }
      if (e.key === " ") {
        e.preventDefault();
        dispatch({ type: "SET_TOOL", tool: "Pan" });
        if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
      }
      if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        dispatch({ type: "SET_TOOL", tool: "Connect" });
        toast("Connect Mode Active. Click a starting component.");
      }
      if (e.key === "Escape") {
        e.preventDefault();
        dispatch({ type: "SET_CONNECT_START", startId: null });
        dispatch({ type: "SET_TOOL", tool: "Select" });
        toast.dismiss();
      }
    };

    const up = (e: KeyboardEvent) => {
      if (e.key === " ") {
        dispatch({ type: "SET_TOOL", tool: "Select" });
        if (canvasRef.current) canvasRef.current.style.cursor = 'crosshair';
      }
    };

    window.addEventListener("keydown", down); 
    window.addEventListener("keyup", up);
    
    return () => { 
      window.removeEventListener("keydown", down); 
      window.removeEventListener("keyup", up); 
    };
  }, [deleteSelected, redo, undo, saveDesign, dispatch, canvasRef]);
}
