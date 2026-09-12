import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Supabase access.
 *
 * Only the publishable key is ever used. Row-level security is what actually
 * protects the data: the public role can read approved stories, trends, the
 * taxonomy, approved provenance, simulated radar rows, scenarios, the weekly
 * digest, published community posts and their comments — and has no read access
 * whatsoever to `reports` or `moderation_items`.
 *
 * So the worst case for a leaked publishable key is that somebody can read the
 * content the site already shows them.
 *
 * Two clients, because they answer different questions:
 *   - `supabase()` is anonymous and cached. Every read of public content goes
 *     through it, and it never touches cookies, so pages using it stay static.
 *   - `supabaseUser()` carries the signed-in session from cookies. Only use it
 *     where identity matters — writing a comment, or asking who is logged in.
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

export const isSupabaseConfigured = Boolean(URL && KEY);

let anonClient: SupabaseClient | null = null;

export function supabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!anonClient) {
    anonClient = createClient(URL!, KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return anonClient;
}

/**
 * A request-scoped client that reads (and refreshes) the auth cookies.
 *
 * Not cached — it is bound to one request's cookie jar. In a Server Component
 * the cookie store is read-only, so the setAll hook is allowed to fail quietly;
 * middleware is what actually refreshes the session cookie.
 */
export async function supabaseUser(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) return null;
  const store = await cookies();

  return createServerClient(URL!, KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          /* Read-only in a Server Component; middleware handles the refresh. */
        }
      },
    },
  });
}

/** The signed-in user, or null. Safe to call anywhere on the server. */
export async function currentUser() {
  const client = await supabaseUser();
  if (!client) return null;
  const { data } = await client.auth.getUser();
  if (!data.user) return null;
  const meta = data.user.user_metadata ?? {};
  return {
    id: data.user.id,
    email: data.user.email ?? null,
    name: (meta.display_name as string) || (data.user.email?.split("@")[0] ?? "Someone"),
  };
}
