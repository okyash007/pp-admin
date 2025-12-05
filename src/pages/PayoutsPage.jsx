import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download } from "lucide-react";
import AlertDialog from "@/components/AlertDialog";
import Tips from "../our/Tips";
import TipAmounts from "../our/TipAmounts";

const PayoutsPage = () => {
  const { creator_id } = useParams();
  const [isOpening, setIsOpening] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [alertDialog, setAlertDialog] = useState({ open: false, message: "", type: "info" });

  const handleOpenInGoogleSheets = async () => {
    if (!creator_id) {
      setAlertDialog({ open: true, message: "Creator ID is required", type: "error" });
      return;
    }

    setIsOpening(true);
    try {
      // Fetch the CSV data
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
          .catch(() => ({ message: "Failed to fetch CSV" }));
        throw new Error(errorData.message || "Failed to fetch CSV");
      }

      // Get the CSV text
      const csvText = await response.text();

      // Open a new Google Sheet
      const googleSheetsUrl = `https://sheets.google.com/create`;
      window.open(googleSheetsUrl, "_blank");
      
      // Copy CSV to clipboard
      try {
        await navigator.clipboard.writeText(csvText);
        
        // Show instructions after a short delay
        setTimeout(() => {
          setAlertDialog({
            open: true,
            message: "Google Sheets opened! The CSV data is copied to your clipboard. Click on cell A1 in the sheet and paste (Ctrl+V or Cmd+V). The data will automatically format into columns.",
            type: "info"
          });
        }, 1000);
      } catch (clipboardError) {
        // If clipboard API fails, create a downloadable file as fallback
        console.error("Clipboard API failed:", clipboardError);
        const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
        const blobUrl = URL.createObjectURL(blob);
        const downloadLink = document.createElement("a");
        downloadLink.href = blobUrl;
        downloadLink.download = `transfer_batch_${creator_id}_${Date.now()}.csv`;
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(blobUrl);
        
        setAlertDialog({
          open: true,
          message: "Google Sheets opened! A CSV file has been downloaded. In Google Sheets, go to File > Import > Upload and select the downloaded file.",
          type: "info"
        });
      }
    } catch (error) {
      console.error("Error opening CSV in Google Sheets:", error);
      setAlertDialog({ 
        open: true, 
        message: `Error opening CSV in Google Sheets: ${error.message}`, 
        type: "error" 
      });
    } finally {
      setIsOpening(false);
    }
  };

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
      let filename = `transfer_batch_${creator_id}_${Date.now()}.csv`;
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
        <div className="flex gap-2">
          <Button
            onClick={handleDownloadCSV}
            disabled={isDownloading || !creator_id}
            variant="outline"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {isDownloading ? "Downloading..." : "Download CSV"}
          </Button>
          <Button
            onClick={handleOpenInGoogleSheets}
            disabled={isOpening || !creator_id}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            {isOpening ? "Opening..." : "Open in Google Sheets"}
          </Button>
        </div>
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
