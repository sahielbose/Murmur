import type { ReactNode } from "react";
import { getEmbeddings, getLlm, getStorage, getStt } from "@murmur/ai";
import { getDbUser } from "@/lib/current-user";
import { PageHeader } from "@/components/app/page-header";
import {
  ConsentSettings,
  ProfileSettings,
} from "@/components/app/settings/settings-form";
import { AnthropicKeySettings } from "@/components/app/settings/anthropic-key-settings";

const PLAN_COPY: Record<string, string> = {
  free: "Free - 10 Ask questions a day and your last few recordings.",
  pro: "Pro - unlimited Ask, full history, and priority processing.",
  enterprise: "Enterprise - SSO, shared workspaces, and custom retention.",
};

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border p-5">
      <h2 className="font-semibold text-fg-strong">{title}</h2>
      {description ? (
        <p className="mt-0.5 text-sm text-fg-muted">{description}</p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ProviderRow({ label, name }: { label: string; name: string }) {
  const isMock = name === "mock";
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-fg">{label}</span>
      <span className="flex items-center gap-2">
        <span className="font-mono text-xs text-fg-muted">{name}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            isMock ? "bg-bg-subtle text-fg-muted" : "bg-fg text-bg"
          }`}
        >
          {isMock ? "mock" : "live"}
        </span>
      </span>
    </div>
  );
}

export default async function SettingsPage() {
  const user = await getDbUser();
  if (!user) {
    return (
      <main className="flex-1 p-6 md:p-8">
        <PageHeader title="Settings" />
        <p className="mt-6 text-sm text-fg-muted">Sign in to view settings.</p>
      </main>
    );
  }

  const providers = [
    { label: "Speech-to-text", name: getStt().name },
    { label: "Language model", name: getLlm().name },
    { label: "Embeddings", name: getEmbeddings().name },
    { label: "Storage", name: getStorage().name },
  ];

  return (
    <main className="flex-1 p-6 md:p-8">
      <PageHeader
        title="Settings"
        description="Your profile, plan, consent, and the engines behind Murmur."
      />
      <div className="mt-6 grid max-w-2xl gap-5">
        <Section
          title="Murmur AI"
          description="Bring your own Anthropic key. Murmur runs every AI feature on Claude - add a key and everything just works."
        >
          <AnthropicKeySettings />
        </Section>

        <Section title="Profile">
          <ProfileSettings initialName={user.name} email={user.email} />
        </Section>

        <Section title="Plan">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-fg px-3 py-1 text-xs font-medium capitalize text-bg">
              {user.plan}
            </span>
            <p className="text-sm text-fg-muted">
              {PLAN_COPY[user.plan] ?? ""}
            </p>
          </div>
        </Section>

        <Section
          title="Recording consent"
          description="Murmur captures conversations. Please confirm you'll get consent first."
        >
          <ConsentSettings
            acknowledgedAt={user.settings?.consentAcknowledgedAt ?? null}
          />
        </Section>

        <Section
          title="Providers"
          description="The active speech, language, embedding, and storage engines."
        >
          <div className="divide-y divide-border">
            {providers.map((p) => (
              <ProviderRow key={p.label} label={p.label} name={p.name} />
            ))}
          </div>
        </Section>
      </div>
    </main>
  );
}
