import { createClient } from "@/lib/supabase/server";
import { BANK_COLORS, BANKS, TASK_SECTION } from "@/lib/constants";
import PrintButton from "./PrintButton";
import Link from "next/link";

const allSections = [TASK_SECTION, ...BANKS];

export default async function PrintTasksPage() {
  const supabase = await createClient();

  const today = new Date().toLocaleDateString("he-IL", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const [{ data: clients }, { data: allEntries }] = await Promise.all([
    supabase.from("clients").select("id, full_name, archived_at, on_hold_at"),
    supabase.from("bank_log_entries")
      .select("client_id, bank_name, content, is_task, done_at, remind_at, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const activeClients = (clients ?? []).filter((c) => !c.archived_at && !c.on_hold_at);
  const activeIds = new Set(activeClients.map((c) => c.id));

  // Last entry per client per bank (same logic as status tab)
  const lastByClientBank: Record<string, Record<string, { content: string; is_task: boolean; done_at: string | null; remind_at: string | null }>> = {};
  (allEntries ?? []).forEach((e) => {
    if (!activeIds.has(e.client_id)) return;
    if (!lastByClientBank[e.client_id]) lastByClientBank[e.client_id] = {};
    if (!lastByClientBank[e.client_id][e.bank_name]) {
      lastByClientBank[e.client_id][e.bank_name] = {
        content: e.content,
        is_task: e.is_task,
        done_at: e.done_at,
        remind_at: e.remind_at,
      };
    }
  });

  const clientsWithEntries = activeClients.filter(
    (c) => lastByClientBank[c.id] && Object.keys(lastByClientBank[c.id]).length > 0
  );

  const totalEntries = clientsWithEntries.reduce(
    (sum, c) => sum + Object.keys(lastByClientBank[c.id]).length, 0
  );

  return (
    <html lang="he" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <title>סטטוס משימות — {today}</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Helvetica Neue', Arial, sans-serif; background: white; color: #111; direction: rtl; }
          .screen-only { display: flex; }
          @media print {
            .screen-only { display: none !important; }
            body { font-size: 12px; }
          }
          .page { max-width: 800px; margin: 0 auto; padding: 24px; }
          .header { border-bottom: 3px solid #1e40af; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
          .header h1 { font-size: 22px; font-weight: 900; color: #1e40af; }
          .header .date { font-size: 14px; color: #6b7280; }
          .header .count { font-size: 13px; color: #6b7280; }
          .client-block { margin-bottom: 18px; page-break-inside: avoid; }
          .client-name { font-size: 15px; font-weight: 800; color: #1e40af; background: #eff6ff; padding: 6px 12px; border-radius: 6px; margin-bottom: 4px; }
          .entry-row { display: flex; align-items: flex-start; gap: 10px; padding: 6px 12px; border-bottom: 1px solid #f3f4f6; }
          .entry-row:last-child { border-bottom: none; }
          .checkbox { width: 16px; height: 16px; border: 2px solid #9ca3af; border-radius: 3px; margin-top: 2px; flex-shrink: 0; }
          .bank-label { font-size: 11px; font-weight: 700; min-width: 90px; flex-shrink: 0; margin-top: 2px; }
          .entry-content { font-size: 13px; color: #1f2937; flex: 1; line-height: 1.5; }
          .task-badge { font-size: 10px; font-weight: 700; background: #f3e8ff; color: #7c3aed; padding: 1px 6px; border-radius: 10px; margin-right: 6px; }
          .done-badge { font-size: 10px; color: #16a34a; margin-right: 4px; }
          .remind { font-size: 11px; color: #7c3aed; margin-top: 2px; }
          .footer { margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 10px; font-size: 11px; color: #9ca3af; text-align: center; }
          .empty { text-align: center; padding: 60px 0; color: #9ca3af; font-size: 16px; }
          .back-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: #f1f5f9; color: #475569; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none; }
          .back-btn:hover { background: #e2e8f0; }
        `}</style>
      </head>
      <body>
        <div className="page">
          <div className="screen-only" style={{ marginBottom: "16px" }}>
            <Link href="/?tab=status" className="back-btn">← חזרה למערכת</Link>
          </div>

          <div className="header">
            <div>
              <h1>📋 סטטוס משימות</h1>
              <p className="date">{today}</p>
            </div>
            <p className="count">{clientsWithEntries.length} לקוחות · {totalEntries} רשומות</p>
          </div>

          {clientsWithEntries.length === 0 ? (
            <p className="empty">אין רשומות עדיין 🎉</p>
          ) : (
            clientsWithEntries.map((client) => {
              const clientBanks = allSections.filter((bank) => lastByClientBank[client.id]?.[bank]);
              return (
                <div key={client.id} className="client-block">
                  <div className="client-name">{client.full_name}</div>
                  {clientBanks.map((bank) => {
                    const entry = lastByClientBank[client.id][bank];
                    const color = BANK_COLORS[bank]?.titleColor ?? "#4b5563";
                    return (
                      <div key={bank} className="entry-row">
                        <div className="checkbox" />
                        <span className="bank-label" style={{ color }}>{bank}</span>
                        <div style={{ flex: 1 }}>
                          <p className="entry-content">
                            {entry.is_task && !entry.done_at && <span className="task-badge">משימה</span>}
                            {entry.done_at && <span className="done-badge">✓</span>}
                            {entry.content}
                          </p>
                          {entry.is_task && entry.remind_at && !entry.done_at && (
                            <p className="remind">🔔 {new Date(entry.remind_at).toLocaleString("he-IL", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}

          <div className="footer">
            נריה כהן | יועץ משכנתאות &nbsp;·&nbsp; הודפס {today}
          </div>
        </div>

        <PrintButton />
      </body>
    </html>
  );
}
