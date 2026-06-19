import { serve } from "inngest/next";
import { inngest, functions } from "@murmur/jobs";

/** Serves the Murmur Inngest functions to the dev server / Inngest Cloud. */
export const { GET, POST, PUT } = serve({ client: inngest, functions });
