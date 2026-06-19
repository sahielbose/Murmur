import type { MindMapGraph } from "@murmur/db";

export type PositionedNode = {
  id: string;
  label: string;
  level: number;
  x: number;
  y: number;
};

export type MindMapLayout = {
  nodes: PositionedNode[];
  edges: { from: string; to: string }[];
  width: number;
  height: number;
};

const R1 = 240; // root → branch radius
const R2 = 150; // branch → leaf radius
const PAD = 110;

/** Deterministic radial layout: root center, branches around, leaves fanned out. */
export function layoutMindMap(graph: MindMapGraph): MindMapLayout {
  const childrenOf = (id: string) =>
    graph.edges.filter((e) => e.from === id).map((e) => e.to);

  const root = graph.nodes.find((n) => n.level === 0) ?? graph.nodes[0] ?? null;
  const pos = new Map<string, { x: number; y: number }>();

  if (root) {
    pos.set(root.id, { x: 0, y: 0 });
    const branches = childrenOf(root.id);
    branches.forEach((bid, i) => {
      const angle =
        (i / Math.max(1, branches.length)) * Math.PI * 2 - Math.PI / 2;
      const bx = Math.cos(angle) * R1;
      const by = Math.sin(angle) * R1;
      pos.set(bid, { x: bx, y: by });

      const leaves = childrenOf(bid);
      leaves.forEach((lid, j) => {
        const a2 = angle + (j - (leaves.length - 1) / 2) * 0.55;
        pos.set(lid, {
          x: bx + Math.cos(a2) * R2,
          y: by + Math.sin(a2) * R2,
        });
      });
    });
  }

  const raw = graph.nodes.map((n) => {
    const p = pos.get(n.id) ?? { x: 0, y: 0 };
    return { id: n.id, label: n.label, level: n.level, x: p.x, y: p.y };
  });

  const xs = raw.map((n) => n.x);
  const ys = raw.map((n) => n.y);
  const minX = Math.min(0, ...xs) - PAD;
  const minY = Math.min(0, ...ys) - PAD;
  const maxX = Math.max(0, ...xs) + PAD;
  const maxY = Math.max(0, ...ys) + PAD;

  return {
    nodes: raw.map((n) => ({ ...n, x: n.x - minX, y: n.y - minY })),
    edges: graph.edges,
    width: maxX - minX,
    height: maxY - minY,
  };
}
