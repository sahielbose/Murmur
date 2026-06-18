import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="grid min-h-screen place-items-center bg-bg px-6 text-fg">
      <div className="flex flex-col items-center text-center">
        <span className="text-overline mb-6 text-[13px] font-medium uppercase tracking-[0.12em] text-fg-subtle">
          Introducing Murmur
        </span>
        <h1 className="font-serif text-6xl font-bold tracking-[-0.03em] text-fg-strong">
          Murmur
        </h1>
        <p className="mt-3 text-lg text-fg-muted">
          Remember every conversation.
        </p>
        <div className="mt-8">
          <ThemeToggle />
        </div>
      </div>
    </main>
  );
}
