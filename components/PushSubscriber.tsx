"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushSubscriber() {
  const [status, setStatus] = useState<"idle" | "granted" | "denied" | "unsupported" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "granted") {
      // Try to resubscribe silently if already granted
      silentSubscribe();
    } else if (Notification.permission === "denied") {
      setStatus("denied");
    }
  }, []);

  const silentSubscribe = async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (existing) { setStatus("granted"); return; }
      await doSubscribe(reg);
    } catch {}
  };

  const doSubscribe = async (reg: ServiceWorkerRegistration) => {
    const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key),
    });
    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub),
    });
    if (!res.ok) throw new Error("save failed");
    setStatus("granted");
  };

  const subscribe = async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setStatus("denied"); return; }
      await doSubscribe(reg);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setErrorMsg(msg);
      setStatus("error");
    }
  };

  if (status === "granted" || status === "unsupported") return null;

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 mb-4 flex items-center justify-between gap-4" dir="rtl">
      <p className="text-sm text-purple-700">
        {status === "denied"
          ? "הרשאת התראות נדחתה — אפשר מהגדרות"
          : status === "error"
          ? `שגיאה: ${errorMsg}`
          : "אפשר התראות לקבלת תזכורות משימות"}
      </p>
      {(status === "idle" || status === "error") && (
        <Button size="sm" onClick={subscribe}>
          אפשר התראות
        </Button>
      )}
    </div>
  );
}
