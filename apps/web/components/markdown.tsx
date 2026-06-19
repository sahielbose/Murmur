import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  h1: (p) => (
    <h1 className="mt-5 text-xl font-semibold text-fg-strong" {...p} />
  ),
  h2: (p) => (
    <h2 className="mt-5 text-lg font-semibold text-fg-strong" {...p} />
  ),
  h3: (p) => (
    <h3 className="mt-4 text-base font-semibold text-fg-strong" {...p} />
  ),
  p: (p) => <p className="mt-3 leading-relaxed text-fg" {...p} />,
  ul: (p) => <ul className="mt-3 list-disc space-y-1 pl-5 text-fg" {...p} />,
  ol: (p) => <ol className="mt-3 list-decimal space-y-1 pl-5 text-fg" {...p} />,
  li: (p) => <li className="leading-relaxed" {...p} />,
  strong: (p) => <strong className="font-semibold text-fg-strong" {...p} />,
  em: (p) => <em className="italic" {...p} />,
  a: (p) => <a className="underline underline-offset-2" {...p} />,
  blockquote: (p) => (
    <blockquote
      className="mt-3 border-l-2 border-border pl-4 text-fg-muted"
      {...p}
    />
  ),
  code: (p) => (
    <code className="rounded bg-bg-subtle px-1 py-0.5 text-sm" {...p} />
  ),
  hr: () => <hr className="my-5 border-border" />,
};

/** Tokenized monochrome markdown renderer (summaries, Ask answers). */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="first:[&>*]:mt-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
