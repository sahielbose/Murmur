"use client";

import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/** Recording-detail tabs (MURMUR_UI.md §10.5). Panels are server-rendered and
 * passed in as children. */
export function RecordingTabs({
  summary,
  transcript,
  actions,
  mindMap,
}: {
  summary: ReactNode;
  transcript: ReactNode;
  actions: ReactNode;
  mindMap: ReactNode;
}) {
  return (
    <Tabs defaultValue="summary" className="w-full">
      <TabsList>
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="transcript">Transcript</TabsTrigger>
        <TabsTrigger value="actions">Action items</TabsTrigger>
        <TabsTrigger value="mindmap">Mind map</TabsTrigger>
      </TabsList>
      <TabsContent value="summary">{summary}</TabsContent>
      <TabsContent value="transcript">{transcript}</TabsContent>
      <TabsContent value="actions">{actions}</TabsContent>
      <TabsContent value="mindmap">{mindMap}</TabsContent>
    </Tabs>
  );
}

export function TabPlaceholder({ children }: { children: ReactNode }) {
  return <p className="py-6 text-sm text-fg-muted">{children}</p>;
}
