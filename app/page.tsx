import { createClient } from "@/lib/supabase/server";
import { Client, Lead, GeneralTask } from "@/lib/types";
import { TASK_SECTION } from "@/lib/constants";
import HomeView from "@/components/HomeView";

export default async function Home() {
  const supabase = await createClient();

  const [{ data: clients }, { data: allEntries }, { data: leadsData }, { data: generalTasksData }] = await Promise.all([
    supabase.from("clients").select("*").order("created_at", { ascending: false }),
    supabase.from("bank_log_entries").select("client_id, bank_name, content, created_at, is_task").order("created_at", { ascending: false }),
    supabase.from("leads").select("*").order("created_at", { ascending: false }),
    supabase.from("general_tasks").select("*").is("done_at", null).order("created_at", { ascending: false }),
  ]);

  // מיפוי כולל: clientId → bankName → תוכן אחרון
  const lastByClientBank: Record<string, Record<string, string>> = {};
  (allEntries ?? []).forEach((e) => {
    if (!lastByClientBank[e.client_id]) lastByClientBank[e.client_id] = {};
    if (!lastByClientBank[e.client_id][e.bank_name]) {
      lastByClientBank[e.client_id][e.bank_name] = e.content;
    }
  });

  // כל המשימות לכל לקוח
  const tasksByClient: Record<string, Array<{ bank_name: string; content: string }>> = {};
  (allEntries ?? []).filter((e) => e.is_task).forEach((e) => {
    if (!tasksByClient[e.client_id]) tasksByClient[e.client_id] = [];
    tasksByClient[e.client_id].push({ bank_name: e.bank_name, content: e.content });
  });

  const all = (clients ?? []) as Client[];
  const active = all.filter((c) => !c.archived_at && !c.on_hold_at);
  const onHold = all.filter((c) => !!c.on_hold_at && !c.archived_at);
  const archived = all.filter((c) => !!c.archived_at);

  return (
    <HomeView
      active={active}
      onHold={onHold}
      archived={archived}
      leads={(leadsData ?? []) as Lead[]}
      tasksByClient={tasksByClient}
      lastByClientBank={lastByClientBank}
      allClients={all.filter((c) => !c.archived_at)}
      generalTasks={(generalTasksData ?? []) as GeneralTask[]}
    />
  );
}
