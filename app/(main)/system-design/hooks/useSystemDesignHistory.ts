import { useState, useCallback } from "react";
import { Node, Connection, Group } from "../types";

export interface HistoryState {
  nodes: Node[];
  connections: Connection[];
  groups: Group[];
}

export function useSystemDesignHistory(initialState: HistoryState) {
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const setInitialHistory = useCallback((state: HistoryState) => {
    setHistory([state]);
    setHistoryIndex(0);
  }, []);

  const addToHistory = useCallback((state: HistoryState) => {
    setHistory(prev => {
      const next = prev.slice(0, historyIndex + 1);
      return [...next, state].slice(-50);
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const undo = useCallback((): HistoryState | null => {
    if (historyIndex > 0) {
      const state = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      return state;
    }
    return null;
  }, [historyIndex, history]);

  const redo = useCallback((): HistoryState | null => {
    if (historyIndex < history.length - 1) {
      const state = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      return state;
    }
    return null;
  }, [historyIndex, history]);

  return {
    history,
    historyIndex,
    setInitialHistory,
    addToHistory,
    undo,
    redo,
    historyLength: history.length
  };
}
