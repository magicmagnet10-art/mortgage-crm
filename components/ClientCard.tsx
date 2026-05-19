"use client";

import { useState } from "react";
import Link from "next/link";
import { Client } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ClientCard({ client, lastTask }: { client: Client; lastTask?: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border border-gray-200 transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        {/* שורה ראשית: שם + ת"ז + חץ */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5 min-w-0">
            <Link
              href={`/clients/${client.id}`}
              className="text-lg font-semibold text-blue-700 hover:underline truncate"
            >
              {client.full_name}
            </Link>
            <p className="text-sm text-gray-500">ת.ז: {client.id_number}</p>
          </div>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-gray-400 text-sm px-2 py-1 hover:text-gray-600 shrink-0 ml-2"
            aria-label={expanded ? "כווץ" : "הרחב"}
          >
            {expanded ? "▲" : "▼"}
          </button>
        </div>

        {/* פרטים מורחבים */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
            <a
              href={`https://wa.me/${client.phone.replace(/\D/g, "").replace(/^0/, "972")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-green-600 hover:underline flex items-center gap-1 w-fit"
            >
              📱 {client.phone}
            </a>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <p className="text-sm text-gray-700">
                <span className="font-medium">משכנתא:</span>{" "}
                {formatCurrency(client.mortgage_amount)}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">שווי נכס:</span>{" "}
                {formatCurrency(client.property_value)}
              </p>
              {client.equity != null && (
                <p className="text-sm text-gray-700">
                  <span className="font-medium">הון עצמי:</span>{" "}
                  {formatCurrency(client.equity)}
                </p>
              )}
              {client.payment != null && (
                <p className="text-sm text-gray-700">
                  <span className="font-medium">תשלום:</span>{" "}
                  {formatCurrency(client.payment)}
                </p>
              )}
              {client.residence && (
                <p className="text-sm text-gray-700">
                  <span className="font-medium">מגורים:</span> {client.residence}
                </p>
              )}
              {client.project_number && (
                <p className="text-sm text-gray-700">
                  <span className="font-medium">פרויקט:</span> {client.project_number}
                </p>
              )}
            </div>
            <p className="text-xs text-gray-400">
              {new Date(client.created_at).toLocaleDateString("he-IL")}
            </p>
          </div>
        )}

        {/* משימה אחרונה */}
        {lastTask && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-start gap-2">
            <span className="text-xs font-medium text-purple-600 shrink-0 mt-0.5">משימה:</span>
            <p className="text-xs text-gray-600 line-clamp-1">{lastTask}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
