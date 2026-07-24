import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";
const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") || "https://soon.is";
const ALLOWED_ORIGINS = [
  ALLOWED_ORIGIN,
  "https://www.soonhackathon.ca",
  "https://soonhackathon.ca"
];
// Local dev servers use whatever port is free (Next picks 3000/3001/3003…, Vite
// 5173), so match any localhost/127.0.0.1 origin by pattern instead of listing
// ports. Production origins still require an exact allowlist match above.
const LOCALHOST_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
function getCorsHeaders(req) {
  const origin = req.headers.get("Origin") || "";
  const isAllowed = ALLOWED_ORIGINS.includes(origin) || LOCALHOST_ORIGIN.test(origin);
  const allowedOrigin = isAllowed ? origin : ALLOWED_ORIGIN;
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-user-token"
  };
}
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: getCorsHeaders(req)
    });
  }
  try {
    const { name, company, email, availability } = await req.json();
    if (!name || !company || !email) {
      return new Response(JSON.stringify({
        error: "name, company, and email are required"
      }), {
        status: 400,
        headers: {
          ...getCorsHeaders(req),
          "Content-Type": "application/json"
        }
      });
    }
    const serviceClient = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
    // Insert the meeting request
    const { error: insertErr } = await serviceClient.from("sponsor_meetings").insert([
      {
        name,
        company,
        email,
        availability
      }
    ]);
    if (insertErr) {
      console.error("insert error:", insertErr);
    }
    // Get notification emails from settings
    const { data: setting } = await serviceClient.from("site_settings").select("value").eq("key", "meeting_notification_emails").maybeSingle();
    const recipients = setting?.value || [
      "uoft.soon@gmail.com",
      "huuanducle@gmail.com"
    ];
    if (recipients.length === 0) {
      return new Response(JSON.stringify({
        ok: true
      }), {
        headers: {
          ...getCorsHeaders(req),
          "Content-Type": "application/json"
        }
      });
    }
    // Send notification email via Resend
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "SOON Team <no-reply@soonhackathon.ca>";
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured — skipping notification");
      return new Response(JSON.stringify({
        ok: true,
        email_sent: false
      }), {
        headers: {
          ...getCorsHeaders(req),
          "Content-Type": "application/json"
        }
      });
    }
    const subject = `New meeting request from ${name} (${company})`;
    const html = `
      <div style="font-family: sans-serif; color: #1a1a1a; max-width: 520px;">
        <p style="font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px;">
          New Meeting Request
        </p>
        <table style="font-size: 14px; line-height: 1.7; border-collapse: collapse;">
          <tr><td style="padding: 4px 16px 4px 0; color: #888;">Name</td><td>${name}</td></tr>
          <tr><td style="padding: 4px 16px 4px 0; color: #888;">Company</td><td>${company}</td></tr>
          <tr><td style="padding: 4px 16px 4px 0; color: #888;">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding: 4px 16px 4px 0; color: #888;">Availability</td><td>${availability || "Not specified"}</td></tr>
        </table>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="font-size: 12px; color: #aaa;">
          Sent from the SOON sponsor page.
        </p>
      </div>
    `;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: recipients,
        reply_to: email,
        subject,
        html
      })
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("Resend error:", data);
    }
    return new Response(JSON.stringify({
      ok: true,
      email_sent: res.ok
    }), {
      headers: {
        ...getCorsHeaders(req),
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    console.error("notify-meeting error:", err);
    return new Response(JSON.stringify({
      error: err.message
    }), {
      status: 500,
      headers: {
        ...getCorsHeaders(req),
        "Content-Type": "application/json"
      }
    });
  }
});
