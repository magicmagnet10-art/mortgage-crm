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

export const BANK_COLORS: Record<string, { border: string; title: string; badge: string }> = {
  "מזרחי טפחות": {
    border: "border-orange-300",
    title: "text-orange-700",
    badge: "bg-orange-50 text-orange-600",
  },
  "הפועלים": {
    border: "border-red-300",
    title: "text-red-700",
    badge: "bg-red-50 text-red-600",
  },
  "דיסקונט": {
    border: "border-green-300",
    title: "text-green-700",
    badge: "bg-green-50 text-green-600",
  },
  "לאומי": {
    border: "border-sky-300",
    title: "text-sky-700",
    badge: "bg-sky-50 text-sky-600",
  },
  "הבינלאומי": {
    border: "border-blue-300",
    title: "text-yellow-700",
    badge: "bg-blue-50 text-blue-600",
  },
  "ירושלים": {
    border: "border-yellow-300",
    title: "text-yellow-700",
    badge: "bg-yellow-50 text-yellow-600",
  },
  "חוץ בנקאי": {
    border: "border-gray-300",
    title: "text-gray-700",
    badge: "bg-gray-50 text-gray-600",
  },
};
