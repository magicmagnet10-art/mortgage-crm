import { createClient } from "@/lib/supabase/server";
import { Client } from "@/lib/types";
import ClientCard from "@/components/ClientCard";
import AddClientDialog from "@/components/AddClientDialog";
import Link from "next/link";
import { BANKS, TASK_SECTION, BANK_COLORS } from "@/lib/constants";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const isArchive = tab === "archive";
  const isTasks = tab === "tasks";

  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  // כל הרשומות — לוקחים את האחרונה לכל לקוח+בנק
  const { data: allEntries } = await supabase
    .from("bank_log_entries")
    .select("client_id, bank_name, content, created_at, is_task")
    .order("created_at", { ascending: false });

  // מיפוי כולל (לטאב סטטוס): clientId → bankName → תוכן אחרון
  const lastByClientBank: Record<string, Record<string, string>> = {};
  (allEntries ?? []).forEach((e) => {
    if (!lastByClientBank[e.client_id]) lastByClientBank[e.client_id] = {};
    if (!lastByClientBank[e.client_id][e.bank_name]) {
      lastByClientBank[e.client_id][e.bank_name] = e.content;
    }
  });

  // כל המשימות לכל לקוח (לכרטיס הרחב)
  const tasksByClient: Record<string, Array<{ bank_name: string; content: string }>> = {};
  (allEntries ?? []).filter((e) => e.is_task).forEach((e) => {
    if (!tasksByClient[e.client_id]) tasksByClient[e.client_id] = [];
    tasksByClient[e.client_id].push({ bank_name: e.bank_name, content: e.content });
  });

  const active = (clients ?? []).filter((c: Client) => !c.archived_at);
  const archived = (clients ?? []).filter((c: Client) => !!c.archived_at);
  const displayed = isArchive ? archived : active;

  // לקוחות שיש להם לפחות רשומה אחת בכלשהו
  const clientsWithEntries = active.filter(
    (c: Client) =>
      lastByClientBank[c.id] && Object.keys(lastByClientBank[c.id]).length > 0
  );

  const allSections = [TASK_SECTION, ...BANKS];

  return (
    <main className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">CRM משכנתאות</h1>
          {!isArchive && !isTasks && <AddClientDialog />}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200">
          <Link
            href="/"
            className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors min-h-[52px] flex items-center ${
              !isArchive && !isTasks
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            פעילים ({active.length})
          </Link>
          <Link
            href="/?tab=tasks"
            className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors min-h-[52px] flex items-center ${
              isTasks
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            סטטוס בנקים ({clientsWithEntries.length})
          </Link>
          <Link
            href="/?tab=archive"
            className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors min-h-[52px] flex items-center ${
              isArchive
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            ארכיון ({archived.length})
          </Link>
        </div>

        {/* Tasks/Status tab */}
        {isTasks && (
          <div className="flex flex-col gap-4">
            {clientsWithEntries.length === 0 ? (
              <div className="text-center py-24 text-gray-400">
                <p className="text-xl">אין רשומות עדיין</p>
                <p className="text-sm mt-2">הוסף רשומות בכרטיס לקוח</p>
              </div>
            ) : (
              clientsWithEntries.map((client: Client) => {
                const clientBanks = allSections.filter(
                  (bank) => lastByClientBank[client.id]?.[bank]
                );
                return (
                  <div
                    key={client.id}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
                  >
                    {/* שם לקוח */}
                    <Link
                      href={`/clients/${client.id}`}
                      className="block px-5 py-3 bg-gray-50 border-b border-gray-100 hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-semibold text-blue-700 text-base">
                        {client.full_name}
                      </span>
                    </Link>

                    {/* רשומות לפי בנק */}
                    <div className="divide-y divide-gray-50">
                      {clientBanks.map((bank) => {
                        const colors = BANK_COLORS[bank] ?? {
                          titleColor: "#4b5563",
                          border: "#d1d5db",
                        };
                        return (
                          <div
                            key={bank}
                            className="px-5 py-3 flex items-start gap-3"
                          >
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

        {/* Clients tab */}
        {!isTasks && (
          displayed.length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              <p className="text-xl">
                {isArchive ? "אין לקוחות בארכיון" : "אין לקוחות עדיין"}
              </p>
              {!isArchive && (
                <p className="text-sm mt-2">לחץ על "לקוח חדש" כדי להתחיל</p>
              )}
            </div>
          ) : (
            <div className="grid gap-2">
              {displayed.map((client: Client) => (
                <ClientCard key={client.id} client={client} tasks={tasksByClient[client.id] ?? []} />
              ))}
            </div>
          )
        )}
      </div>
    </main>
  );
}
