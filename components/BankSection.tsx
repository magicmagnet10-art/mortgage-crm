"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BankLogEntry } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

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
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(entries.length > 0);

  const handleAdd = async () => {
    if (!text.trim()) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("bank_log_entries").insert({
      client_id: clientId,
      bank_name: bank,
      content: text.trim(),
    });
    setLoading(false);
    setText("");
    router.refresh();
  };

  return (
    <Card className="border border-gray-200">
      <CardHeader
        className="cursor-pointer select-none py-4 px-5"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-800">
            {bank}
          </CardTitle>
          <div className="flex items-center gap-3">
            {entries.length > 0 && (
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
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
                  <p className="text-xs text-gray-400 mb-1">
                    {formatDateTime(entry.created_at)}
                  </p>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">
                    {entry.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">אין רשומות עדיין לבנק זה.</p>
          )}

          {/* Add entry */}
          <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
            <Textarea
              placeholder="הוסף רשומה חדשה..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              className="resize-none text-sm"
            />
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
