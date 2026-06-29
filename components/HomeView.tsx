"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Client, Lead } from "@/lib/types";
import ClientCard from "@/components/ClientCard";
import LeadCard from "@/components/LeadCard";
import AddClientDialog from "@/components/AddClientDialog";
import AddLeadDialog from "@/components/AddLeadDialog";
import { BANKS, TASK_SECTION, BANK_COLORS } from "@/lib/constants";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";

type Tab = "active" | "hold" | "leads" | "status" | "archive";

export default function HomeView({
  active,
  onHold,
  archived,
  leads,
  tasksByClient,
  lastByClientBank,
  allClients,
}: {
  active: Client[];
  onHold: Client[];
  archived: Client[];
  leads: Lead[];
  tasksByClient: Record<string, Array<{ bank_name: string; content: string }>>;
  lastByClientBank: Record<string, Record<string, string>>;
  allClients: Client[];
}) {
  const [tab, setTab] = useState<Tab>("active");
  const router = useRouter();

  // חיפוש לקוח
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // הוספת משימה מהסטטוס
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskClient, setTaskClient] = useState("");
  const [taskBank, setTaskBank] = useState(TASK_SECTION);
  const [taskText, setTaskText] = useState("");
  const [taskRemind, setTaskRemind] = useState("");
  const [taskLoading, setTaskLoading] = useState(false);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskClient || !taskText.trim()) return;
    setTaskLoading(true);
    const supabase = createSupabaseClient();
    await supabase.from("bank_log_entries").insert({
      client_id: taskClient,
      bank_name: taskBank,
      content: taskText.trim(),
      is_task: true,
      ...(taskRemind ? { remind_at: new Date(taskRemind).toISOString() } : {}),
    });
    setTaskLoading(false);
    setTaskText(""); setTaskRemind(""); setTaskClient(""); setShowAddTask(false);
    router.refresh();
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const allSections = [TASK_SECTION, ...BANKS];
  const clientsWithEntries = active.filter(
    (c) => lastByClientBank[c.id] && Object.keys(lastByClientBank[c.id]).length > 0
  );

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "active", label: "פעילים", count: active.length },
    { id: "hold", label: "המתנה", count: onHold.length },
    { id: "leads", label: "לידים", count: leads.length },
    { id: "status", label: "משימות", count: clientsWithEntries.length },
    { id: "archive", label: "ארכיון", count: archived.length },
  ];

  const tabColors: Record<Tab, string> = {
    active: "text-blue-600",
    hold: "text-amber-600",
    leads: "text-green-600",
    status: "text-purple-600",
    archive: "text-gray-600",
  };

  return (
    <main className="min-h-screen bg-slate-50" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-10" style={{ background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)" }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="NSC" width={40} height={40} className="rounded-full shadow-md" />
            <div>
              <h1 className="text-sm font-black text-white">נריה כהן | יועץ משכנתאות</h1>
              <p className="text-xs text-blue-100">{active.length} לקוחות פעילים</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowSearch((v) => !v); setSearchQuery(""); }}
              className="text-white/80 hover:text-white text-xs px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-1"
            >
              🔍 חיפוש
            </button>
            {tab === "active" && <AddClientDialog />}
            {tab === "leads" && <AddLeadDialog />}
            <button onClick={handleLogout} className="text-white/70 hover:text-white text-xs px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
              יציאה
            </button>
          </div>
        </div>

        {/* Search bar */}
        {showSearch && (
          <div className="max-w-2xl mx-auto px-4 pb-3">
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חפש לקוח לפי שם או ת.ז..."
              className="w-full px-4 py-2 rounded-xl text-sm bg-white/20 text-white placeholder-white/60 border border-white/30 outline-none focus:bg-white/30"
            />
            {searchQuery.trim() && (
              <div className="mt-2 bg-white rounded-xl shadow-lg overflow-hidden">
                {allClients
                  .filter((c) =>
                    c.full_name.includes(searchQuery.trim()) ||
                    c.id_number.includes(searchQuery.trim())
                  )
                  .slice(0, 6)
                  .map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { setShowSearch(false); setSearchQuery(""); router.push(`/clients/${c.id}`); }}
                      className="w-full text-right px-4 py-3 text-sm hover:bg-blue-50 border-b border-gray-50 last:border-0 flex items-center justify-between"
                    >
                      <span className="font-semibold text-gray-800">{c.full_name}</span>
                      <span className="text-gray-400 text-xs">{c.id_number}</span>
                    </button>
                  ))}
                {allClients.filter((c) =>
                  c.full_name.includes(searchQuery.trim()) ||
                  c.id_number.includes(searchQuery.trim())
                ).length === 0 && (
                  <p className="px-4 py-3 text-sm text-gray-400">לא נמצאו תוצאות</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <div className="flex gap-1 bg-white/15 p-1 rounded-xl overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 min-w-fit px-2 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  tab === t.id ? `bg-white ${tabColors[t.id]} shadow` : "text-white/80 hover:bg-white/10"
                }`}
              >
                {t.label} ({t.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">

        {/* פעילים */}
        {tab === "active" && (
          active.length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              <p className="text-xl">אין לקוחות עדיין</p>
              <p className="text-sm mt-2">לחץ על &quot;לקוח חדש&quot; כדי להתחיל</p>
            </div>
          ) : (
            <div className="grid gap-2.5">
              {active.map((client) => (
                <ClientCard key={client.id} client={client} tasks={tasksByClient[client.id] ?? []} lastByBank={lastByClientBank[client.id] ?? {}} />
              ))}
            </div>
          )
        )}

        {/* המתנה */}
        {tab === "hold" && (
          onHold.length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              <p className="text-xl">אין לקוחות בהמתנה</p>
            </div>
          ) : (
            <div className="grid gap-2.5">
              {onHold.map((client) => (
                <ClientCard key={client.id} client={client} tasks={tasksByClient[client.id] ?? []} lastByBank={lastByClientBank[client.id] ?? {}} />
              ))}
            </div>
          )
        )}

        {/* לידים */}
        {tab === "leads" && (
          leads.length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              <p className="text-xl">אין לידים עדיין</p>
              <p className="text-sm mt-2">לחץ על &quot;ליד חדש&quot; כדי להוסיף</p>
            </div>
          ) : (
            <div className="grid gap-2.5">
              {leads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>
          )
        )}

        {/* סטטוס */}
        {tab === "status" && (
          <div className="flex flex-col gap-3">
            {/* כפתור הדפסה */}
            <Link
              href="/tasks/print"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-2xl shadow-sm text-sm font-semibold text-gray-600 hover:bg-gray-50 w-fit"
            >
              🖨️ הדפס משימות לבוקר
            </Link>
            {/* הוספת משימה */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                onClick={() => setShowAddTask((v) => !v)}
                className="w-full px-4 py-3 text-right text-sm font-semibold text-purple-700 flex items-center gap-2"
              >
                <span className="text-lg">+</span> הוסף משימה ללקוח
              </button>
              {showAddTask && (
                <form onSubmit={handleAddTask} className="px-4 pb-4 flex flex-col gap-3 border-t border-gray-50">
                  <div className="flex flex-col gap-1 pt-3">
                    <label className="text-xs text-gray-500">לקוח</label>
                    <select
                      value={taskClient}
                      onChange={(e) => setTaskClient(e.target.value)}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      required
                    >
                      <option value="">בחר לקוח...</option>
                      {allClients.map((c) => (
                        <option key={c.id} value={c.id}>{c.full_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">בנק / קטגוריה</label>
                    <select
                      value={taskBank}
                      onChange={(e) => setTaskBank(e.target.value)}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    >
                      {allSections.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">תוכן המשימה</label>
                    <textarea
                      rows={2}
                      value={taskText}
                      onChange={(e) => setTaskText(e.target.value)}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">תזכורת (אופציונלי)</label>
                    <input
                      type="datetime-local"
                      value={taskRemind}
                      onChange={(e) => setTaskRemind(e.target.value)}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={taskLoading}
                    className="bg-purple-600 text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-50"
                  >
                    {taskLoading ? "שומר..." : "הוסף משימה"}
                  </button>
                </form>
              )}
            </div>

            {clientsWithEntries.length === 0 ? (
              <div className="text-center py-16 text-gray-400">אין רשומות עדיין</div>
            ) : (
              clientsWithEntries.map((client) => {
                const clientBanks = allSections.filter((bank) => lastByClientBank[client.id]?.[bank]);
                return (
                  <div key={client.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <Link href={`/clients/${client.id}`} className="block px-4 py-3 border-b border-gray-50 hover:bg-gray-50 flex items-center justify-between">
                      <span className="font-bold text-blue-700">{client.full_name}</span>
                      <span className="text-xs text-gray-400">{client.id_number}</span>
                    </Link>
                    <div className="divide-y divide-gray-50">
                      {clientBanks.map((bank) => {
                        const colors = BANK_COLORS[bank] ?? { titleColor: "#4b5563" };
                        return (
                          <div key={bank} className="px-4 py-2.5 flex items-start gap-3">
                            <span className="text-xs font-bold shrink-0 mt-0.5 min-w-[85px]" style={{ color: colors.titleColor }}>{bank}</span>
                            <p className="text-sm text-gray-500 line-clamp-1 flex-1">{lastByClientBank[client.id][bank]}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ארכיון */}
        {tab === "archive" && (
          archived.length === 0 ? (
            <div className="text-center py-24 text-gray-400"><p className="text-xl">אין לקוחות בארכיון</p></div>
          ) : (
            <div className="grid gap-2.5">
              {archived.map((client) => (
                <ClientCard key={client.id} client={client} tasks={tasksByClient[client.id] ?? []} lastByBank={lastByClientBank[client.id] ?? {}} />
              ))}
            </div>
          )
        )}
      </div>
    </main>
  );
}
