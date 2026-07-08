import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Lazily-created browser Supabase client. We only use it to invoke the
 * `notify-meeting` edge function (see the contact form) — that function stores
 * the sponsor request and emails uoft.soon@gmail.com via Resend.
 *
 * Created on first call rather than at module load so that prerendering `/`
 * during the build never evaluates `createClient` (which throws if the env
 * vars aren't present). The client is only needed in the browser on submit.
 */
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase env vars missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  client = createClient(url, anonKey);
  return client;
}
