"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function PushSubscriber() {
  const [status, setStatus] = useState<"idle" | "granted" | "denied" | "unsupported">("idle");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "granted") setStatus("granted");
    else if (Notification.permission === "denied") setStatus("denied");
  }, []);

  const subscribe = async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setStatus("denied"); return; }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });

      setStatus("granted");
    } catch (e) {
      console.error(e);
    }
  };

  if (status === "granted" || status === "unsupported") return null;

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 mb-4 flex items-center justify-between gap-4">
      <p className="text-sm text-purple-700">
        {status === "denied"
          ? "הרשאת התראות נדחתה — אפשר מהגדרות הדפדפן"
          : "אפשר התראות כדי לקבל תזכורות על משימות"}
      </p>
      {status === "idle" && (
        <Button size="sm" onClick={subscribe}>
          אפשר התראות
        </Button>
      )}
    </div>
  );
}
