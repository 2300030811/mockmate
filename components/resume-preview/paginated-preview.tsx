'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, Eye, EyeOff, FileText } from 'lucide-react';
import { type PageSize, type MarginSettings } from './types';
import { PageContainer } from './page-container';
import { usePagination } from './use-pagination';
import { PAGE_DIMENSIONS, mmToPx, getContentAreaPx } from './page-dimensions';
import { ResumeContent, ResumeContentProps } from './ResumeContent';

interface PaginatedPreviewProps extends ResumeContentProps {
  pageSize?: PageSize;
  margins?: MarginSettings;
}

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 1.5;
const ZOOM_STEP = 0.1;

export function PaginatedPreview({
  pageSize = 'A4',
  margins = { top: 10, bottom: 10, left: 10, right: 10 },
  ...resumeProps
}: PaginatedPreviewProps) {
  const measurementRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.6);
  const [showMargins, setShowMargins] = useState(false);
  const [autoZoom, setAutoZoom] = useState(true);

  const { pages, isCalculating } = usePagination({
    pageSize,
    margins,
    measurementRef,
  });

  // Calculate auto-zoom to fit container width
  const calculateAutoZoom = useCallback(() => {
    if (!containerRef.current || !autoZoom) return;

    const containerWidth = containerRef.current.clientWidth - 48; // Padding
    const pageWidthPx = mmToPx(PAGE_DIMENSIONS[pageSize].width);
    const optimalZoom = Math.min(containerWidth / pageWidthPx, MAX_ZOOM);
    setZoom(Math.max(MIN_ZOOM, Math.min(optimalZoom, 0.75))); // Cap at 75%
  }, [pageSize, autoZoom]);

  // Auto-zoom on mount and when page size changes
  useEffect(() => {
    calculateAutoZoom();
    const handleResize = () => calculateAutoZoom();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateAutoZoom]);

  const handleZoomIn = () => {
    setAutoZoom(false);
    setZoom((z) => Math.min(z + ZOOM_STEP, MAX_ZOOM));
  };

  const handleZoomOut = () => {
    setAutoZoom(false);
    setZoom((z) => Math.max(z - ZOOM_STEP, MIN_ZOOM));
  };

  const toggleMargins = () => setShowMargins((s) => !s);

  const contentArea = getContentAreaPx(pageSize, margins);

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/40">
      {/* Controls bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-black/20 shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= MIN_ZOOM}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md disabled:opacity-50 text-gray-700 dark:text-gray-300"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <span className="font-mono text-[10px] w-9 text-center text-gray-600 dark:text-gray-400">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= MAX_ZOOM}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md disabled:opacity-50 text-gray-700 dark:text-gray-300"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>

          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />

          <button
            onClick={toggleMargins}
            className={`p-1.5 rounded-md flex items-center gap-1.5 text-xs font-medium transition-colors ${
              showMargins 
                ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300' 
                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {showMargins ? <Eye size={14} /> : <EyeOff size={14} />}
            <span className="font-mono text-[10px] uppercase hidden sm:inline">Margins</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
          <FileText size={14} />
          <span className="font-mono text-[10px] uppercase">
            {isCalculating
              ? 'Calculating...'
              : `${pages.length} Page${pages.length !== 1 ? 's' : ''}`}
          </span>
        </div>
      </div>

      {/* Scrollable preview area */}
      <div ref={containerRef} className="flex-1 overflow-y-auto overflow-x-hidden p-4 max-h-[34rem]">
        {/* Hidden measurement container */}
        <div
          ref={measurementRef}
          className="absolute opacity-0 pointer-events-none"
          style={{
            width: contentArea.width,
            left: -9999,
            top: 0,
          }}
          aria-hidden="true"
        >
          <ResumeContent {...resumeProps} />
        </div>

        {/* Visible pages */}
        <div className="flex flex-col items-center gap-6">
          {pages.map((page, index) => (
            <React.Fragment key={page.pageNumber}>
              {index > 0 && (
                <div className="flex items-center gap-2 py-1">
                  <div className="h-px w-6 bg-gray-300 dark:bg-gray-600" />
                  <span className="font-mono text-[9px] text-gray-400 uppercase tracking-widest">
                    Page Break
                  </span>
                  <div className="h-px w-6 bg-gray-300 dark:bg-gray-600" />
                </div>
              )}
              <PageContainer
                pageSize={pageSize}
                margins={margins}
                pageNumber={page.pageNumber}
                totalPages={pages.length}
                scale={zoom}
                showMarginGuides={showMargins}
                contentOffset={page.contentOffset}
                contentEnd={page.contentEnd}
              >
                <ResumeContent {...resumeProps} />
              </PageContainer>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
