"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CATEGORIES = [
  {
    id: "using",
    label: "Using Murmur",
    qas: [
      {
        q: "How do I start a recording?",
        a: "Open Murmur, click Record, and allow microphone access. Click again to stop — your notes are ready moments later.",
      },
      {
        q: "Can Murmur tell who said what?",
        a: "Yes. Murmur separates speakers automatically, and you can rename them once and have it apply across the whole conversation.",
      },
      {
        q: "What do I get after a recording?",
        a: "A full transcript, a summary in the style you choose, a list of action items, and a mind map — all searchable.",
      },
    ],
  },
  {
    id: "compatibility",
    label: "Compatibility",
    qas: [
      {
        q: "Do I need any hardware?",
        a: "No. Murmur runs entirely in your browser and uses your device's microphone. You can also upload audio files you already have.",
      },
    ],
  },
  {
    id: "privacy",
    label: "Privacy & data",
    qas: [
      {
        q: "Is my data private?",
        a: "Your recordings are encrypted in transit and at rest, isolated to your account, and never sold or shared. You can export or permanently delete anything.",
      },
      {
        q: "About recording consent.",
        a: "Recording laws vary by location and many require everyone's consent. You're responsible for getting it — Murmur shows a reminder before your first recording.",
      },
    ],
  },
];

export function Faq() {
  return (
    <section id="faq" className="border-t border-border bg-bg py-24">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="font-serif text-3xl leading-tight tracking-tight text-fg-strong sm:text-4xl">
          Frequently asked.
        </h2>

        <Tabs defaultValue="using" className="mt-10">
          <TabsList className="flex-wrap justify-start gap-2 bg-transparent p-0">
            {CATEGORIES.map((c) => (
              <TabsTrigger key={c.id} value={c.id}>
                {c.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {CATEGORIES.map((c) => (
            <TabsContent key={c.id} value={c.id} className="mt-4">
              <Accordion type="single" collapsible className="w-full">
                {c.qas.map((qa, i) => (
                  <AccordionItem key={qa.q} value={`${c.id}-${i}`}>
                    <AccordionTrigger className="text-left text-base font-medium text-fg-strong">
                      {qa.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-fg-muted">
                      {qa.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
