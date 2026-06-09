"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LeadLogEntry } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("he-IL", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

function TaskActions({ entry, onRefresh }: { entry: LeadLogEntry; onRefresh: () => void }) {
  const [postponeMode, setPostponeMode] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDone = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("lead_log_entries").update({ done_at: new Date().toISOString() }).eq("id", entry.id);
    setLoading(false);
    onRefresh();
  };

  const handleUndone = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("lead_log_entries").update({ done_at: null }).eq("id", entry.id);
    setLoading(false);
    onRefresh();
  };

  const handleDelete = async () => {
    if (!confirm("למחוק?")) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("lead_log_entries").delete().eq("id", entry.id);
    setLoading(false);
    onRefresh();
  };

  const handlePostpone = async () => {
    if (!newDate) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("lead_log_entries").update({ remind_at: new Date(newDate).toISOString(), reminded_at: null }).eq("id", entry.id);
    setLoading(false);
    setPostponeMode(false);
    setNewDate("");
    onRefresh();
  };

  if (loading) return <p className="text-xs text-gray-400 mt-1">שומר...</p>;

  return (
    <div className="mt-2 flex flex-col gap-1">
      {!postponeMode ? (
        <div className="flex gap-2 flex-wrap">
          {entry.done_at ? (
            <button onClick={handleUndone} className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200">↩ בטל בוצע</button>
          ) : (
            <button onClick={handleDone} className="text-xs px-2 py-1 rounded-md bg-green-50 text-green-700 hover:bg-green-100 font-medium">✓ בוצע</button>
          )}
          {!entry.done_at && (
            <button onClick={() => setPostponeMode(true)} className="text-xs px-2 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100">📅 דחה</button>
          )}
          <button onClick={handleDelete} className="text-xs px-2 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100">🗑 מחק</button>
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="datetime-local"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="text-xs h-8 px-2 border border-gray-200 rounded-lg w-48"
          />
          <button onClick={handlePostpone} disabled={!newDate} className="text-xs px-2 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40">אשר דחייה</button>
          <button onClick={() => { setPostponeMode(false); setNewDate(""); }} className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-500">ביטול</button>
        </div>
      )}
    </div>
  );
}

export default function LeadPageClient({ leadId, entries }: { leadId: string; entries: LeadLogEntry[] }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [isTask, setIsTask] = useState(false);
  const [remindAt, setRemindAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const lastEntry = entries[entries.length - 1];
  const olderEntries = entries.slice(0, -1);

  const handleAdd = async () => {
    if (!text.trim()) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("lead_log_entries").insert({
      lead_id: leadId,
      content: text.trim(),
      is_task: isTask,
      ...(isTask && remindAt ? { remind_at: new Date(remindAt).toISOString() } : {}),
    });
    setLoading(false);
    setText("");
    setRemindAt("");
    setIsTask(false);
    router.refresh();
  };

  function EntryCard({ entry, prominent }: { entry: LeadLogEntry; prominent?: boolean }) {
    const isDone = !!entry.done_at;
    return (
      <div className={`rounded-lg p-3 ${prominent ? "bg-white border-2 border-amber-200" : "bg-gray-50 border border-gray-100 opacity-70"} ${isDone ? "opacity-60" : ""}`}>
        <div className="flex items-center justify-between mb-1 gap-2">
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-400">{formatDateTime(entry.created_at)}</p>
            {entry.is_task && !isDone && (
              <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700">משימה</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isDone && <span className="text-xs text-green-600 font-medium">✓ בוצע</span>}
            {entry.is_task && entry.remind_at && !isDone && (
              <p className="text-xs text-purple-500 font-medium">🔔 {formatDateTime(entry.remind_at)}</p>
            )}
          </div>
        </div>
        <p className={`text-sm whitespace-pre-wrap ${prominent ? "text-gray-800 font-medium" : "text-gray-700"} ${isDone ? "line-through text-gray-400" : ""}`}>
          {entry.content}
        </p>
        {entry.is_task && <TaskActions entry={entry} onRefresh={() => router.refresh()} />}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-amber-200 overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-base font-bold text-amber-700">הערות ומשימות</h2>
      </div>

      <div className="px-5 py-4 flex flex-col gap-3">
        {entries.length > 0 ? (
          <div className="flex flex-col gap-3">
            {olderEntries.length > 0 && (
              <button onClick={() => setExpanded((e) => !e)} className="text-xs text-blue-500 hover:underline self-start">
                {expanded ? "הסתר ישן ▲" : `הרחב — ${olderEntries.length} רשומות ישנות ▼`}
              </button>
            )}
            {expanded && olderEntries.map((e) => <EntryCard key={e.id} entry={e} prominent={false} />)}
            {lastEntry && <EntryCard entry={lastEntry} prominent />}
          </div>
        ) : (
          <p className="text-sm text-gray-400">אין רשומות עדיין.</p>
        )}

        {/* הוספה */}
        <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
          <div className="flex gap-1 self-start border border-gray-200 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => { setIsTask(false); setRemindAt(""); }}
              className={`px-3 py-1.5 rounded-md transition-colors ${!isTask ? "bg-gray-700 text-white font-medium" : "text-gray-500 hover:text-gray-700"}`}
            >
              הערה
            </button>
            <button
              onClick={() => setIsTask(true)}
              className={`px-3 py-1.5 rounded-md transition-colors ${isTask ? "bg-amber-600 text-white font-medium" : "text-gray-500 hover:text-gray-700"}`}
            >
              משימה
            </button>
          </div>
          <textarea
            rows={2}
            placeholder={isTask ? "תוכן המשימה..." : "הוסף הערה..."}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none outline-none focus:border-amber-300"
          />
          {isTask && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">תזכורת (אופציונלי)</label>
              <input
                type="datetime-local"
                value={remindAt}
                onChange={(e) => setRemindAt(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          )}
          <button
            onClick={handleAdd}
            disabled={loading || !text.trim()}
            className="self-start px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-40 transition-colors"
          >
            {loading ? "שומר..." : isTask ? "הוסף משימה" : "הוסף הערה"}
          </button>
        </div>
      </div>
    </div>
  );
}
