import { redirect } from "next/navigation";

// Pricing was removed - Murmur runs on your own Anthropic API key.
export default function PricingPage() {
  redirect("/");
}
