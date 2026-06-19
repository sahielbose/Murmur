/**
 * Canned two-speaker conversations for the mock STT. A script is chosen
 * deterministically from the transcribe seed so different recordings get
 * different (but reproducible) transcripts. All original content.
 */
export type ScriptLine = { speaker: number; text: string };
export type Script = { speakers: string[]; lines: ScriptLine[] };

export const SCRIPTS: Script[] = [
  {
    speakers: ["Speaker 1", "Speaker 2"],
    lines: [
      {
        speaker: 0,
        text: "Thanks for making time. Let's start with the budget.",
      },
      {
        speaker: 1,
        text: "Sure. The first estimate came in a little over what we discussed.",
      },
      { speaker: 0, text: "By how much, roughly?" },
      {
        speaker: 1,
        text: "About ten percent. Most of it is materials, not labor.",
      },
      {
        speaker: 0,
        text: "Can we phase it so the first part fits this quarter?",
      },
      {
        speaker: 1,
        text: "Yes. I'll send a revised plan with two phases by Thursday.",
      },
      {
        speaker: 0,
        text: "Perfect. I'll review it and get back to you with a decision.",
      },
      {
        speaker: 1,
        text: "Sounds good. I'll also confirm the delivery dates.",
      },
    ],
  },
  {
    speakers: ["Speaker 1", "Speaker 2"],
    lines: [
      { speaker: 0, text: "How are you feeling about the launch timeline?" },
      {
        speaker: 1,
        text: "Cautiously optimistic. The main risk is the data migration.",
      },
      { speaker: 0, text: "What would de-risk it?" },
      { speaker: 1, text: "A dry run on a copy of production this week." },
      {
        speaker: 0,
        text: "Let's do that. I'll get you a staging snapshot tomorrow.",
      },
      {
        speaker: 1,
        text: "Great. I'll write up the rollback steps in case we need them.",
      },
      {
        speaker: 0,
        text: "And let's tell the team we approve before anything ships.",
      },
      { speaker: 1, text: "Agreed - nothing goes out without sign-off." },
    ],
  },
  {
    speakers: ["Speaker 1", "Speaker 2"],
    lines: [
      {
        speaker: 0,
        text: "I wanted to walk through the follow-ups from last time.",
      },
      {
        speaker: 1,
        text: "Right. I still owe you the summary of the vendor call.",
      },
      { speaker: 0, text: "No rush, but it would help before the review." },
      {
        speaker: 1,
        text: "I'll send it tonight and flag the two open questions.",
      },
      { speaker: 0, text: "Thank you. Anything you need from me?" },
      {
        speaker: 1,
        text: "Just your notes on pricing so I can finalize the deck.",
      },
      { speaker: 0, text: "I'll share them this afternoon." },
      { speaker: 1, text: "Then we should be set for the meeting." },
    ],
  },
];
