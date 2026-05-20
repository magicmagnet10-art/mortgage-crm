import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BANKS, TASK_SECTION, BANK_COLORS } from "@/lib/constants";
import { BankLogEntry } from "@/lib/types";
import BankSection from "@/components/BankSection";
import EditClientDialog from "@/components/EditClientDialog";
import ArchiveButton from "@/components/ArchiveButton";

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
    <main className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mb-6 py-3 px-1 min-h-[48px]"
        >
          ← חזרה לרשימה
        </Link>

        {/* Client Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {client.full_name}
            </h1>
            <div className="flex gap-2">
              <EditClientDialog client={client} />
              <ArchiveButton clientId={client.id} isArchived={!!client.archived_at} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">תעודת זהות</p>
              <p className="font-medium text-gray-800">{client.id_number}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">טלפון</p>
              <a
                href={`https://wa.me/${client.phone.replace(/\D/g, "").replace(/^0/, "972")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-green-600 hover:underline flex items-center gap-1 w-fit"
              >
                📱 {client.phone}
              </a>
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
                <p className="font-medium text-gray-800">
                  {formatCurrency(client.payment)}
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
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          משא ומתן מול בנקים
        </h2>
        <div className="grid gap-4">
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
