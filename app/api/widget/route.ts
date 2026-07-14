import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const expected = process.env.WIDGET_TOKEN;
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  const [{ data: generalTasksData }, { data: clients }, { data: entries }] = await Promise.all([
    supabase
      .from("general_tasks")
      .select("id, content, remind_at")
      .is("done_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("clients")
      .select("id, full_name, archived_at, on_hold_at"),
    supabase
      .from("bank_log_entries")
      .select("client_id, bank_name, content, is_task, done_at")
      .order("created_at", { ascending: false }),
  ]);

  const activeIds = new Set(
    (clients ?? []).filter((c) => !c.archived_at && !c.on_hold_at).map((c) => c.id)
  );
  const clientMap = Object.fromEntries(
    (clients ?? []).map((c) => [c.id, c.full_name])
  );

  const seen = new Set<string>();
  const clientEntries: Array<{ client: string; bank: string; content: string; is_task: boolean }> = [];

  for (const e of entries ?? []) {
    if (!activeIds.has(e.client_id) || e.done_at) continue;
    const key = `${e.client_id}::${e.bank_name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    clientEntries.push({
      client: clientMap[e.client_id] ?? "?",
      bank: e.bank_name,
      content: e.content,
      is_task: e.is_task,
    });
  }

  const date = new Date().toLocaleDateString("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return NextResponse.json({
    date,
    general: generalTasksData ?? [],
    clients: clientEntries,
  });
}
