import { createClient } from "@/lib/supabase/server";
import { Client } from "@/lib/types";
import ClientCard from "@/components/ClientCard";
import AddClientDialog from "@/components/AddClientDialog";

export default async function Home() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">לקוחות</h1>
            <p className="text-gray-500 mt-1">
              {clients?.length ?? 0} לקוחות במערכת
            </p>
          </div>
          <AddClientDialog />
        </div>

        {!clients || clients.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-xl">אין לקוחות עדיין</p>
            <p className="text-sm mt-2">לחץ על "לקוח חדש" כדי להתחיל</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {clients.map((client: Client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
