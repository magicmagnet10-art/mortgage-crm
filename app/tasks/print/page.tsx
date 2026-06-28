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

  const lastByClientBank: Record<string, Record<string, { content: string; is_task: boolean; done_at: string | null; remind_at: string | null }>> = {};
  (allEntries ?? []).forEach((e) => {
    if (!activeIds.has(e.client_id)) return;
    if (!lastByClientBank[e.client_id]) lastByClientBank[e.client_id] = {};
    if (!lastByClientBank[e.client_id][e.bank_name]) {
      lastByClientBank[e.client_id][e.bank_name] = {
        content: e.content, is_task: e.is_task, done_at: e.done_at, remind_at: e.remind_at,
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
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
        body { background: #f8fafc; font-family: 'Helvetica Neue', Arial, sans-serif; }
      `}</style>

      <div dir="rtl" style={{ maxWidth: 800, margin: "0 auto", padding: 24, fontFamily: "Arial, sans-serif", direction: "rtl" }}>

        {/* כפתורים - נסתרים בהדפסה */}
        <div className="no-print" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#f1f5f9", color: "#475569", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
            ← חזרה למערכת
          </Link>
          <PrintButton />
        </div>

        {/* כותרת */}
        <div style={{ borderBottom: "3px solid #1e40af", paddingBottom: 12, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "#1e40af", margin: 0 }}>📋 סטטוס משימות</h1>
            <p style={{ fontSize: 14, color: "#6b7280", margin: "4px 0 0" }}>{today}</p>
          </div>
          <p style={{ fontSize: 13, color: "#6b7280" }}>{clientsWithEntries.length} לקוחות · {totalEntries} רשומות</p>
        </div>

        {/* תוכן */}
        {clientsWithEntries.length === 0 ? (
          <p style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af", fontSize: 16 }}>אין רשומות עדיין 🎉</p>
        ) : (
          clientsWithEntries.map((client) => {
            const clientBanks = allSections.filter((bank) => lastByClientBank[client.id]?.[bank]);
            return (
              <div key={client.id} style={{ marginBottom: 18, pageBreakInside: "avoid" }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#1e40af", background: "#eff6ff", padding: "6px 12px", borderRadius: 6, marginBottom: 4 }}>
                  {client.full_name}
                </div>
                {clientBanks.map((bank) => {
                  const entry = lastByClientBank[client.id][bank];
                  const color = BANK_COLORS[bank]?.titleColor ?? "#4b5563";
                  return (
                    <div key={bank} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "6px 12px", borderBottom: "1px solid #f3f4f6" }}>
                      <div style={{ width: 16, height: 16, border: "2px solid #9ca3af", borderRadius: 3, marginTop: 2, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, fontWeight: 700, minWidth: 90, flexShrink: 0, marginTop: 2, color }}>{bank}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, color: "#1f2937", margin: 0, lineHeight: 1.5 }}>
                          {entry.is_task && !entry.done_at && (
                            <span style={{ fontSize: 10, fontWeight: 700, background: "#f3e8ff", color: "#7c3aed", padding: "1px 6px", borderRadius: 10, marginLeft: 6 }}>משימה</span>
                          )}
                          {entry.done_at && <span style={{ fontSize: 10, color: "#16a34a", marginLeft: 4 }}>✓ </span>}
                          {entry.content}
                        </p>
                        {entry.is_task && entry.remind_at && !entry.done_at && (
                          <p style={{ fontSize: 11, color: "#7c3aed", margin: "2px 0 0" }}>
                            🔔 {new Date(entry.remind_at).toLocaleString("he-IL", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })
        )}

        <div style={{ marginTop: 30, borderTop: "1px solid #e5e7eb", paddingTop: 10, fontSize: 11, color: "#9ca3af", textAlign: "center" }}>
          נריה כהן | יועץ משכנתאות · {today}
        </div>
      </div>
    </>
  );
}
