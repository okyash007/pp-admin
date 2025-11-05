import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Tips = () => {
  const { creator_id } = useParams();
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 50;

  useEffect(() => {
    if (creator_id) {
      fetchTips();
    }
  }, [creator_id, currentPage]);

  const fetchTips = async () => {
    if (!creator_id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/tip/${creator_id}?page=${currentPage}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Failed to fetch tips",
        }));
        throw new Error(errorData.message || "Failed to fetch tips");
      }

      const data = await response.json();
      setTips(data.data?.tips || []);
      setPagination(data.data?.pagination || null);
    } catch (err) {
      console.error("Error fetching tips:", err);
      setError(err.message);
      setTips([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";
    
    // Handle Unix timestamp (in seconds)
    let timestamp;
    if (typeof dateValue === "number") {
      // If it's a number, check if it's in seconds (less than year 2100 in milliseconds)
      // Unix timestamps in seconds are typically 10 digits (e.g., 1762251291)
      if (dateValue < 10000000000) {
        // Convert seconds to milliseconds
        timestamp = dateValue * 1000;
      } else {
        // Already in milliseconds
        timestamp = dateValue;
      }
    } else if (typeof dateValue === "string") {
      // Check if it's a numeric string (Unix timestamp)
      const numValue = parseInt(dateValue, 10);
      if (!isNaN(numValue) && dateValue === numValue.toString()) {
        if (numValue < 10000000000) {
          timestamp = numValue * 1000;
        } else {
          timestamp = numValue;
        }
      } else {
        // Try parsing as date string
        timestamp = new Date(dateValue).getTime();
      }
    } else {
      return "N/A";
    }
    
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "N/A";
    
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount, currency = "INR") => {
    // Assuming amount is in paise (smallest currency unit), convert to rupees
    const rupees = amount / 100;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
    }).format(rupees);
  };

  if (!creator_id) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No creator ID provided</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center">Loading tips...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">Error: {error}</p>
          <Button onClick={fetchTips} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tips</CardTitle>
        {pagination && (
          <p className="text-sm text-muted-foreground">
            Showing {tips.length} of {pagination.totalCount} tips
          </p>
        )}
      </CardHeader>
      <CardContent>
        {tips.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No tips found for this creator
          </p>
        ) : (
          <>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Visitor</TableHead>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Payment Gateway</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tips.map((tip) => (
                    <TableRow key={tip.id}>
                      <TableCell className="font-mono text-sm">
                        {formatDate(tip.created_at)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatAmount(tip.amount, tip.currency)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {tip.message || (
                          <span className="text-muted-foreground italic">
                            No message
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {tip.visitor_name ? (
                            <div>
                              <div className="font-medium">{tip.visitor_name}</div>
                              {tip.visitor_email && (
                                <div className="text-muted-foreground text-xs">
                                  {tip.visitor_email}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground font-mono text-xs">
                              {tip.visitor_id || "Anonymous"}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {tip.payment_id || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {tip.payment_gateway || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={tip.settled ? "default" : "secondary"}
                          className={
                            tip.settled
                              ? "bg-green-100 text-green-800 border-green-200"
                              : ""
                          }
                        >
                          {tip.settled ? "Settled" : "Unsettled"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={!pagination.hasPrevPage || currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(pagination.totalPages, prev + 1)
                      )
                    }
                    disabled={
                      !pagination.hasNextPage ||
                      currentPage === pagination.totalPages
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default Tips;
