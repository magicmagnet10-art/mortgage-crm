"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BankLogEntry } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { BANK_COLORS, TASK_SECTION } from "@/lib/constants";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TaskActions({ entry, onRefresh }: { entry: BankLogEntry; onRefresh: () => void }) {
  const [postponeMode, setPostponeMode] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDone = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("bank_log_entries")
      .update({ done_at: new Date().toISOString() })
      .eq("id", entry.id);
    setLoading(false);
    onRefresh();
  };

  const handleUndone = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("bank_log_entries")
      .update({ done_at: null })
      .eq("id", entry.id);
    setLoading(false);
    onRefresh();
  };

  const handleDelete = async () => {
    if (!confirm("למחוק את המשימה?")) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("bank_log_entries").delete().eq("id", entry.id);
    setLoading(false);
    onRefresh();
  };

  const handlePostpone = async () => {
    if (!newDate) return;
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("bank_log_entries")
      .update({ remind_at: new Date(newDate).toISOString(), reminded_at: null })
      .eq("id", entry.id);
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
            <button
              onClick={handleUndone}
              className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200"
            >
              ↩ בטל בוצע
            </button>
          ) : (
            <button
              onClick={handleDone}
              className="text-xs px-2 py-1 rounded-md bg-green-50 text-green-700 hover:bg-green-100 font-medium"
            >
              ✓ בוצע
            </button>
          )}
          {!entry.done_at && (
            <button
              onClick={() => setPostponeMode(true)}
              className="text-xs px-2 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              📅 דחה
            </button>
          )}
          <button
            onClick={handleDelete}
            className="text-xs px-2 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100"
          >
            🗑 מחק
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            type="datetime-local"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="text-xs h-8 w-48"
          />
          <button
            onClick={handlePostpone}
            disabled={!newDate}
            className="text-xs px-2 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40"
          >
            אשר דחייה
          </button>
          <button
            onClick={() => { setPostponeMode(false); setNewDate(""); }}
            className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200"
          >
            ביטול
          </button>
        </div>
      )}
    </div>
  );
}

export default function BankSection({
  bank,
  clientId,
  entries,
}: {
  bank: string;
  clientId: string;
  entries: BankLogEntry[];
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [remindAt, setRemindAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(entries.length > 0);
  const [expanded, setExpanded] = useState(false);
  const isTask = bank === TASK_SECTION;

  const lastEntry = entries[entries.length - 1];
  const olderEntries = entries.slice(0, -1);

  const handleAdd = async () => {
    if (!text.trim()) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("bank_log_entries").insert({
      client_id: clientId,
      bank_name: bank,
      content: text.trim(),
      ...(isTask && remindAt ? { remind_at: new Date(remindAt).toISOString() } : {}),
    });
    setLoading(false);
    setText("");
    setRemindAt("");
    router.refresh();
  };

  const colors = BANK_COLORS[bank] ?? {
    border: "#d1d5db",
    titleColor: "#374151",
    badgeBg: "#f9fafb",
    badgeColor: "#4b5563",
  };

  function EntryCard({ entry, prominent }: { entry: BankLogEntry; prominent?: boolean }) {
    const isDone = !!entry.done_at;
    return (
      <div
        className={`rounded-lg p-3 ${prominent ? "bg-white border-2" : "bg-gray-50 border border-gray-100 opacity-70"} ${isDone ? "opacity-60" : ""}`}
        style={prominent ? { borderColor: colors.border } : {}}
      >
        <div className="flex items-center justify-between mb-1 gap-2">
          <p className="text-xs text-gray-400">{formatDateTime(entry.created_at)}</p>
          <div className="flex items-center gap-2">
            {isDone && (
              <span className="text-xs text-green-600 font-medium">✓ בוצע</span>
            )}
            {isTask && entry.remind_at && !isDone && (
              <p className="text-xs text-purple-500 font-medium">🔔 {formatDateTime(entry.remind_at)}</p>
            )}
            {isTask && entry.remind_at && isDone && (
              <p className="text-xs text-gray-400 line-through">🔔 {formatDateTime(entry.remind_at)}</p>
            )}
          </div>
        </div>
        <p className={`text-sm whitespace-pre-wrap ${prominent ? "text-gray-800 font-medium" : "text-gray-700"} ${isDone ? "line-through text-gray-400" : ""}`}>
          {entry.content}
        </p>
        {isTask && (
          <TaskActions entry={entry} onRefresh={() => router.refresh()} />
        )}
      </div>
    );
  }

  return (
    <Card className="border-2" style={{ borderColor: colors.border }}>
      <CardHeader
        className="cursor-pointer select-none py-5 px-5 min-h-[56px]"
        onClick={() => { setOpen((o) => !o); if (open) setExpanded(false); }}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <CardTitle className="text-base font-semibold" style={{ color: colors.titleColor }}>
              {bank}
            </CardTitle>
            {!open && entries.length > 0 && (
              <p className="text-xs text-gray-500 truncate">
                {lastEntry.content}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 mr-3 shrink-0">
            {entries.length > 0 && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: colors.badgeBg, color: colors.badgeColor }}
              >
                {entries.length} רשומות
              </span>
            )}
            <span className="text-gray-400 text-sm">{open ? "▲" : "▼"}</span>
          </div>
        </div>
      </CardHeader>

      {open && (
        <CardContent className="px-5 pb-5 pt-0 flex flex-col gap-4">
          {entries.length > 0 ? (
            <div className="flex flex-col gap-3">
              {olderEntries.length > 0 && (
                <button
                  onClick={() => setExpanded((e) => !e)}
                  className="text-xs text-blue-500 hover:underline self-start"
                >
                  {expanded ? "הסתר ישן ▲" : `הרחב — ${olderEntries.length} רשומות ישנות ▼`}
                </button>
              )}

              {expanded && olderEntries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} prominent={false} />
              ))}

              {lastEntry && <EntryCard entry={lastEntry} prominent />}
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              {isTask ? "אין משימות עדיין." : "אין רשומות עדיין לבנק זה."}
            </p>
          )}

          {/* הוספת רשומה */}
          <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
            <Textarea
              placeholder={isTask ? "הוסף משימה חדשה..." : "הוסף רשומה חדשה..."}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              className="resize-none text-sm"
            />
            {isTask && (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">תזכורת (אופציונלי)</label>
                <Input
                  type="datetime-local"
                  value={remindAt}
                  onChange={(e) => setRemindAt(e.target.value)}
                  className="text-sm"
                />
              </div>
            )}
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={loading || !text.trim()}
              className="self-start"
            >
              {loading ? "שומר..." : "הוסף"}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
