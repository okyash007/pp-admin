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
          <h1 className="text-3xl font-black text-black uppercase tracking-tight">Support Tickets</h1>
          <p className="text-black/60 font-bold mt-1 text-sm">
            Manage and respond to support tickets
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-white border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:border-[#828BF8] font-black">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
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
        <div className="bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg p-12 text-center">
          <div className="h-20 w-20 bg-gradient-to-br from-[#828BF8] to-[#5C66D4] border-[4px] border-black rounded-lg flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mx-auto mb-4">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-black text-black mb-2 uppercase">No Tickets Found</h3>
          <p className="text-black/60 font-bold">
            {statusFilter === "all"
              ? "No tickets have been created yet"
              : `No tickets with status "${statusFilter}"`}
          </p>
        </div>
      ) : (
        <div className="bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="bg-gradient-to-r from-[#828BF8] to-[#828BF8]/90 border-b-[3px] border-black px-6 py-4">
            <h2 className="text-white font-black uppercase tracking-tight text-lg">Support Tickets</h2>
            <p className="text-[#FEF18C] font-bold text-xs mt-1">
              {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <div className="border-t-[3px] border-black">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#FEF18C]/20 border-b-[2px] border-black">
                  <TableHead className="font-black text-black uppercase text-xs border-r-[2px] border-black">Title</TableHead>
                  <TableHead className="font-black text-black uppercase text-xs border-r-[2px] border-black">Creator</TableHead>
                  <TableHead className="font-black text-black uppercase text-xs border-r-[2px] border-black">Status</TableHead>
                  <TableHead className="font-black text-black uppercase text-xs border-r-[2px] border-black">Created</TableHead>
                  <TableHead className="font-black text-black uppercase text-xs border-r-[2px] border-black">Last Updated</TableHead>
                  <TableHead className="font-black text-black uppercase text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket, index) => (
                  <TableRow 
                    key={ticket._id}
                    className={`border-b-[2px] border-black hover:bg-[#FEF18C]/10 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-[#FEF18C]/5'
                    }`}
                  >
                    <TableCell className="font-black text-black max-w-[300px] border-r-[2px] border-black">
                      <div className="truncate" title={ticket.title}>
                        {ticket.title}
                      </div>
                      <div className="text-xs text-black/60 mt-1 line-clamp-1 font-bold">
                        {ticket.description}
                      </div>
                    </TableCell>
                    <TableCell className="border-r-[2px] border-black">
                      {ticket.creator?.username ? (
                        <div>
                          <div className="font-black text-black">
                            @{ticket.creator.username}
                          </div>
                          <div className="text-xs text-black/60 font-bold">
                            {ticket.creator.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-black/60 font-bold">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="border-r-[2px] border-black">{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell className="text-sm text-black font-bold border-r-[2px] border-black">
                      {formatDate(ticket.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm text-black font-bold border-r-[2px] border-black">
                      {formatDate(ticket.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(ticket)}
                        className="bg-white hover:bg-[#828BF8] hover:text-white text-black font-black border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200"
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
        </div>
      )}

      {/* Edit Ticket Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <DialogHeader className="bg-gradient-to-r from-[#828BF8] to-[#828BF8]/90 border-b-[3px] border-black -mx-8 -mt-8 px-8 pt-6 pb-4 mb-6">
            <DialogTitle className="text-white font-black uppercase tracking-tight text-2xl">Edit Ticket</DialogTitle>
            <DialogDescription className="text-[#FEF18C] font-bold mt-2">
              Update ticket status and add solution description
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <form onSubmit={handleUpdateTicket} className="space-y-6 mt-4">
              {/* Ticket Info */}
              <div className="space-y-4 p-4 bg-[#FEF18C]/10 border-[3px] border-black rounded-lg">
                <div>
                  <Label className="text-sm font-black text-black uppercase tracking-tight">
                    Title
                  </Label>
                  <p className="text-lg font-black text-black mt-1">
                    {selectedTicket.title}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-black text-black uppercase tracking-tight">
                    Description
                  </Label>
                  <p className="text-sm mt-1 whitespace-pre-wrap text-black font-bold">
                    {selectedTicket.description}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-black text-black uppercase tracking-tight">
                    Creator
                  </Label>
                  <p className="text-sm mt-1 text-black font-bold">
                    {selectedTicket.creator?.username
                      ? `@${selectedTicket.creator.username} (${selectedTicket.creator.email})`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-black text-black uppercase tracking-tight">
                    Created
                  </Label>
                  <p className="text-sm mt-1 text-black font-bold">
                    {formatDate(selectedTicket.createdAt)}
                  </p>
                </div>
              </div>

              {/* Status Select */}
              <div className="space-y-2">
                <Label htmlFor="status" className="font-black text-black uppercase tracking-tight">Status *</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value) =>
                    setEditFormData({ ...editFormData, status: value })
                  }
                >
                  <SelectTrigger id="status" className="bg-white border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:border-[#828BF8]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Solution Description */}
              <div className="space-y-2">
                <Label htmlFor="solution_description" className="font-black text-black uppercase tracking-tight">
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
                  className="min-h-[200px] bg-white border-[2px] border-black focus:border-[#828BF8] focus:ring-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                />
                <p className="text-xs text-black/60 font-bold">
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
                  className="bg-white hover:bg-[#FEF18C] text-black font-black border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-[#828BF8] to-[#5C66D4] hover:from-[#828BF8]/90 hover:to-[#5C66D4]/90 text-white font-black border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200"
                >
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

