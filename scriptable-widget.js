// NSCC Tasks Widget — Scriptable
// 1. Install Scriptable from the App Store
// 2. Paste this script into a new script
// 3. Replace TOKEN below with your token
// 4. Add widget to Home Screen → pick "NSCC Tasks"

const TOKEN = "c301e23d3796dd695211a5c69c0f8712";
const BASE_URL = "https://nscc-five.vercel.app";
const API_URL = `${BASE_URL}/api/widget?token=${TOKEN}`;

// --- Fetch data ---
let data = { date: "", general: [], clients: [] };
try {
  const req = new Request(API_URL);
  req.timeoutInterval = 10;
  data = await req.loadJSON();
} catch (e) {
  data.date = "שגיאת חיבור";
}

const general = data.general ?? [];
const tasks = (data.clients ?? []).filter((c) => c.is_task);
const notes = (data.clients ?? []).filter((c) => !c.is_task);

// --- Widget size logic ---
const isSmall = config.widgetFamily === "small";
const isMedium = config.widgetFamily === "medium" || !config.widgetFamily;
const maxGeneral = isSmall ? 2 : 3;
const maxTasks = isSmall ? 1 : 4;
const maxNotes = isSmall ? 0 : 2;

// --- Build widget ---
const w = new ListWidget();
w.backgroundColor = new Color("#ffffff");
w.setPadding(12, 14, 12, 14);
w.url = BASE_URL;

// Title bar
const titleRow = w.addStack();
titleRow.layoutHorizontally();
titleRow.centerAlignContent();
const titleTxt = titleRow.addText("📋 משימות");
titleTxt.font = Font.boldSystemFont(14);
titleTxt.textColor = new Color("#1e40af");
titleRow.addSpacer();
const dateTxt = titleRow.addText(data.date || "");
dateTxt.font = Font.systemFont(9);
dateTxt.textColor = new Color("#9ca3af");

w.addSpacer(6);

function addSeparator() {
  const sep = w.addStack();
  sep.backgroundColor = new Color("#f3f4f6");
  sep.size = new Size(0, 1);
  w.addSpacer(5);
}

// --- General tasks ---
if (general.length > 0) {
  const h = w.addText("📌 כללי");
  h.font = Font.boldSystemFont(10);
  h.textColor = new Color("#c2410c");
  w.addSpacer(3);

  for (const t of general.slice(0, maxGeneral)) {
    const row = w.addStack();
    row.layoutHorizontally();
    row.centerAlignContent();
    const dot = row.addText("• ");
    dot.font = Font.systemFont(10);
    dot.textColor = new Color("#fb923c");
    const txt = row.addText(t.content);
    txt.font = Font.systemFont(10);
    txt.textColor = new Color("#374151");
    txt.lineLimit = 1;
    w.addSpacer(2);
  }

  if (general.length > maxGeneral) {
    const more = w.addText(`  +${general.length - maxGeneral} נוספות`);
    more.font = Font.italicSystemFont(9);
    more.textColor = new Color("#9ca3af");
  }
}

// --- Client tasks ---
if (tasks.length > 0) {
  w.addSpacer(5);
  const h = w.addText("⚡ משימות לקוחות");
  h.font = Font.boldSystemFont(10);
  h.textColor = new Color("#7c3aed");
  w.addSpacer(3);

  for (const t of tasks.slice(0, maxTasks)) {
    const row = w.addStack();
    row.layoutHorizontally();
    row.centerAlignContent();
    const clientTxt = row.addText(t.client + " · ");
    clientTxt.font = Font.boldSystemFont(10);
    clientTxt.textColor = new Color("#1e40af");
    const txt = row.addText(t.content);
    txt.font = Font.systemFont(10);
    txt.textColor = new Color("#374151");
    txt.lineLimit = 1;
    w.addSpacer(2);
  }

  if (tasks.length > maxTasks) {
    const more = w.addText(`  +${tasks.length - maxTasks} נוספות`);
    more.font = Font.italicSystemFont(9);
    more.textColor = new Color("#9ca3af");
  }
}

// --- Notes (if not small) ---
if (!isSmall && notes.length > 0) {
  w.addSpacer(5);
  const h = w.addText("🏦 סטטוס בנקים");
  h.font = Font.boldSystemFont(10);
  h.textColor = new Color("#0369a1");
  w.addSpacer(3);

  for (const n of notes.slice(0, maxNotes)) {
    const row = w.addStack();
    row.layoutHorizontally();
    row.centerAlignContent();
    const clientTxt = row.addText(n.client + " · ");
    clientTxt.font = Font.boldSystemFont(10);
    clientTxt.textColor = new Color("#1e40af");
    const txt = row.addText(n.content);
    txt.font = Font.systemFont(10);
    txt.textColor = new Color("#6b7280");
    txt.lineLimit = 1;
    w.addSpacer(2);
  }
}

w.addSpacer();

// Footer
const footer = w.addText("עדכון: " + new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }));
footer.font = Font.systemFont(8);
footer.textColor = new Color("#d1d5db");

Script.setWidget(w);
Script.complete();

if (config.runsInApp) {
  await w.presentMedium();
}
