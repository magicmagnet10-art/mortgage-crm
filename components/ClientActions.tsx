"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Client } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import EditClientDialog from "@/components/EditClientDialog";

export default function ClientActions({ client }: { client: Client }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleOnHold = async () => {
    const isOnHold = !!client.on_hold_at;
    if (!isOnHold && !confirm("להעביר לקוח להמתנה?")) return;
    setLoading("hold");
    const supabase = createClient();
    await supabase.from("clients").update({ on_hold_at: isOnHold ? null : new Date().toISOString() }).eq("id", client.id);
    setLoading(null);
    router.refresh();
    if (!isOnHold) router.push("/");
  };

  const handleArchive = async () => {
    const isArchived = !!client.archived_at;
    if (!isArchived && !confirm("להעביר לקוח לארכיון?")) return;
    setLoading("archive");
    const supabase = createClient();
    await supabase.from("clients").update({ archived_at: isArchived ? null : new Date().toISOString() }).eq("id", client.id);
    setLoading(null);
    router.refresh();
    if (!isArchived) router.push("/");
  };

  const handleDelete = async () => {
    if (!confirm(`למחוק לצמיתות את ${client.full_name}?\nלא ניתן לשחזר פעולה זו.`)) return;
    setLoading("delete");
    const supabase = createClient();
    await supabase.from("bank_log_entries").delete().eq("client_id", client.id);
    await supabase.from("clients").delete().eq("id", client.id);
    router.push("/");
  };

  return (
    <div className="flex gap-2 flex-wrap justify-end">
      <EditClientDialog client={client} />
      <Button
        variant="outline"
        size="sm"
        onClick={handleOnHold}
        disabled={!!loading}
        className={client.on_hold_at ? "text-green-700 border-green-300" : "text-amber-600 border-amber-300"}
      >
        {loading === "hold" ? "..." : client.on_hold_at ? "הסר המתנה" : "המתנה"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleArchive}
        disabled={!!loading}
        className={client.archived_at ? "text-green-700 border-green-300" : "text-gray-500 border-gray-300"}
      >
        {loading === "archive" ? "..." : client.archived_at ? "שחזר" : "ארכיון"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDelete}
        disabled={!!loading}
        className="text-red-500 border-red-200"
      >
        {loading === "delete" ? "..." : "🗑 מחק"}
      </Button>
    </div>
  );
}
