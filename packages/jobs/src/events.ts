export type RecordingCreatedData = { recordingId: string };

/** The Inngest event map (typed on the client via EventSchemas). */
export type Events = {
  "recording.created": { data: RecordingCreatedData };
};
