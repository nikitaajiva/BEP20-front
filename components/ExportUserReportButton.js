"use client";

import { useState } from "react";

export default function ExportUserReportButton() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/report/generate-user-report`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to generate report");
      }

      // Convert the response to a Blob (Excel binary)
      const blob = await res.blob();

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary <a> tag to trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = "all_users_report.xlsx";
      document.body.appendChild(a);
      a.click();

      // Cleanup
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export Error:", err);
      alert("Error generating report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 my-6">
      <button
        onClick={handleExport}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-6 py-3 rounded-lg shadow transition"
      >
        {loading ? "Generating..." : "📊 Export All Users Report"}
      </button>
    </div>
  );
}
