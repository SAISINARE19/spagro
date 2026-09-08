import { createServerClient } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";

export async function createServerInsforgeClient() {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || process.env.INSFORGE_ADMIN_KEY;
  if (!baseUrl || !anonKey) return null;
  const store = await cookies();
  return createServerClient({ baseUrl, anonKey, cookies: { get: (name) => store.get(name)?.value } });
}
