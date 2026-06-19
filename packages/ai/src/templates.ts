export type SystemTemplate = {
  key: string;
  name: string;
  description: string;
  promptBody: string;
};

/**
 * System summary template library (MURMUR_CONTEXT.md §8). A template's
 * `promptBody` is injected into the summary prompt. Kept here so prompts are
 * reviewable and eval-able. All original content.
 */
export const SYSTEM_TEMPLATES: SystemTemplate[] = [
  {
    key: "meeting-notes",
    name: "Meeting notes",
    description: "A concise overview, key points, decisions, and next steps.",
    promptBody:
      "Summarize as meeting notes: a one-line overview, key discussion points as bullets, decisions made, and clear next steps.",
  },
  {
    key: "action-first",
    name: "Action-item first",
    description: "Leads with the to-dos and owners.",
    promptBody:
      "Lead with the action items and their owners, then a brief summary of the context. Make the to-dos unmistakable.",
  },
  {
    key: "medical-visit",
    name: "Medical visit",
    description: "Notes from an appointment - information, not advice.",
    promptBody:
      "Summarize a medical visit as information, not advice. List the notes, what the clinician said, and follow-ups. Add a reminder to consult a professional and flag anything urgent.",
  },
  {
    key: "sales-call",
    name: "Sales call",
    description: "Needs, objections, pricing, and next steps.",
    promptBody:
      "Summarize as a sales call: the prospect's needs, objections raised, any pricing discussed, and next steps with owners.",
  },
  {
    key: "lecture",
    name: "Lecture / class",
    description: "Study notes with concepts and key points.",
    promptBody:
      "Summarize as study notes: the main topics, key concepts and definitions, and anything called out as important.",
  },
  {
    key: "interview",
    name: "Interview",
    description: "Background, strengths, concerns, and a framing.",
    promptBody:
      "Summarize an interview: the person's background, notable strengths, any concerns, and a neutral framing (information only).",
  },
  {
    key: "one-on-one",
    name: "1:1",
    description: "Updates, blockers, feedback, and next steps.",
    promptBody:
      "Summarize a 1:1: updates shared, blockers, feedback exchanged, and agreed next steps.",
  },
  {
    key: "standup",
    name: "Standup",
    description: "Per-person progress, next, and blockers.",
    promptBody:
      "Summarize a standup grouped per person: what they did, what's next, and any blockers.",
  },
  {
    key: "user-interview",
    name: "User interview",
    description: "Goals, pain points, quotes, and opportunities.",
    promptBody:
      "Summarize a user interview: the person's goals, pain points, memorable quotes, and product opportunities.",
  },
  {
    key: "project-update",
    name: "Project update",
    description: "Status, risks, decisions, and next steps.",
    promptBody:
      "Summarize a project update: current status, risks, decisions, and next steps.",
  },
  {
    key: "brain-dump",
    name: "Brain-dump",
    description: "Organize freeform thoughts into themes and tasks.",
    promptBody:
      "Organize this freeform brain-dump into clear themes with bullets, and surface any tasks at the end.",
  },
  {
    key: "coaching",
    name: "Coaching session",
    description: "Themes, reflections, and agreed actions.",
    promptBody:
      "Summarize a coaching session respectfully: the themes discussed, reflections, and agreed actions. Information, not advice.",
  },
];
