"use client";

import { useState } from "react";
import Link from "next/link";
import { Client } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { BANK_COLORS } from "@/lib/constants";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ClientCard({
  client,
  tasks = [],
  lastByBank = {},
}: {
  client: Client;
  tasks?: Array<{ bank_name: string; content: string }>;
  lastByBank?: Record<string, string>;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border border-gray-100 rounded-2xl transition-all hover:shadow-md shadow-sm overflow-hidden">
      <CardContent className="p-0">
        {/* שורה ראשית */}
        <div className="flex items-stretch">
          <Link
            href={`/clients/${client.id}`}
            className="flex items-center gap-3 flex-1 min-w-0 px-4 py-3.5"
          >
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-sm font-black text-blue-600">
                {client.full_name.charAt(0)}
              </span>
            </div>
            <div className="min-w-0">
              <span className="text-sm font-bold text-gray-900 truncate block">
                {client.full_name}
              </span>
              <span className="text-xs text-gray-400">ת.ז: {client.id_number}</span>
            </div>
          </Link>

          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center justify-center w-11 text-gray-300 text-sm hover:text-gray-500 active:bg-gray-50 shrink-0"
            aria-label={expanded ? "כווץ" : "הרחב"}
          >
            {expanded ? "▲" : "▼"}
          </button>
        </div>

        {/* תוכן מורחב */}
        {expanded && (
          <div className="border-t border-gray-100">
            {/* משימות פתוחות */}
            {tasks.length > 0 && (
              <div>
                <p className="px-4 pt-2.5 pb-1 text-xs font-bold text-purple-600">📋 משימות פתוחות</p>
                <div className="divide-y divide-gray-50">
                  {tasks.map((t, i) => {
                    const colors = BANK_COLORS[t.bank_name] ?? { titleColor: "#4b5563" };
                    return (
                      <div key={i} className="px-4 py-2 flex items-start gap-2">
                        <span className="text-xs font-semibold shrink-0 mt-0.5 min-w-[80px]" style={{ color: colors.titleColor }}>{t.bank_name}</span>
                        <p className="text-xs text-gray-700 line-clamp-2 flex-1">{t.content}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* הערה אחרונה מכל בנק */}
            {Object.keys(lastByBank).length > 0 && (
              <div className={tasks.length > 0 ? "border-t border-gray-100" : ""}>
                <p className="px-4 pt-2.5 pb-1 text-xs font-bold text-blue-500">🏦 סטטוס בנקים</p>
                <div className="divide-y divide-gray-50">
                  {Object.entries(lastByBank).map(([bank, content]) => {
                    const colors = BANK_COLORS[bank] ?? { titleColor: "#4b5563" };
                    return (
                      <div key={bank} className="px-4 py-2 flex items-start gap-2">
                        <span className="text-xs font-semibold shrink-0 mt-0.5 min-w-[80px]" style={{ color: colors.titleColor }}>{bank}</span>
                        <p className="text-xs text-gray-500 line-clamp-2 flex-1">{content}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {tasks.length === 0 && Object.keys(lastByBank).length === 0 && (
              <p className="px-4 py-3 text-xs text-gray-400">אין רשומות עדיין</p>
            )}

            {/* פרטי לקוח */}
            <div className="px-4 pb-3 pt-2 border-t border-gray-100 flex flex-col gap-1.5">
              <a
                href={`https://wa.me/${client.phone.replace(/\D/g, "").replace(/^0/, "972")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-600 hover:underline flex items-center gap-1 w-fit"
              >
                📱 {client.phone}
              </a>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <p className="text-xs text-gray-600">
                  <span className="font-medium">משכנתא:</span>{" "}
                  {formatCurrency(client.mortgage_amount)}
                </p>
                <p className="text-xs text-gray-600">
                  <span className="font-medium">שווי נכס:</span>{" "}
                  {formatCurrency(client.property_value)}
                </p>
                {client.equity != null && (
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">הון עצמי:</span>{" "}
                    {formatCurrency(client.equity)}
                  </p>
                )}
                {client.payment != null && (
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">תשלום:</span>{" "}
                    {formatCurrency(client.payment)}
                  </p>
                )}
                {client.residence && (
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">מגורים:</span> {client.residence}
                  </p>
                )}
                {client.project_number && (
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">פרויקט:</span> {client.project_number}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
