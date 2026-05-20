import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import PushSubscriber from "@/components/PushSubscriber";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CRM משכנתאות",
  description: "מערכת ניהול לקוחות ליועצי משכנתאות",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} h-full antialiased`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50">
        <PushSubscriber />
        {children}
      </body>
    </html>
  );
}
