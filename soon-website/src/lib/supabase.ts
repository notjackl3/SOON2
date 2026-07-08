import { createClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client. We only use it to invoke the `notify-meeting` edge
 * function (see the contact form) — that function inserts the sponsor request
 * and emails uoft.soon@gmail.com via Resend. The URL + anon key are public by
 * design; the Resend key stays a server-side secret on the edge function.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
