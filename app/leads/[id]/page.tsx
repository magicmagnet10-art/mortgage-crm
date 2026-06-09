import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lead, LeadLogEntry } from "@/lib/types";
import LeadPageClient from "@/components/LeadPageClient";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function LeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();

  if (!lead) notFound();

  const { data: entries } = await supabase
    .from("lead_log_entries")
    .select("*")
    .eq("lead_id", id)
    .order("created_at", { ascending: true });

  const allTasks = (entries ?? []).filter((e) => e.is_task && !e.done_at);

  return (
    <main className="min-h-screen bg-slate-50" dir="rtl">
      {/* Top bar */}
      <div className="sticky top-0 z-10" style={{ background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)" }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/?tab=leads"
            className="inline-flex items-center gap-1 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold text-white transition-colors shrink-0"
          >
            ← חזרה
          </Link>
          <Image src="/logo.png" alt="NSC" width={36} height={36} className="rounded-full shrink-0" />
          <h1 className="text-sm font-black text-white truncate">{lead.full_name}</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {/* Lead Header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            {lead.phone && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">טלפון</p>
                <a
                  href={`https://wa.me/${lead.phone.replace(/\D/g, "").replace(/^0/, "972")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-green-600 hover:underline flex items-center gap-1 w-fit"
                >
                  📱 {lead.phone}
                </a>
              </div>
            )}
            {lead.source && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">מקור</p>
                <p className="font-medium text-gray-800">{lead.source}</p>
              </div>
            )}
            {lead.deal_price && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">מחיר עסקה</p>
                <p className="font-medium text-gray-800">{formatCurrency(lead.deal_price)}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400 mb-0.5">תאריך הוספה</p>
              <p className="font-medium text-gray-800">{new Date(lead.created_at).toLocaleDateString("he-IL")}</p>
            </div>
          </div>
          {lead.summary && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-1">סיכום שיחה</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{lead.summary}</p>
            </div>
          )}
        </div>

        {/* משימות פתוחות */}
        {allTasks.length > 0 && (
          <div className="bg-white rounded-xl border-2 border-purple-200 p-4 mb-4 shadow-sm">
            <h2 className="text-sm font-semibold text-purple-700 mb-3">📋 משימות פתוחות</h2>
            <div className="flex flex-col divide-y divide-gray-100">
              {allTasks.map((task) => (
                <div key={task.id} className="py-2">
                  <p className="text-sm text-gray-700">{task.content}</p>
                  {task.remind_at && (
                    <p className="text-xs text-purple-500 mt-0.5">🔔 {new Date(task.remind_at).toLocaleString("he-IL", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* הערות ומשימות */}
        <LeadPageClient leadId={id} entries={(entries ?? []) as LeadLogEntry[]} />
      </div>
    </main>
  );
}
