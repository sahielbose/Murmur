import type { MindMapLayout } from "@/lib/mindmap-layout";

export type MindMapTheme = {
  fg: string;
  fgStrong: string;
  fgInverse: string;
  bg: string;
  bgElevated: string;
  border: string;
  borderStrong: string;
};

function nodeWidth(label: string): number {
  return Math.min(220, Math.max(64, label.length * 7.5 + 24));
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Build a portable, self-contained SVG string (literal colors, no CSS vars). */
export function mindMapToSvgString(
  layout: MindMapLayout,
  theme: MindMapTheme,
): string {
  const byId = new Map(layout.nodes.map((n) => [n.id, n]));

  const edges = layout.edges
    .map((e) => {
      const a = byId.get(e.from);
      const b = byId.get(e.to);
      if (!a || !b) return "";
      return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${theme.borderStrong}" stroke-width="1.5" />`;
    })
    .join("");

  const nodes = layout.nodes
    .map((n) => {
      const w = nodeWidth(n.label);
      const h = n.level === 0 ? 38 : 32;
      const x = n.x - w / 2;
      const y = n.y - h / 2;
      const fill =
        n.level === 0
          ? theme.fgStrong
          : n.level === 1
            ? theme.bg
            : theme.bgElevated;
      const stroke = n.level === 0 ? "none" : theme.borderStrong;
      const textColor = n.level === 0 ? theme.fgInverse : theme.fg;
      const weight = n.level === 0 ? "600" : "400";
      return `<g transform="translate(${x},${y})"><rect width="${w}" height="${h}" rx="${
        n.level === 0 ? 10 : 8
      }" fill="${fill}" stroke="${stroke}" stroke-width="1" /><text x="${
        w / 2
      }" y="${h / 2 + 4}" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="12" font-weight="${weight}" fill="${textColor}">${esc(
        n.label,
      )}</text></g>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}"><rect width="${layout.width}" height="${layout.height}" fill="${theme.bg}" />${edges}${nodes}</svg>`;
}

export async function svgStringToPngBlob(
  svg: string,
  width: number,
  height: number,
  scale = 2,
): Promise<Blob> {
  const img = new Image();
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("svg load failed"));
    img.src = url;
  });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width * scale);
  canvas.height = Math.ceil(height * scale);
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
  }
  URL.revokeObjectURL(url);
  return new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b ?? new Blob()), "image/png"),
  );
}

export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function readMindMapTheme(): MindMapTheme {
  const s = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) =>
    s.getPropertyValue(name).trim() || fallback;
  return {
    fg: v("--fg", "#0a0a0a"),
    fgStrong: v("--fg-strong", "#000000"),
    fgInverse: v("--fg-inverse", "#ffffff"),
    bg: v("--bg", "#ffffff"),
    bgElevated: v("--bg-elevated", "#fafafa"),
    border: v("--border", "#e4e4e7"),
    borderStrong: v("--border-strong", "#d4d4d8"),
  };
}
