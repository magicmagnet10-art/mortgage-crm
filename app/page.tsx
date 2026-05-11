import { createClient } from "@/lib/supabase/server";
import { Client } from "@/lib/types";
import ClientCard from "@/components/ClientCard";
import AddClientDialog from "@/components/AddClientDialog";
import Link from "next/link";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const isArchive = tab === "archive";

  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: taskEntries } = await supabase
    .from("bank_log_entries")
    .select("client_id, content, created_at")
    .eq("bank_name", "משימות לקוח")
    .order("created_at", { ascending: false });

  const lastTaskByClient: Record<string, string> = {};
  (taskEntries ?? []).forEach((e) => {
    if (!lastTaskByClient[e.client_id]) lastTaskByClient[e.client_id] = e.content;
  });

  const active = (clients ?? []).filter((c: Client) => !c.archived_at);
  const archived = (clients ?? []).filter((c: Client) => !!c.archived_at);
  const displayed = isArchive ? archived : active;

  return (
    <main className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">CRM משכנתאות</h1>
          {!isArchive && <AddClientDialog />}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200">
          <Link
            href="/"
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              !isArchive
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            פעילים ({active.length})
          </Link>
          <Link
            href="/?tab=archive"
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              isArchive
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            ארכיון ({archived.length})
          </Link>
        </div>

        {displayed.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-xl">
              {isArchive ? "אין לקוחות בארכיון" : "אין לקוחות עדיין"}
            </p>
            {!isArchive && (
              <p className="text-sm mt-2">לחץ על "לקוח חדש" כדי להתחיל</p>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {displayed.map((client: Client) => (
              <ClientCard key={client.id} client={client} lastTask={lastTaskByClient[client.id]} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
