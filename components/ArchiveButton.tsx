"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function ArchiveButton({
  clientId,
  isArchived,
}: {
  clientId: string;
  isArchived: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!isArchived && !confirm("להעביר לקוח לארכיון?")) return;
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("clients")
      .update({ archived_at: isArchived ? null : new Date().toISOString() })
      .eq("id", clientId);
    setLoading(false);
    router.refresh();
    if (!isArchived) router.push("/");
  };

  return (
    <Button
      variant="outline"
      onClick={handleToggle}
      disabled={loading}
      className={isArchived ? "text-green-700 border-green-300" : "text-gray-500 border-gray-300"}
    >
      {loading ? "..." : isArchived ? "שחזר מארכיון" : "העבר לארכיון"}
    </Button>
  );
}
