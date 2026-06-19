import { Wordmark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { devSignIn } from "@/lib/auth/actions";

export default function SignupPage() {
  return (
    <main className="mx-auto grid w-full max-w-container-narrow flex-1 place-items-center px-6 py-24">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Wordmark href="/" />
          <h1 className="mt-6 font-serif text-3xl font-bold tracking-[-0.02em] text-fg-strong">
            Start free
          </h1>
          <p className="mt-2 text-sm text-fg-muted">
            Create your Murmur account.
          </p>
        </div>
        <form action={devSignIn} className="flex flex-col gap-3">
          <Input
            name="name"
            type="text"
            placeholder="Your name"
            aria-label="Name"
            autoComplete="name"
          />
          <Input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            aria-label="Email"
            autoComplete="email"
          />
          <Button type="submit" size="lg">
            Create account
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-fg-muted">
          Dev mode — this creates a local session. Real auth arrives in Phase
          18.
        </p>
      </div>
    </main>
  );
}
