import { PricingTable } from "@/components/marketing/pricing-table";

export const metadata = { title: "Pricing — Murmur" };

export default function PricingPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-24">
      <div className="text-center">
        <h1 className="font-serif text-4xl font-bold tracking-[-0.02em] text-fg-strong sm:text-5xl">
          Simple pricing.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-lg text-fg-muted">
          Start free. Upgrade when conversations become your job.
        </p>
      </div>
      <div className="mt-12">
        <PricingTable />
      </div>
    </main>
  );
}
