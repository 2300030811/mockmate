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

const emptyState = { nodes: [], connections: [], groups: [] };

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

  // Initial Load & Migration
  useEffect(() => {
    let saved = localStorage.getItem('mockmate-design-pro');
    let parsed: any = null;
    let needsSaveMigration = false;

    if (saved) {
      try {
        parsed = JSON.parse(saved);
      } catch (e) {
        localStorage.removeItem('mockmate-design-pro');
      }
    }

    // Migration from v3 payload
    if (!parsed) {
      const legacyV3 = localStorage.getItem('mockmate-design-pro-v3');
      if (legacyV3) {
        try {
          const p = JSON.parse(legacyV3);
          parsed = {
            version: 3,
            nodes: p.nodes || [],
            connections: p.connections || [],
            groups: p.groups || []
          };
          needsSaveMigration = true;
        } catch {
          localStorage.removeItem('mockmate-design-pro-v3');
        }
      }
    }

    if (parsed) {
      // Future version checks can go here, e.g.: if (parsed.version === 1) ...
      const stateToLoad = {
        nodes: parsed.nodes || [],
        connections: parsed.connections || [],
        groups: parsed.groups || []
      };
      dispatch({ type: "LOAD_STATE", state: stateToLoad });
      setInitialHistory(stateToLoad);

      if (needsSaveMigration) {
        localStorage.setItem('mockmate-design-pro', JSON.stringify({
          version: 3,
          ...stateToLoad,
          timestamp: Date.now()
        }));
        localStorage.removeItem('mockmate-design-pro-v3');
      }
    } else {
      setInitialHistory(emptyState);
    }

    const savedTheme = localStorage.getItem('mockmate-design-theme') as any;
    if (savedTheme) dispatch({ type: "SET_THEME", theme: savedTheme });

    setHasLoaded(true);

    // Auto-trigger tutorial if not onboarded
    const onboarded = localStorage.getItem('mockmate-sd-onboarded');
    if (!onboarded) {
      tutorialTimeoutRef.current = setTimeout(() => dispatch({ type: "SET_SHOW_TUTORIAL", show: true }), 1500);
    }

    return () => {
      if (tutorialTimeoutRef.current) clearTimeout(tutorialTimeoutRef.current);
    };
  }, [dispatch, setInitialHistory, setHasLoaded]);


  // Debounced Save
  useEffect(() => {
    if (!hasLoaded) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      const data = { version: 3, nodes, connections, groups, timestamp: Date.now() };
      localStorage.setItem('mockmate-design-pro', JSON.stringify(data));
      localStorage.setItem('mockmate-design-theme', theme);
    }, 300);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [nodes, connections, groups, theme, hasLoaded]);

  return { hasLoaded };
}
