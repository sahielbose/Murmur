import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Consistent page heading for app screens: title, optional description + actions. */
export function PageHeader({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-fg-strong">
          {title}
        </h1>
        {children ? (
          <div className="flex items-center gap-2">{children}</div>
        ) : null}
      </div>
      {description ? (
        <p className="max-w-2xl text-fg-muted">{description}</p>
      ) : null}
    </div>
  );
}
