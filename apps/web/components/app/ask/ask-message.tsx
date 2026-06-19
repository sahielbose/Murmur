import { cn } from "@/lib/utils";
import { Markdown } from "@/components/markdown";
import { CitationChip, type Citation } from "./citation-chip";

export type AskMessageData = {
  role: "user" | "assistant";
  content: string;
  citations: Citation[];
};

export function AskMessage({ message }: { message: AskMessageData }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-lg px-4 py-2.5",
          isUser
            ? "bg-primary text-primary-foreground"
            : "border border-border bg-bg",
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
        ) : (
          <>
            <div className="text-sm">
              <Markdown>{message.content}</Markdown>
            </div>
            {message.citations.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {message.citations.map((c, i) => (
                  <CitationChip key={i} citation={c} index={i + 1} />
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
