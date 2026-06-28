"use client";

export default function PrintButton() {
  const isIOS = typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);

  const handlePDF = async () => {
    if (isIOS) {
      // iOS: window.print פותח תצוגת הדפסה → לחץ שיתוף → שמור PDF בקבצים
      window.print();
      return;
    }
    // דסקטופ: הורדה ישירה
    const html2pdf = (await import("html2pdf.js")).default;
    const area = document.querySelector("[data-print-area]") as HTMLElement;
    if (!area) return;
    const noprint = area.querySelector(".no-print") as HTMLElement | null;
    if (noprint) noprint.style.display = "none";
    const filename = `משימות-${new Date().toLocaleDateString("he-IL").replace(/\//g, "-")}.pdf`;
    await html2pdf()
      .set({
        margin: 10,
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(area)
      .save();
    if (noprint) noprint.style.display = "flex";
  };

  return (
    <>
      <button
        onClick={() => window.print()}
        style={{ background: "#1e40af", color: "white", border: "none", padding: "8px 18px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
      >
        🖨️ הדפס
      </button>
      <button
        onClick={handlePDF}
        style={{ background: "#dc2626", color: "white", border: "none", padding: "8px 18px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
      >
        📄 {isIOS ? "שמור PDF" : "הורד PDF"}
      </button>
    </>
  );
}
