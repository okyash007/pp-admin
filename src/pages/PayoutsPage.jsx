import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import AlertDialog from "@/components/AlertDialog";
import Tips from "../our/Tips";
import TipAmounts from "../our/TipAmounts";

const PayoutsPage = () => {
  const { creator_id } = useParams();
  const [isDownloading, setIsDownloading] = useState(false);
  const [alertDialog, setAlertDialog] = useState({ open: false, message: "", type: "info" });

  const handleDownloadCSV = async () => {
    if (!creator_id) {
      setAlertDialog({ open: true, message: "Creator ID is required", type: "error" });
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/tip/${creator_id}/unsettled`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Failed to download CSV" }));
        throw new Error(errorData.message || "Failed to download CSV");
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `unsettled_tips_${creator_id}_${Date.now()}.csv`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading CSV:", error);
      setAlertDialog({ open: true, message: `Error downloading CSV: ${error.message}`, type: "error" });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Payouts</h1>
        <Button
          onClick={handleDownloadCSV}
          disabled={isDownloading || !creator_id}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {isDownloading ? "Downloading..." : "Download Transfer Batch CSV"}
        </Button>
      </div>
      <div className="space-y-6">
        <TipAmounts />
        <Tips />
      </div>

      {/* Alert Dialog */}
      <AlertDialog
        open={alertDialog.open}
        onOpenChange={(open) => setAlertDialog({ ...alertDialog, open })}
        message={alertDialog.message}
        type={alertDialog.type}
      />
    </div>
  );
};

export default PayoutsPage;
