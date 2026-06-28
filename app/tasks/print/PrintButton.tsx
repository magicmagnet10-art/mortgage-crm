"use client";

export default function PrintButton() {
  const handlePDF = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = document.querySelector(".page") as HTMLElement;
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
    <div style={{ position: "fixed", bottom: "24px", left: "24px", display: "flex", gap: "10px" }} className="screen-only">
      <button
        onClick={() => window.print()}
        style={{
          background: "#1e40af", color: "white", border: "none",
          padding: "12px 20px", borderRadius: "10px", fontSize: "14px",
          fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        }}
      >
        🖨️ הדפס
      </button>
      <button
        onClick={handlePDF}
        style={{
          background: "#dc2626", color: "white", border: "none",
          padding: "12px 20px", borderRadius: "10px", fontSize: "14px",
          fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        }}
      >
        📄 שמור PDF
      </button>
    </div>
  );
}
