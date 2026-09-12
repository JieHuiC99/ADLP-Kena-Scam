"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * The browser-side Supabase client.
 *
 * Separate from lib/supabase.ts so that server-only code — `cookies()`, the
 * repository layer — never ends up in a client bundle. This one writes the auth
 * session into cookies, which is what lets Server Components see who is signed
 * in on the next request.
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

let client: SupabaseClient | null = null;

export const authConfigured = Boolean(URL && KEY);

export function browserSupabase(): SupabaseClient {
  if (!URL || !KEY) {
    throw new Error("Supabase is not configured; check NEXT_PUBLIC_SUPABASE_* in .env.local");
  }
  if (!client) client = createBrowserClient(URL, KEY);
  return client;
}
