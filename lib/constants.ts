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

export const TASK_SECTION = "משימות לקוח";

export const BANK_COLORS: Record<string, { border: string; titleColor: string; badgeBg: string; badgeColor: string }> = {
  "משימות לקוח": {
    border: "#a855f7",
    titleColor: "#7e22ce",
    badgeBg: "#faf5ff",
    badgeColor: "#7e22ce",
  },
  "מזרחי טפחות": {
    border: "#fb923c",
    titleColor: "#c2410c",
    badgeBg: "#fff7ed",
    badgeColor: "#c2410c",
  },
  "הפועלים": {
    border: "#f87171",
    titleColor: "#b91c1c",
    badgeBg: "#fef2f2",
    badgeColor: "#b91c1c",
  },
  "דיסקונט": {
    border: "#4ade80",
    titleColor: "#15803d",
    badgeBg: "#f0fdf4",
    badgeColor: "#15803d",
  },
  "לאומי": {
    border: "#38bdf8",
    titleColor: "#0369a1",
    badgeBg: "#f0f9ff",
    badgeColor: "#0369a1",
  },
  "הבינלאומי": {
    border: "#60a5fa",
    titleColor: "#1d4ed8",
    badgeBg: "#eff6ff",
    badgeColor: "#1d4ed8",
  },
  "ירושלים": {
    border: "#fbbf24",
    titleColor: "#b45309",
    badgeBg: "#fffbeb",
    badgeColor: "#b45309",
  },
  "חוץ בנקאי": {
    border: "#d1d5db",
    titleColor: "#4b5563",
    badgeBg: "#f9fafb",
    badgeColor: "#4b5563",
  },
};
