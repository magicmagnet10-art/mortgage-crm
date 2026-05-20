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
    <main className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">CRM משכנתאות</h1>
          {tab === "active" && <AddClientDialog />}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("active")}
            className={`flex-1 px-3 py-3 rounded-lg text-sm font-semibold transition-colors ${
              tab === "active"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            פעילים ({active.length})
          </button>
          <button
            onClick={() => setTab("status")}
            className={`flex-1 px-3 py-3 rounded-lg text-sm font-semibold transition-colors ${
              tab === "status"
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            סטטוס ({clientsWithEntries.length})
          </button>
          <button
            onClick={() => setTab("archive")}
            className={`flex-1 px-3 py-3 rounded-lg text-sm font-semibold transition-colors ${
              tab === "archive"
                ? "bg-gray-700 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            ארכיון ({archived.length})
          </button>
        </div>

        {/* Status tab */}
        {tab === "status" && (
          <div className="flex flex-col gap-4">
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
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
                  >
                    <Link
                      href={`/clients/${client.id}`}
                      className="block px-5 py-3 bg-gray-50 border-b border-gray-100 hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-semibold text-blue-700 text-base">
                        {client.full_name}
                      </span>
                    </Link>
                    <div className="divide-y divide-gray-50">
                      {clientBanks.map((bank) => {
                        const colors = BANK_COLORS[bank] ?? { titleColor: "#4b5563" };
                        return (
                          <div key={bank} className="px-5 py-3 flex items-start gap-3">
                            <span
                              className="text-xs font-semibold shrink-0 mt-0.5 min-w-[90px]"
                              style={{ color: colors.titleColor }}
                            >
                              {bank}
                            </span>
                            <p className="text-sm text-gray-600 line-clamp-1 flex-1">
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
            <div className="grid gap-2">
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
