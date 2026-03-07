import { useState, useCallback } from "react";
import { Node, Connection, Group } from "../types";

export interface HistoryState {
  nodes: Node[];
  connections: Connection[];
  groups: Group[];
}

export function useSystemDesignHistory(initialState: HistoryState) {
  const [state, setState] = useState<{
    history: HistoryState[];
    index: number;
  }>({
    history: [initialState],
    index: 0
  });

  const setInitialHistory = useCallback((hState: HistoryState) => {
    setState({
      history: [hState],
      index: 0
    });
  }, []);

  const addToHistory = useCallback((hState: HistoryState) => {
    setState(prev => {
      const nextHistory = prev.history.slice(0, prev.index + 1);
      const updatedHistory = [...nextHistory, hState].slice(-50);
      return {
        history: updatedHistory,
        index: updatedHistory.length - 1
      };
    });
  }, []);

  const undo = useCallback((): HistoryState | null => {
    let targetState: HistoryState | null = null;
    setState(prev => {
      if (prev.index > 0) {
        targetState = prev.history[prev.index - 1];
        return { ...prev, index: prev.index - 1 };
      }
      return prev;
    });
    return targetState;
  }, []);

  const redo = useCallback((): HistoryState | null => {
    let targetState: HistoryState | null = null;
    setState(prev => {
      if (prev.index < prev.history.length - 1) {
        targetState = prev.history[prev.index + 1];
        return { ...prev, index: prev.index + 1 };
      }
      return prev;
    });
    return targetState;
  }, []);

  return {
    history: state.history,
    historyIndex: state.index,
    setInitialHistory,
    addToHistory,
    undo,
    redo,
    historyLength: state.history.length
  };
}
