import { createClient } from "@/lib/supabase/server";
import { Client } from "@/lib/types";
import { TASK_SECTION } from "@/lib/constants";
import HomeView from "@/components/HomeView";

export default async function Home() {
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: allEntries } = await supabase
    .from("bank_log_entries")
    .select("client_id, bank_name, content, created_at, is_task")
    .order("created_at", { ascending: false });

  // מיפוי כולל: clientId → bankName → תוכן אחרון (לטאב סטטוס)
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

  return (
    <HomeView
      active={active}
      archived={archived}
      tasksByClient={tasksByClient}
      lastByClientBank={lastByClientBank}
    />
  );
}
