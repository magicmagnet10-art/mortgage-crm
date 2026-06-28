"use client";

export default function PrintButton() {
  const handlePDF = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = document.querySelector("[data-print-area]") as HTMLElement;
    html2pdf()
      .set({
        margin: 10,
        filename: `משימות-${new Date().toLocaleDateString("he-IL").replace(/\//g, "-")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(element)
      .save();
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
