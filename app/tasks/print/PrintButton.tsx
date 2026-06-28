"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        position: "fixed", bottom: "24px", left: "24px",
        background: "#1e40af", color: "white", border: "none",
        padding: "12px 24px", borderRadius: "10px", fontSize: "15px",
        fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      }}
    >
      🖨️ הדפס
    </button>
  );
}
