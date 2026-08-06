"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CanonicalMenu } from "@shared/contracts";
import { buildMenuPages, MenuSheet } from "@/components/MenuDocument";

const ZOOM_STEPS = [0.7, 0.85, 1, 1.15, 1.35, 1.6, 2] as const;

type MenuViewerProps = {
  menu: CanonicalMenu;
  verified: boolean;
  updatedLabel: string;
};

export function MenuViewer({ menu, verified, updatedLabel }: MenuViewerProps) {
  const pages = buildMenuPages(menu);
  const [zoomIndex, setZoomIndex] = useState(2); // 100%
  const stageRef = useRef<HTMLDivElement>(null);
  const zoom = ZOOM_STEPS[zoomIndex];

  const zoomIn = useCallback(() => {
    setZoomIndex((i) => Math.min(i + 1, ZOOM_STEPS.length - 1));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomIndex((i) => Math.max(i - 1, 0));
  }, []);

  const resetZoom = useCallback(() => setZoomIndex(2), []);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    function onWheel(e: WheelEvent) {
      if (!(e.metaKey || e.ctrlKey)) return;
      e.preventDefault();
      if (e.deltaY < 0) zoomIn();
      else zoomOut();
    }

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomIn, zoomOut]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 bg-white/80 px-4 py-2.5 backdrop-blur sm:px-6">
        <p className="font-sans text-sm text-ink/60 md:hidden">
          Scroll the menu pages
        </p>
        <p className="hidden font-sans text-sm text-ink/60 md:block">
          Printed menu view · scroll to pan · ⌘/Ctrl + scroll to zoom
        </p>
        <div className="hidden items-center gap-1.5 md:flex">
          <button
            type="button"
            onClick={zoomOut}
            disabled={zoomIndex === 0}
            className="h-8 w-8 rounded border border-ink/15 bg-white text-ink hover:border-ink/30 disabled:opacity-40"
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            type="button"
            onClick={resetZoom}
            className="min-w-[4.25rem] rounded border border-ink/15 bg-white px-2 py-1.5 font-mono text-xs text-ink hover:border-ink/30"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            onClick={zoomIn}
            disabled={zoomIndex === ZOOM_STEPS.length - 1}
            className="h-8 w-8 rounded border border-ink/15 bg-white text-ink hover:border-ink/30 disabled:opacity-40"
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
      </div>

      {/* Desktop / laptop: letter pages side-by-side, zoom + pan */}
      <div
        ref={stageRef}
        className="menu-viewer-stage relative hidden min-h-[72vh] flex-1 overflow-auto md:block"
      >
        <div
          className="mx-auto flex w-max origin-top flex-col items-center gap-8 px-8 py-10"
          style={{
            transform: `scale(${zoom})`,
            transition: "transform 160ms ease-out",
          }}
        >
          <div className="flex flex-row items-start gap-6 xl:gap-8">
            {pages.map((page, index) => (
              <div
                key={`desk-${index}`}
                className="h-[11in] w-[8.5in] shrink-0"
              >
                <MenuSheet
                  menu={menu}
                  page={page}
                  pageNumber={index + 1}
                  totalPages={pages.length}
                  verified={verified}
                  version={menu.version}
                  updatedLabel={updatedLabel}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: continuous PDF-style vertical scroll */}
      <div className="menu-viewer-stage flex flex-1 flex-col gap-4 px-3 py-4 md:hidden">
        {pages.map((page, index) => (
          <div
            key={`mob-${index}`}
            className="mx-auto aspect-[8.5/11] w-full max-w-[26rem]"
          >
            <MenuSheet
              menu={menu}
              page={page}
              pageNumber={index + 1}
              totalPages={pages.length}
              verified={verified}
              version={menu.version}
              updatedLabel={updatedLabel}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
