import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/config";

let cachedBrowserClient: SupabaseClient | null = null;

/**
 * Browser Supabase client (Next.js App Router).
 * Uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from .env.local
 */
export function createBrowserSupabaseClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
    );
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!cachedBrowserClient) {
    cachedBrowserClient = createBrowserClient(url, key);
  }
  return cachedBrowserClient;
}

/**
 * Singleton alias สำหรับ client components — ใช้เฉพาะฝั่ง client หลังมี window
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = createBrowserSupabaseClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(client) : value;
  },
}) as SupabaseClient;
