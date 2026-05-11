"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Client } from "@/lib/types";
import { createClient as createSupabase } from "@/lib/supabase/client";

export default function EditClientDialog({ client }: { client: Client }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: client.full_name,
    id_number: client.id_number,
    phone: client.phone,
    mortgage_amount: String(client.mortgage_amount),
    property_value: String(client.property_value),
    project_number: client.project_number ?? "",
    residence: client.residence ?? "",
    equity: client.equity != null ? String(client.equity) : "",
    payment: client.payment != null ? String(client.payment) : "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createSupabase();
    await supabase.from("clients").update({
      full_name: form.full_name,
      id_number: form.id_number,
      phone: form.phone,
      mortgage_amount: Number(form.mortgage_amount),
      property_value: Number(form.property_value),
      project_number: form.project_number || null,
      residence: form.residence || null,
      equity: form.equity ? Number(form.equity) : null,
      payment: form.payment ? Number(form.payment) : null,
    }).eq("id", client.id);
    setLoading(false);
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="outline">עריכה</Button>
      </DialogTrigger>
      <DialogContent dir="rtl" className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>עריכת פרטי לקוח</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit_full_name">שם מלא</Label>
            <Input id="edit_full_name" required value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit_id_number">תעודת זהות</Label>
            <Input id="edit_id_number" required value={form.id_number}
              onChange={(e) => setForm({ ...form, id_number: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit_phone">מספר טלפון</Label>
            <Input id="edit_phone" required value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit_mortgage_amount">סכום משכנתא מבוקש (₪)</Label>
            <Input id="edit_mortgage_amount" type="number" required value={form.mortgage_amount}
              onChange={(e) => setForm({ ...form, mortgage_amount: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit_property_value">שווי הנכס (₪)</Label>
            <Input id="edit_property_value" type="number" required value={form.property_value}
              onChange={(e) => setForm({ ...form, property_value: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit_project_number">מספר פרויקט</Label>
            <Input id="edit_project_number" value={form.project_number}
              onChange={(e) => setForm({ ...form, project_number: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit_residence">מגורים</Label>
            <Input id="edit_residence" value={form.residence}
              onChange={(e) => setForm({ ...form, residence: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit_equity">הון עצמי (₪)</Label>
            <Input id="edit_equity" type="number" value={form.equity}
              onChange={(e) => setForm({ ...form, equity: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit_payment">תשלום (₪)</Label>
            <Input id="edit_payment" type="number" value={form.payment}
              onChange={(e) => setForm({ ...form, payment: e.target.value })} />
          </div>
          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? "שומר..." : "שמור שינויים"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
