import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/stores/authStore";
import AlertDialog from "@/components/AlertDialog";
import {
  MessageSquare,
  Edit,
  Save,
  X,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const TicketsPage = () => {
  const { token } = useAuthStore();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertDialog, setAlertDialog] = useState({ open: false, message: "", type: "info" });
  const [editFormData, setEditFormData] = useState({
    status: "",
    solution_description: "",
  });
  const [statusFilter, setStatusFilter] = useState("all");

  // Notification helper
  const showNotification = (message, type = "info") => {
    setAlertDialog({ open: true, message, type });
  };

  // Fetch all tickets
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/ticket`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }

      const data = await response.json();
      if (data.success) {
        setTickets(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      showNotification(
        `Failed to load tickets: ${error.message || "Please try again later"}`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTickets();
    }
  }, [token]);

  // Open edit dialog
  const openEditDialog = (ticket) => {
    setSelectedTicket(ticket);
    setEditFormData({
      status: ticket.status || "open",
      solution_description: ticket.solution_description || "",
    });
    setIsEditDialogOpen(true);
  };

  // Update ticket
  const handleUpdateTicket = async (e) => {
    e.preventDefault();

    if (!selectedTicket) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/ticket/${selectedTicket._id}`,
        {
          method: "PUT",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: editFormData.status,
            solution_description: editFormData.solution_description,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update ticket");
      }

      if (data.success) {
        showNotification("Ticket updated successfully!", "success");
        setIsEditDialogOpen(false);
        setSelectedTicket(null);
        fetchTickets(); // Refresh the list
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
      showNotification(
        `Failed to update ticket: ${error.message || "Please try again later"}`,
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      open: {
        icon: AlertCircle,
        color: "bg-yellow-500",
        text: "Open",
        textColor: "text-white",
        borderColor: "border-yellow-600",
      },
      in_progress: {
        icon: Clock,
        color: "bg-blue-500",
        text: "In Progress",
        textColor: "text-blue-200",
        borderColor: "border-black",
      },
      resolved: {
        icon: CheckCircle2,
        color: "bg-green-500",
        text: "Resolved",
        textColor: "text-white",
        borderColor: "border-green-600",
      },
      closed: {
        icon: XCircle,
        color: "bg-gray-500",
        text: "Closed",
        textColor: "text-white",
        borderColor: "border-gray-600",
      },
    };

    const config = statusConfig[status] || statusConfig.open;
    const Icon = config.icon;

    return (
      <Badge
        className={`${config.color} ${config.textColor} border ${config.borderColor} rounded-md px-2 py-1`}
      >
        <Icon className="w-3 h-3 mr-1.5" />
        {config.text}
      </Badge>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter tickets by status
  const filteredTickets =
    statusFilter === "all"
      ? tickets
      : tickets.filter((ticket) => ticket.status === statusFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Support Tickets</h1>
          <p className="text-muted-foreground mt-1">
            Manage and respond to support tickets
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tickets</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tickets Table */}
      {filteredTickets.length === 0 ? (
        <div className="border rounded-lg p-12 text-center">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Tickets Found</h3>
          <p className="text-muted-foreground">
            {statusFilter === "all"
              ? "No tickets have been created yet"
              : `No tickets with status "${statusFilter}"`}
          </p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow key={ticket._id}>
                  <TableCell className="font-medium max-w-[300px]">
                    <div className="truncate" title={ticket.title}>
                      {ticket.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {ticket.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    {ticket.creator?.username ? (
                      <div>
                        <div className="font-medium">
                          @{ticket.creator.username}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {ticket.creator.email}
                        </div>
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                  <TableCell className="text-sm">
                    {formatDate(ticket.createdAt)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(ticket.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(ticket)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Ticket Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Ticket</DialogTitle>
            <DialogDescription>
              Update ticket status and add solution description
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <form onSubmit={handleUpdateTicket} className="space-y-6 mt-4">
              {/* Ticket Info */}
              <div className="space-y-4 p-4 bg-muted rounded-lg">
                <div>
                  <Label className="text-sm font-semibold text-muted-foreground">
                    Title
                  </Label>
                  <p className="text-lg font-semibold mt-1">
                    {selectedTicket.title}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-muted-foreground">
                    Description
                  </Label>
                  <p className="text-sm mt-1 whitespace-pre-wrap">
                    {selectedTicket.description}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-muted-foreground">
                    Creator
                  </Label>
                  <p className="text-sm mt-1">
                    {selectedTicket.creator?.username
                      ? `@${selectedTicket.creator.username} (${selectedTicket.creator.email})`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-muted-foreground">
                    Created
                  </Label>
                  <p className="text-sm mt-1">
                    {formatDate(selectedTicket.createdAt)}
                  </p>
                </div>
              </div>

              {/* Status Select */}
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value) =>
                    setEditFormData({ ...editFormData, status: value })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Solution Description */}
              <div className="space-y-2">
                <Label htmlFor="solution_description">
                  Solution Description
                </Label>
                <Textarea
                  id="solution_description"
                  value={editFormData.solution_description}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      solution_description: e.target.value,
                    })
                  }
                  placeholder="Enter the solution or response to this ticket..."
                  className="min-h-[200px]"
                />
                <p className="text-xs text-muted-foreground">
                  Provide a detailed solution or response to help resolve this
                  ticket
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

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

export default TicketsPage;

