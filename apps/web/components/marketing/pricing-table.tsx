import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Tier = {
  name: string;
  price: string;
  cadence?: string;
  tagline: string;
  features: string[];
  cta: { label: string; href: string };
  featured?: boolean;
};

const TIERS: Tier[] = [
  {
    name: "Free",
    price: "$0",
    tagline: "Everything you need to get started.",
    features: [
      "Record and upload in your browser",
      "Transcripts, summaries, and action items",
      "10 Ask questions a day",
      "Your most recent recordings",
    ],
    cta: { label: "Start free", href: "/signup" },
  },
  {
    name: "Pro",
    price: "$12",
    cadence: "/ month",
    tagline: "For people who live in conversations.",
    features: [
      "Everything in Free",
      "Unlimited Ask, across your full history",
      "Every summary template",
      "Exports to PDF and Word",
      "Priority processing",
    ],
    cta: { label: "Go Pro", href: "/signup" },
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    tagline: "For teams and organizations.",
    features: [
      "Everything in Pro",
      "SSO and SAML",
      "Shared workspaces",
      "Custom retention and data residency",
      "Priority support",
    ],
    cta: { label: "Talk to sales", href: "/enterprise" },
  },
];

export function PricingTable() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {TIERS.map((tier) => (
        <div
          key={tier.name}
          className={cn(
            "flex flex-col rounded-2xl border p-6",
            tier.featured
              ? "border-fg bg-black text-white"
              : "border-border bg-bg",
          )}
        >
          <div className="flex items-center justify-between">
            <h3
              className={cn(
                "text-sm font-semibold uppercase tracking-[0.12em]",
                tier.featured ? "text-white/70" : "text-fg-muted",
              )}
            >
              {tier.name}
            </h3>
            {tier.featured ? (
              <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-black">
                Most popular
              </span>
            ) : null}
          </div>

          <div className="mt-4 flex items-baseline gap-1">
            <span
              className={cn(
                "font-serif text-4xl tracking-tight",
                tier.featured ? "text-white" : "text-fg-strong",
              )}
            >
              {tier.price}
            </span>
            {tier.cadence ? (
              <span
                className={cn(
                  "text-sm",
                  tier.featured ? "text-white/60" : "text-fg-subtle",
                )}
              >
                {tier.cadence}
              </span>
            ) : null}
          </div>
          <p
            className={cn(
              "mt-2 text-sm",
              tier.featured ? "text-white/65" : "text-fg-muted",
            )}
          >
            {tier.tagline}
          </p>

          <ul className="mt-6 flex-1 space-y-3">
            {tier.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm">
                <Check
                  className={cn(
                    "mt-0.5 h-4 w-4 shrink-0",
                    tier.featured ? "text-white" : "text-fg",
                  )}
                />
                <span className={tier.featured ? "text-white/85" : "text-fg"}>
                  {f}
                </span>
              </li>
            ))}
          </ul>

          <Button
            asChild
            size="lg"
            variant={tier.featured ? "default" : "secondary"}
            className={cn(
              "mt-8 w-full",
              tier.featured && "bg-white text-black hover:bg-white/90",
            )}
          >
            <Link href={tier.cta.href}>{tier.cta.label}</Link>
          </Button>
        </div>
      ))}
    </div>
  );
}
