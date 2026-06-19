"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import type { MindMapGraph } from "@murmur/db";
import { layoutMindMap, type PositionedNode } from "@/lib/mindmap-layout";
import { cn } from "@/lib/utils";

function nodeWidth(n: PositionedNode) {
  return Math.min(220, Math.max(64, n.label.length * 7.5 + 24));
}

/** Interactive mind map (MURMUR_UI.md §10.5): zoom (wheel/buttons) + drag-pan. */
export function MindMapCanvas({ graph }: { graph: MindMapGraph }) {
  const layout = useMemo(() => layoutMindMap(graph), [graph]);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const drag = useRef<{ x: number; y: number; tx: number; ty: number } | null>(
    null,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [panning, setPanning] = useState(false);
  const reduceMotion = useReducedMotion();

  // Center the graph in the viewport on mount / when the graph changes.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    setTx((width - layout.width) / 2);
    setTy((height - layout.height) / 2);
    setScale(1);
  }, [layout]);

  const nodeById = useMemo(
    () => new Map(layout.nodes.map((n) => [n.id, n])),
    [layout],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, tx, ty };
    setPanning(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setTx(drag.current.tx + (e.clientX - drag.current.x));
    setTy(drag.current.ty + (e.clientY - drag.current.y));
  };
  const onPointerUp = () => {
    drag.current = null;
    setPanning(false);
  };
  const onWheel = (e: React.WheelEvent) => {
    const next = Math.min(2.5, Math.max(0.4, scale - e.deltaY * 0.001));
    setScale(next);
  };
  const zoom = (delta: number) =>
    setScale((s) => Math.min(2.5, Math.max(0.4, s + delta)));

  return (
    <div
      ref={containerRef}
      className="relative h-80 overflow-hidden rounded-lg border border-border bg-bg-subtle md:h-[440px]"
    >
      <svg
        role="img"
        aria-label="Mind map of the conversation. Drag to pan, scroll to zoom."
        className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
      >
        <g
          style={{
            transform: `translate(${tx}px,${ty}px) scale(${scale})`,
            transition:
              reduceMotion || panning ? "none" : "transform 150ms var(--ease)",
          }}
        >
          {layout.edges.map((e, i) => {
            const a = nodeById.get(e.from);
            const b = nodeById.get(e.to);
            if (!a || !b) return null;
            return (
              <line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="var(--border-strong)"
                strokeWidth={1.5}
              />
            );
          })}
          {layout.nodes.map((n) => {
            const w = nodeWidth(n);
            const h = n.level === 0 ? 38 : 32;
            const fill =
              n.level === 0
                ? "fill-[var(--fg-strong)] stroke-none"
                : n.level === 1
                  ? "fill-[var(--bg)] stroke-[var(--border-strong)]"
                  : "fill-[var(--bg-elevated)] stroke-[var(--border)]";
            const textFill =
              n.level === 0 ? "fill-[var(--fg-inverse)]" : "fill-[var(--fg)]";
            return (
              <g
                key={n.id}
                transform={`translate(${n.x - w / 2},${n.y - h / 2})`}
              >
                <rect
                  width={w}
                  height={h}
                  rx={n.level === 0 ? 10 : 8}
                  className={fill}
                  strokeWidth={1}
                />
                <text
                  x={w / 2}
                  y={h / 2 + 4}
                  textAnchor="middle"
                  className={cn(
                    "select-none",
                    n.level === 0 ? "text-[13px] font-medium" : "text-[12px]",
                    textFill,
                  )}
                >
                  {n.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      <div className="absolute bottom-3 right-3 flex flex-col gap-1">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => zoom(0.2)}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-bg text-fg hover:bg-bg-subtle"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => zoom(-0.2)}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-bg text-fg hover:bg-bg-subtle"
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
