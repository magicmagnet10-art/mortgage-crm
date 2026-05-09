export const BANKS = [
  "מזרחי טפחות",
  "הפועלים",
  "דיסקונט",
  "לאומי",
  "הבינלאומי",
  "ירושלים",
  "חוץ בנקאי",
] as const;

export type Bank = (typeof BANKS)[number];
