import { createClient } from "@insforge/sdk";

export function createInsforgeClient() {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;
  return baseUrl && anonKey ? createClient({ baseUrl, anonKey }) : null;
}
