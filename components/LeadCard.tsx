"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lead } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(amount);
}

export default function LeadCard({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`למחוק את הליד של ${lead.full_name}?`)) return;
    const supabase = createClient();
    await supabase.from("leads").delete().eq("id", lead.id);
    router.refresh();
  };

  return (
    <Card className="border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-stretch">
          <Link href={`/leads/${lead.id}`} className="flex items-center gap-3 flex-1 min-w-0 px-4 py-3.5">
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <span className="text-sm font-black text-amber-600">{lead.full_name.charAt(0)}</span>
            </div>
            <div className="min-w-0">
              <span className="text-sm font-bold text-gray-900 truncate block">{lead.full_name}</span>
              {lead.source && <span className="text-xs text-gray-400">מ: {lead.source}</span>}
            </div>
          </Link>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center justify-center w-11 text-gray-300 text-sm shrink-0"
          >
            {expanded ? "▲" : "▼"}
          </button>
        </div>

        {expanded && (
          <div className="border-t border-gray-100 px-4 py-3 flex flex-col gap-2">
            {lead.phone && (
              <a
                href={`https://wa.me/${lead.phone.replace(/\D/g, "").replace(/^0/, "972")}`}
                target="_blank" rel="noopener noreferrer"
                className="text-sm text-green-600 hover:underline w-fit"
              >
                📱 {lead.phone}
              </a>
            )}
            {lead.deal_price && (
              <p className="text-sm text-gray-700"><span className="font-medium">מחיר עסקה:</span> {formatCurrency(lead.deal_price)}</p>
            )}
            {lead.summary && (
              <div>
                <p className="text-xs text-gray-400 mb-1">סיכום שיחה</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{lead.summary}</p>
              </div>
            )}
            <p className="text-xs text-gray-400">{new Date(lead.created_at).toLocaleDateString("he-IL")}</p>
            <button
              onClick={handleDelete}
              className="text-xs text-red-500 hover:text-red-700 self-start mt-1"
            >
              🗑 מחק ליד
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
