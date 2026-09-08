import { createAdminClient } from "@insforge/sdk";

export function createInsforgeAdminClient() {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
  const apiKey = process.env.INSFORGE_ADMIN_KEY;
  return baseUrl && apiKey ? createAdminClient({ baseUrl, apiKey }) : null;
}
