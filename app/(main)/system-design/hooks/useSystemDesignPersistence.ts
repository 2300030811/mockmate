import { useEffect, useState, useRef } from "react";
import { Node, Connection, Group } from "../types";

interface PersistenceProps {
  nodes: Node[];
  connections: Connection[];
  groups: Group[];
  theme: string;
  dispatch: (action: any) => void;
  setInitialHistory: (state: { nodes: Node[]; connections: Connection[]; groups: Group[] }) => void;
}

export function useSystemDesignPersistence({
  nodes,
  connections,
  groups,
  theme,
  dispatch,
  setInitialHistory
}: PersistenceProps) {
  const [hasLoaded, setHasLoaded] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tutorialTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initial Load
  useEffect(() => {
    const saved = localStorage.getItem('mockmate-design-pro-v3');
    const savedTheme = localStorage.getItem('mockmate-design-theme') as any;
    if (savedTheme) dispatch({ type: "SET_THEME", theme: savedTheme });

    if (saved) {
      try {
        const p = JSON.parse(saved);
        dispatch({
          type: "LOAD_STATE", state: {
            nodes: p.nodes || [],
            connections: p.connections || [],
            groups: p.groups || []
          }
        });
        setInitialHistory({ nodes: p.nodes || [], connections: p.connections || [], groups: p.groups || [] });
      } catch (e) {
        const old = localStorage.getItem('mockmate-design-pro');
        if (old) {
          const p = JSON.parse(old);
          const initial = { nodes: p.nodes || [], connections: p.connections || [], groups: p.groups || [] };
          dispatch({ type: "LOAD_STATE", state: initial });
          setInitialHistory(initial);
        }
      }
    } else {
      setInitialHistory({ nodes: [], connections: [], groups: [] });
    }
    setHasLoaded(true);

    // Auto-trigger tutorial if not onboarded
    const onboarded = localStorage.getItem('mockmate-sd-onboarded');
    if (!onboarded) {
      tutorialTimeoutRef.current = setTimeout(() => dispatch({ type: "SET_SHOW_TUTORIAL", show: true }), 1500);
    }

    return () => {
      if (tutorialTimeoutRef.current) clearTimeout(tutorialTimeoutRef.current);
    };
  }, [dispatch, setInitialHistory]);

  // Debounced Save
  useEffect(() => {
    if (!hasLoaded) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      const data = { nodes, connections, groups, timestamp: Date.now() };
      localStorage.setItem('mockmate-design-pro-v3', JSON.stringify(data));
      localStorage.setItem('mockmate-design-theme', theme);
    }, 300);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [nodes, connections, groups, theme, hasLoaded]);

  return { hasLoaded };
}
