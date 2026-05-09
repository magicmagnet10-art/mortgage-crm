export interface Client {
  id: string;
  full_name: string;
  id_number: string;
  phone: string;
  mortgage_amount: number;
  property_value: number;
  created_at: string;
}

export interface BankLogEntry {
  id: string;
  client_id: string;
  bank_name: string;
  content: string;
  created_at: string;
}
