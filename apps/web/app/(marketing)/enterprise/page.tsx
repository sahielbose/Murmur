import { LeadForm } from "@/components/marketing/lead-form";

export const metadata = { title: "Murmur for teams" };

export default function EnterprisePage() {
  return (
    <main className="mx-auto grid w-full max-w-5xl gap-12 px-6 py-24 md:grid-cols-2">
      <div>
        <h1 className="font-serif text-4xl font-bold tracking-[-0.02em] text-fg-strong sm:text-5xl">
          Murmur for teams.
        </h1>
        <p className="mt-4 max-w-md text-lg text-fg-muted">
          Shared workspaces, single sign-on, and the controls your organization
          needs. Tell us about your team and we&apos;ll find the right fit.
        </p>
        <ul className="mt-8 space-y-3 text-sm text-fg">
          {[
            "SSO and SAML",
            "Shared workspaces and admin controls",
            "Custom retention and data residency",
            "Priority support",
          ].map((f) => (
            <li key={f} className="border-t border-border pt-3">
              {f}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <LeadForm />
      </div>
    </main>
  );
}
