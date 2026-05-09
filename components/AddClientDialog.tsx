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
import { createClient } from "@/lib/supabase/client";

export default function AddClientDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    id_number: "",
    phone: "",
    mortgage_amount: "",
    property_value: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("clients").insert({
      full_name: form.full_name,
      id_number: form.id_number,
      phone: form.phone,
      mortgage_amount: Number(form.mortgage_amount),
      property_value: Number(form.property_value),
    });
    setLoading(false);
    if (!error) {
      setOpen(false);
      setForm({
        full_name: "",
        id_number: "",
        phone: "",
        mortgage_amount: "",
        property_value: "",
      });
      router.refresh();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button>+ לקוח חדש</Button>
      </DialogTrigger>
      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>הוספת לקוח חדש</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="full_name">שם מלא</Label>
            <Input
              id="full_name"
              required
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="id_number">תעודת זהות</Label>
            <Input
              id="id_number"
              required
              value={form.id_number}
              onChange={(e) => setForm({ ...form, id_number: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">מספר טלפון</Label>
            <Input
              id="phone"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mortgage_amount">סכום משכנתא מבוקש (₪)</Label>
            <Input
              id="mortgage_amount"
              type="number"
              required
              value={form.mortgage_amount}
              onChange={(e) =>
                setForm({ ...form, mortgage_amount: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="property_value">שווי הנכס (₪)</Label>
            <Input
              id="property_value"
              type="number"
              required
              value={form.property_value}
              onChange={(e) =>
                setForm({ ...form, property_value: e.target.value })
              }
            />
          </div>
          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? "שומר..." : "הוסף לקוח"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
