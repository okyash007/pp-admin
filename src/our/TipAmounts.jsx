import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TipAmounts = () => {
  const { creator_id } = useParams();
  const [amounts, setAmounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (creator_id) {
      fetchTipAmounts();
    }
  }, [creator_id]);

  const fetchTipAmounts = async () => {
    if (!creator_id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/tip/${creator_id}/amounts`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Failed to fetch tip amounts",
        }));
        throw new Error(errorData.message || "Failed to fetch tip amounts");
      }

      const data = await response.json();
      setAmounts(data.data || null);
    } catch (err) {
      console.error("Error fetching tip amounts:", err);
      setError(err.message);
      setAmounts(null);
    } finally {
      setLoading(false);
    }
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
          <p className="text-center">Loading tip amounts...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">Error: {error}</p>
          <Button onClick={fetchTipAmounts} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!amounts) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No tip amounts found for this creator
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tip Amounts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">
              Collected Amount
            </div>
            <div className="text-2xl font-bold">
              {formatAmount(amounts.collected_amount || 0)}
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">
              Settled Amount
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatAmount(amounts.settled_amount || 0)}
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">
              Unsettled Amount
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {formatAmount(amounts.unsettled_amount || 0)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TipAmounts;