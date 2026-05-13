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
  const [status, setStatus] = useState<"idle" | "granted" | "denied" | "unsupported" | "loading">("idle");
  const [debug, setDebug] = useState("");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      setDebug("PushManager לא נתמך בדפדפן זה");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
    }
  }, []);

  const subscribe = async () => {
    setStatus("loading");
    setDebug("מתחיל רישום...");
    try {
      setDebug("רושם Service Worker...");
      const reg = await navigator.serviceWorker.register("/sw.js");

      setDebug("ממתין ל-SW...");
      await navigator.serviceWorker.ready;

      setDebug("מבקש הרשאה...");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        setDebug("הרשאה נדחתה: " + permission);
        return;
      }

      setDebug("יוצר subscription...");
      const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      });

      setDebug("שולח ל-server...");
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error("Server error: " + txt);
      }

      setStatus("granted");
      setDebug("✅ הצליח!");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setStatus("idle");
      setDebug("❌ שגיאה: " + msg);
    }
  };

  if (status === "unsupported") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-700" dir="rtl">
        ⚠️ {debug}
      </div>
    );
  }

  if (status === "granted" && !debug.startsWith("✅")) return null;

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 mb-4 flex flex-col gap-2" dir="rtl">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-purple-700">
          {status === "denied"
            ? "הרשאת התראות נדחתה — אפשר מהגדרות"
            : status === "granted"
            ? "✅ התראות מופעלות"
            : "אפשר התראות לקבלת תזכורות משימות"}
        </p>
        {status !== "denied" && status !== "granted" && (
          <Button size="sm" onClick={subscribe} disabled={status === "loading"}>
            {status === "loading" ? "..." : "אפשר התראות"}
          </Button>
        )}
      </div>
      {debug && (
        <p className="text-xs text-purple-500 font-mono">{debug}</p>
      )}
    </div>
  );
}
