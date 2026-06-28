"use client";

export default function PrintButton() {
  const handlePDF = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const area = document.querySelector("[data-print-area]") as HTMLElement;
    if (!area) return;
    const noprint = area.querySelector(".no-print") as HTMLElement | null;
    if (noprint) noprint.style.display = "none";

    const filename = `משימות-${new Date().toLocaleDateString("he-IL").replace(/\//g, "-")}.pdf`;
    const blob: Blob = await html2pdf()
      .set({
        margin: 10,
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(area)
      .outputPdf("blob");

    if (noprint) noprint.style.display = "flex";

    // iOS / Android — פתח תפריט שיתוף טבעי
    if (navigator.canShare && navigator.canShare({ files: [new File([blob], filename, { type: "application/pdf" })] })) {
      const file = new File([blob], filename, { type: "application/pdf" });
      await navigator.share({ files: [file], title: filename });
    } else {
      // דסקטופ — הורד ישירות
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
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
        📄 שמור PDF
      </button>
    </>
  );
}
