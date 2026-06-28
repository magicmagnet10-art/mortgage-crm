import { createClient } from "@/lib/supabase/server";
import { BANKS, TASK_SECTION, BANK_COLORS } from "@/lib/constants";

export default async function PrintTasksPage() {
  const supabase = await createClient();

  const today = new Date().toLocaleDateString("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const { data: tasks } = await supabase
    .from("bank_log_entries")
    .select("*, clients(full_name)")
    .eq("is_task", true)
    .is("done_at", null)
    .order("created_at", { ascending: true });

  // Group by client
  const byClient: Record<string, { clientName: string; tasks: typeof tasks }> = {};
  (tasks ?? []).forEach((t) => {
    const clientName = (t.clients as { full_name: string } | null)?.full_name ?? "לא ידוע";
    if (!byClient[t.client_id]) byClient[t.client_id] = { clientName, tasks: [] };
    byClient[t.client_id].tasks!.push(t);
  });

  const clients = Object.values(byClient);
  const totalTasks = tasks?.length ?? 0;

  return (
    <html lang="he" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <title>משימות יומיות — {today}</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Helvetica Neue', Arial, sans-serif; background: white; color: #111; direction: rtl; }
          .screen-only { display: block; }
          @media print {
            .screen-only { display: none !important; }
            body { font-size: 12px; }
          }
          .page { max-width: 800px; margin: 0 auto; padding: 24px; }
          .header { border-bottom: 3px solid #1e40af; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
          .header h1 { font-size: 22px; font-weight: 900; color: #1e40af; }
          .header .date { font-size: 14px; color: #6b7280; }
          .header .count { font-size: 13px; color: #6b7280; }
          .client-block { margin-bottom: 20px; page-break-inside: avoid; }
          .client-name { font-size: 15px; font-weight: 800; color: #1e40af; background: #eff6ff; padding: 6px 12px; border-radius: 6px; margin-bottom: 8px; }
          .task-row { display: flex; align-items: flex-start; gap: 10px; padding: 7px 12px; border-bottom: 1px solid #f3f4f6; }
          .task-row:last-child { border-bottom: none; }
          .checkbox { width: 16px; height: 16px; border: 2px solid #9ca3af; border-radius: 3px; shrink: 0; margin-top: 2px; flex-shrink: 0; }
          .bank-label { font-size: 11px; font-weight: 700; min-width: 90px; flex-shrink: 0; margin-top: 2px; }
          .task-content { font-size: 13px; color: #1f2937; flex: 1; line-height: 1.5; }
          .remind { font-size: 11px; color: #7c3aed; margin-top: 2px; }
          .footer { margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 10px; font-size: 11px; color: #9ca3af; text-align: center; }
          .print-btn { position: fixed; bottom: 24px; left: 24px; background: #1e40af; color: white; border: none; padding: 12px 24px; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
          .print-btn:hover { background: #1d4ed8; }
          .empty { text-align: center; padding: 60px 0; color: #9ca3af; font-size: 16px; }
        `}</style>
      </head>
      <body>
        <div className="page">
          <div className="header">
            <div>
              <h1>📋 משימות יומיות</h1>
              <p className="date">{today}</p>
            </div>
            <p className="count">{totalTasks} משימות פתוחות</p>
          </div>

          {clients.length === 0 ? (
            <p className="empty">אין משימות פתוחות 🎉</p>
          ) : (
            clients.map(({ clientName, tasks: clientTasks }) => (
              <div key={clientName} className="client-block">
                <div className="client-name">{clientName}</div>
                {(clientTasks ?? []).map((task) => {
                  const color = BANK_COLORS[task.bank_name]?.titleColor ?? "#4b5563";
                  return (
                    <div key={task.id} className="task-row">
                      <div className="checkbox" />
                      <span className="bank-label" style={{ color }}>{task.bank_name}</span>
                      <div className="flex-1">
                        <p className="task-content">{task.content}</p>
                        {task.remind_at && (
                          <p className="remind">🔔 {new Date(task.remind_at).toLocaleString("he-IL", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}

          <div className="footer">
            נריה כהן | יועץ משכנתאות &nbsp;·&nbsp; הודפס {today}
          </div>
        </div>

        <button className="print-btn screen-only" onClick="window.print()">🖨️ הדפס</button>
      </body>
    </html>
  );
}
