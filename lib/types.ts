export interface Client {
  id: string;
  full_name: string;
  id_number: string;
  phone: string;
  mortgage_amount: number;
  property_value: number;
  project_number: string | null;
  residence: string | null;
  equity: number | null;
  payment: number | null;
  next_payment_date: string | null;
  on_hold_at: string | null;
  archived_at: string | null;
  created_at: string;
}

export interface Lead {
  id: string;
  full_name: string;
  source: string | null;
  phone: string | null;
  summary: string | null;
  deal_price: number | null;
  created_at: string;
}

export interface BankLogEntry {
  id: string;
  client_id: string;
  bank_name: string;
  content: string;
  is_task: boolean;
  remind_at: string | null;
  reminded_at: string | null;
  done_at: string | null;
  created_at: string;
}
