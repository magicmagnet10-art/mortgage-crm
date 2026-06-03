"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

export default function AddLeadDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "", source: "", phone: "", summary: "", deal_price: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    await supabase.from("leads").insert({
      full_name: form.full_name,
      source: form.source || null,
      phone: form.phone || null,
      summary: form.summary || null,
      deal_price: form.deal_price ? Number(form.deal_price) : null,
    });
    setLoading(false);
    setOpen(false);
    setForm({ full_name: "", source: "", phone: "", summary: "", deal_price: "" });
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button>+ ליד חדש</Button>
      </DialogTrigger>
      <DialogContent dir="rtl" className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>הוספת ליד חדש</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label>שם לקוח</Label>
            <Input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>מהיכן הגיע</Label>
            <Input placeholder="המלצה, פייסבוק, אינסטגרם..." value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>טלפון</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>סיכום שיחה</Label>
            <Textarea rows={3} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} className="resize-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>מחיר עסקה (₪)</Label>
            <Input type="number" value={form.deal_price} onChange={(e) => setForm({ ...form, deal_price: e.target.value })} />
          </div>
          <Button type="submit" disabled={loading}>{loading ? "שומר..." : "הוסף ליד"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
