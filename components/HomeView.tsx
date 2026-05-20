"use client";

import { useState } from "react";
import Link from "next/link";
import { Client } from "@/lib/types";
import ClientCard from "@/components/ClientCard";
import AddClientDialog from "@/components/AddClientDialog";
import { BANKS, TASK_SECTION, BANK_COLORS } from "@/lib/constants";

type Tab = "active" | "status" | "archive";

export default function HomeView({
  active,
  archived,
  tasksByClient,
  lastByClientBank,
}: {
  active: Client[];
  archived: Client[];
  tasksByClient: Record<string, Array<{ bank_name: string; content: string }>>;
  lastByClientBank: Record<string, Record<string, string>>;
}) {
  const [tab, setTab] = useState<Tab>("active");

  const allSections = [TASK_SECTION, ...BANKS];

  const clientsWithEntries = active.filter(
    (c) => lastByClientBank[c.id] && Object.keys(lastByClientBank[c.id]).length > 0
  );

  const displayed = tab === "archive" ? archived : active;

  return (
    <main className="min-h-screen bg-slate-50" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-10" style={{ background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)" }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* מקום ללוגו — יוחלף כשהלוגו יועלה */}
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white font-black text-lg">
              מ
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight">CRM משכנתאות</h1>
              <p className="text-xs text-blue-100">{active.length} לקוחות פעילים</p>
            </div>
          </div>
          {tab === "active" && <AddClientDialog />}
        </div>

        {/* Tabs inside header */}
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <div className="flex gap-1.5 bg-white/15 p-1 rounded-xl">
            <button
              onClick={() => setTab("active")}
              className={`flex-1 px-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === "active"
                  ? "bg-white text-blue-600 shadow"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              פעילים ({active.length})
            </button>
            <button
              onClick={() => setTab("status")}
              className={`flex-1 px-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === "status"
                  ? "bg-white text-purple-600 shadow"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              סטטוס ({clientsWithEntries.length})
            </button>
            <button
              onClick={() => setTab("archive")}
              className={`flex-1 px-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === "archive"
                  ? "bg-white text-gray-700 shadow"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              ארכיון ({archived.length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">

        {/* Status tab */}
        {tab === "status" && (
          <div className="flex flex-col gap-3">
            {clientsWithEntries.length === 0 ? (
              <div className="text-center py-24 text-gray-400">
                <p className="text-xl">אין רשומות עדיין</p>
                <p className="text-sm mt-2">הוסף רשומות בכרטיס לקוח</p>
              </div>
            ) : (
              clientsWithEntries.map((client) => {
                const clientBanks = allSections.filter(
                  (bank) => lastByClientBank[client.id]?.[bank]
                );
                return (
                  <div
                    key={client.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <Link
                      href={`/clients/${client.id}`}
                      className="block px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-bold text-blue-700 text-base">
                        {client.full_name}
                      </span>
                    </Link>
                    <div className="divide-y divide-gray-50">
                      {clientBanks.map((bank) => {
                        const colors = BANK_COLORS[bank] ?? { titleColor: "#4b5563" };
                        return (
                          <div key={bank} className="px-4 py-2.5 flex items-start gap-3">
                            <span
                              className="text-xs font-bold shrink-0 mt-0.5 min-w-[85px]"
                              style={{ color: colors.titleColor }}
                            >
                              {bank}
                            </span>
                            <p className="text-sm text-gray-500 line-clamp-1 flex-1">
                              {lastByClientBank[client.id][bank]}
                            </p>
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

        {/* Clients / Archive tab */}
        {tab !== "status" && (
          displayed.length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              <p className="text-xl">
                {tab === "archive" ? "אין לקוחות בארכיון" : "אין לקוחות עדיין"}
              </p>
              {tab === "active" && (
                <p className="text-sm mt-2">לחץ על &quot;לקוח חדש&quot; כדי להתחיל</p>
              )}
            </div>
          ) : (
            <div className="grid gap-2.5">
              {displayed.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  tasks={tasksByClient[client.id] ?? []}
                />
              ))}
            </div>
          )
        )}
      </div>
    </main>
  );
}
