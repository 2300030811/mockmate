import { useState, useCallback } from "react";

export function useSelection() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"node" | "connection" | "group" | null>(null);

  const selectElement = useCallback((id: string | null, type: "node" | "connection" | "group" | null) => {
    setSelectedId(id);
    setSelectedType(type);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedId(null);
    setSelectedType(null);
  }, []);

  return {
    selectedId,
    selectedType,
    selectElement,
    clearSelection
  };
}
