import { useCallback } from "react";
import { toast } from "sonner";
import { Node, Connection, Group } from "../types";

interface UseSystemDesignExportProps {
  nodes: Node[];
  connections: Connection[];
  groups: Group[];
  svgRef: React.RefObject<SVGSVGElement | null>;
}

export function useSystemDesignExport({
  nodes,
  connections,
  groups,
  svgRef,
}: UseSystemDesignExportProps) {

  const exportSVG = useCallback(() => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mockmate-design-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("SVG Exported!");
  }, [svgRef]);

  const copyJSON = useCallback(() => {
    const data = JSON.stringify({ nodes, connections, groups });
    navigator.clipboard.writeText(data);
    toast.success("JSON Architecture Copied");
  }, [nodes, connections, groups]);

  return { exportSVG, copyJSON };
}
