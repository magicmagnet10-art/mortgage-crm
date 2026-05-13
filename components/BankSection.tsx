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
  const isTask = bank === TASK_SECTION;

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

  return (
    <Card className="border-2" style={{ borderColor: colors.border }}>
      <CardHeader
        className="cursor-pointer select-none py-4 px-5"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <CardTitle className="text-base font-semibold" style={{ color: colors.titleColor }}>
              {bank}
            </CardTitle>
            {!open && entries.length > 0 && (
              <p className="text-xs text-gray-500 truncate">
                {entries[entries.length - 1].content}
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
          {/* Log entries */}
          {entries.length > 0 ? (
            <div className="flex flex-col gap-3">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-gray-50 border border-gray-100 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-400">
                      {formatDateTime(entry.created_at)}
                    </p>
                    {isTask && entry.remind_at && (
                      <p className="text-xs text-purple-500 font-medium">
                        🔔 {formatDateTime(entry.remind_at)}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">
                    {entry.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              {isTask ? "אין משימות עדיין." : "אין רשומות עדיין לבנק זה."}
            </p>
          )}

          {/* Add entry */}
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
