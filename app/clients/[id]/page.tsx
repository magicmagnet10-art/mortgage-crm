import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BANKS, TASK_SECTION, BANK_COLORS } from "@/lib/constants";
import { BankLogEntry } from "@/lib/types";
import BankSection from "@/components/BankSection";
import EditClientDialog from "@/components/EditClientDialog";
import ArchiveButton from "@/components/ArchiveButton";
import ClientActions from "@/components/ClientActions";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (!client) notFound();

  const { data: entries } = await supabase
    .from("bank_log_entries")
    .select("*")
    .eq("client_id", id)
    .order("created_at", { ascending: true });

  const entriesByBank: Record<string, BankLogEntry[]> = {};
  [TASK_SECTION, ...BANKS].forEach((bank) => {
    entriesByBank[bank] = (entries ?? []).filter((e) => e.bank_name === bank);
  });

  // כל המשימות הפתוחות מכל הבנקים
  const allTasks = (entries ?? []).filter((e) => e.is_task && !e.done_at);

  return (
    <main className="min-h-screen bg-slate-50" dir="rtl">
      {/* Top bar */}
      <div className="sticky top-0 z-10" style={{ background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)" }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold text-white transition-colors shrink-0"
          >
            ← חזרה
          </Link>
          <Image src="/logo.png" alt="NSC" width={36} height={36} className="rounded-full shrink-0" />
          <h1 className="text-sm font-black text-white truncate">{client.full_name}</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {/* Client Header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div />
            <ClientActions client={client} />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">תעודת זהות</p>
              <p className="font-medium text-gray-800">{client.id_number}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">טלפון</p>
              <p className="font-medium text-gray-800 mb-1">{client.phone}</p>
              <div className="flex gap-2">
                <a
                  href={`https://wa.me/${client.phone.replace(/\D/g, "").replace(/^0/, "972")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-2 py-1 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 font-medium"
                >
                  📱 וואטסאפ
                </a>
                <a
                  href={`tel:${client.phone}`}
                  className="text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium"
                >
                  📞 חיוג
                </a>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">סכום משכנתא</p>
              <p className="font-medium text-gray-800">
                {formatCurrency(client.mortgage_amount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">שווי נכס</p>
              <p className="font-medium text-gray-800">
                {formatCurrency(client.property_value)}
              </p>
            </div>
            {client.project_number && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">מספר פרויקט</p>
                <p className="font-medium text-gray-800">{client.project_number}</p>
              </div>
            )}
            {client.residence && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">מגורים</p>
                <p className="font-medium text-gray-800">{client.residence}</p>
              </div>
            )}
            {client.equity != null && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">הון עצמי</p>
                <p className="font-medium text-gray-800">
                  {formatCurrency(client.equity)}
                </p>
              </div>
            )}
            {client.payment != null && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">תשלום</p>
                <p className="font-medium text-gray-800">{formatCurrency(client.payment)}</p>
              </div>
            )}
            {client.next_payment_date && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">תאריך תשלום קרוב</p>
                <p className="font-medium text-blue-700">
                  📅 {new Date(client.next_payment_date).toLocaleDateString("he-IL")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* סיכום כל המשימות */}
        {allTasks.length > 0 && (
          <div className="bg-white rounded-xl border-2 border-purple-200 p-4 mb-4 shadow-sm">
            <h2 className="text-sm font-semibold text-purple-700 mb-3">📋 משימות פתוחות</h2>
            <div className="flex flex-col divide-y divide-gray-100">
              {allTasks.map((task) => {
                const colors = BANK_COLORS[task.bank_name] ?? { titleColor: "#4b5563" };
                return (
                  <div key={task.id} className="py-2 flex items-start gap-3">
                    <span
                      className="text-xs font-semibold shrink-0 mt-0.5 min-w-[90px]"
                      style={{ color: colors.titleColor }}
                    >
                      {task.bank_name}
                    </span>
                    <p className="text-sm text-gray-700 flex-1">{task.content}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tasks */}
        <div className="mb-4">
          <BankSection
            key={TASK_SECTION}
            bank={TASK_SECTION}
            clientId={id}
            entries={entriesByBank[TASK_SECTION]}
          />
        </div>

        {/* Banks */}
        <h2 className="text-base font-bold text-gray-500 mb-3 px-1">
          משא ומתן מול בנקים
        </h2>
        <div className="grid gap-3">
          {BANKS.map((bank) => (
            <BankSection
              key={bank}
              bank={bank}
              clientId={id}
              entries={entriesByBank[bank]}
            />
          ))}
        </div>
      </div>
    </main>
  );

}
