import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  // Find due reminders not yet sent
  const { data: dueEntries } = await supabase
    .from("bank_log_entries")
    .select("id, content, client_id, clients(full_name)")
    .eq("bank_name", "משימות לקוח")
    .lte("remind_at", new Date().toISOString())
    .is("reminded_at", null);

  if (!dueEntries || dueEntries.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  // Get all push subscriptions
  const { data: subs } = await supabase.from("push_subscriptions").select("*");
  if (!subs || subs.length === 0) {
    return NextResponse.json({ sent: 0, reason: "no subscriptions" });
  }

  let sent = 0;
  for (const entry of dueEntries) {
    const client = (Array.isArray(entry.clients) ? entry.clients[0] : entry.clients) as { full_name: string } | null;
    const payload = JSON.stringify({
      title: `משימה: ${client?.full_name ?? ""}`,
      body: entry.content,
    });

    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        sent++;
      } catch {}
    }

    // Mark as reminded
    await supabase
      .from("bank_log_entries")
      .update({ reminded_at: new Date().toISOString() })
      .eq("id", entry.id);
  }

  return NextResponse.json({ sent });
}
