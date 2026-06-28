import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { BANK_COLORS } from "@/lib/constants";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  const { data: tasks } = await supabase
    .from("bank_log_entries")
    .select("*, clients(full_name)")
    .eq("is_task", true)
    .is("done_at", null)
    .order("created_at", { ascending: true });

  if (!tasks || tasks.length === 0) {
    return NextResponse.json({ sent: false, reason: "no tasks" });
  }

  // Group by client
  const byClient: Record<string, { clientName: string; tasks: typeof tasks }> = {};
  tasks.forEach((t) => {
    const clientName = (t.clients as { full_name: string } | null)?.full_name ?? "לא ידוע";
    if (!byClient[t.client_id]) byClient[t.client_id] = { clientName, tasks: [] };
    byClient[t.client_id].tasks.push(t);
  });

  const today = new Date().toLocaleDateString("he-IL", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const clientsHtml = Object.values(byClient).map(({ clientName, tasks: clientTasks }) => {
    const rows = clientTasks.map((t) => {
      const color = BANK_COLORS[t.bank_name]?.titleColor ?? "#4b5563";
      const remind = t.remind_at
        ? `<br/><span style="font-size:12px;color:#7c3aed;">🔔 ${new Date(t.remind_at).toLocaleString("he-IL", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>`
        : "";
      return `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:12px;font-weight:700;color:${color};min-width:90px;vertical-align:top;">${t.bank_name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#1f2937;">${t.content}${remind}</td>
        </tr>`;
    }).join("");

    return `
      <div style="margin-bottom:20px;">
        <div style="background:#eff6ff;padding:8px 14px;border-radius:6px;margin-bottom:4px;font-size:15px;font-weight:800;color:#1e40af;">${clientName}</div>
        <table style="width:100%;border-collapse:collapse;">
          ${rows}
        </table>
      </div>`;
  }).join("");

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head><meta charset="utf-8"/></head>
    <body style="font-family:Arial,sans-serif;background:#f8fafc;margin:0;padding:20px;direction:rtl;">
      <div style="max-width:620px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:20px 24px;">
          <h1 style="color:white;margin:0;font-size:20px;">📋 משימות יומיות</h1>
          <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:13px;">${today} &nbsp;·&nbsp; ${tasks.length} משימות פתוחות</p>
        </div>
        <div style="padding:20px 24px;">
          ${clientsHtml}
        </div>
        <div style="padding:12px 24px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center;">
          נריה כהן | יועץ משכנתאות
        </div>
      </div>
    </body>
    </html>
  `;

  const { error } = await resend.emails.send({
    from: "NSC CRM <onboarding@resend.dev>",
    to: "neriansc@gmail.com",
    subject: `📋 משימות בוקר — ${today} (${tasks.length} משימות)`,
    html,
  });

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ sent: true, count: tasks.length });
}
