import React, { useState, useEffect, useMemo } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/stores/authStore";
import ConfirmDialog from "@/components/ConfirmDialog";
import AlertDialog from "@/components/AlertDialog";
import {
  Bell,
  Plus,
  Send,
  Users,
  User,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
  XCircle,
  Trash2,
  Search,
} from "lucide-react";

const NotificationsPage = () => {
  const { token } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCreators, setLoadingCreators] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [creatorSearchQuery, setCreatorSearchQuery] = useState("");
  const [isCreatorDropdownOpen, setIsCreatorDropdownOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [alertDialog, setAlertDialog] = useState({ open: false, message: "", type: "info" });
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    recipientType: "all", // "all" or "specific"
    creatorId: "",
  });

  // Notification helper
  const showNotification = (message, type = "info") => {
    setAlertDialog({ open: true, message, type });
  };

  // Fetch all notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/notification/all`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      if (data.success) {
        setNotifications(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      showNotification(
        `Failed to load notifications: ${error.message || "Please try again later"}`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch all creators
  const fetchCreators = async () => {
    if (!token) return;
    
    try {
      setLoadingCreators(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/creator/all`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch creators");
      }

      const data = await response.json();
      console.log("Creators response:", data);
      
      if (data.success) {
        // Filter out admins, only get creators
        const creatorList = (data.data || []).filter(
          (creator) => creator.role !== "admin"
        );
        console.log("Filtered creators:", creatorList);
        setCreators(creatorList);
      } else {
        console.error("Failed to fetch creators:", data);
        showNotification(
          `Failed to load creators: ${data.message || "Please try again later"}`,
          "error"
        );
      }
    } catch (error) {
      console.error("Error fetching creators:", error);
      showNotification(
        `Failed to load creators: ${error.message || "Please try again later"}`,
        "error"
      );
    } finally {
      setLoadingCreators(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
      fetchCreators();
    }
  }, [token]);

  // Filter creators based on search query
  const filteredCreators = useMemo(() => {
    if (!creatorSearchQuery.trim()) {
      return creators;
    }
    
    const query = creatorSearchQuery.toLowerCase();
    return creators.filter((creator) => {
      const username = creator.username?.toLowerCase() || "";
      const email = creator.email?.toLowerCase() || "";
      const firstName = creator.firstName?.toLowerCase() || "";
      const lastName = creator.lastName?.toLowerCase() || "";
      
      return (
        username.includes(query) ||
        email.includes(query) ||
        firstName.includes(query) ||
        lastName.includes(query) ||
        `${firstName} ${lastName}`.trim().includes(query)
      );
    });
  }, [creators, creatorSearchQuery]);

  // Create a new notification
  const handleCreateNotification = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.message) {
      showNotification("Please fill in all required fields", "error");
      return;
    }

    if (formData.recipientType === "specific" && !formData.creatorId) {
      showNotification("Please select a creator", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
      };

      if (formData.recipientType === "specific") {
        payload.creatorId = formData.creatorId;
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/notification`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send notification");
      }

      if (data.success) {
        const message =
          formData.recipientType === "all"
            ? `Notification sent successfully to ${data.data.count || "all"} creators!`
            : "Notification sent successfully to selected creator!";
        showNotification(message, "success");
        setIsCreateDialogOpen(false);
        setFormData({
          title: "",
          message: "",
          type: "info",
          recipientType: "all",
          creatorId: "",
        });
        setCreatorSearchQuery("");
        setIsCreatorDropdownOpen(false);
        fetchNotifications(); // Refresh the list
      }
    } catch (error) {
      console.error("Error creating notification:", error);
      showNotification(
        `Failed to send notification: ${error.message || "Please try again later"}`,
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a notification
  const handleDeleteClick = (notificationId) => {
    setNotificationToDelete(notificationId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!notificationToDelete) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/notification/${notificationToDelete}`,
        {
          method: "DELETE",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete notification");
      }

      if (data.success) {
        showNotification("Notification deleted successfully", "success");
        fetchNotifications(); // Refresh the list
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      showNotification(
        `Failed to delete notification: ${error.message || "Please try again later"}`,
        "error"
      );
    } finally {
      setDeleteConfirmOpen(false);
      setNotificationToDelete(null);
    }
  };

  // Get type badge
  const getTypeBadge = (type) => {
    const typeConfig = {
      info: {
        icon: Info,
        color: "bg-blue-500",
        text: "Info",
        textColor: "text-white",
        borderColor: "border-blue-600",
      },
      success: {
        icon: CheckCircle2,
        color: "bg-green-500",
        text: "Success",
        textColor: "text-white",
        borderColor: "border-green-600",
      },
      warning: {
        icon: AlertCircle,
        color: "bg-yellow-500",
        text: "Warning",
        textColor: "text-white",
        borderColor: "border-yellow-600",
      },
      error: {
        icon: XCircle,
        color: "bg-red-500",
        text: "Error",
        textColor: "text-white",
        borderColor: "border-red-600",
      },
    };

    const config = typeConfig[type] || typeConfig.info;
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
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Send and manage notifications to creators
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Send Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Send Notification</DialogTitle>
              <DialogDescription>
                Send a notification to all creators or a specific creator
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateNotification} className="space-y-4 mt-4">
              {/* Recipient Type */}
              <div className="space-y-2">
                <Label htmlFor="recipientType">Recipient *</Label>
                <Select
                  value={formData.recipientType}
                  onValueChange={(value) => {
                    setFormData({ ...formData, recipientType: value, creatorId: "" });
                    setCreatorSearchQuery("");
                    setIsCreatorDropdownOpen(false);
                  }}
                >
                  <SelectTrigger id="recipientType">
                    <SelectValue placeholder="Select recipient type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>All Creators</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="specific">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Specific Creator</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Creator Selection (if specific) */}
              {formData.recipientType === "specific" && (
                <div className="space-y-2">
                  <Label htmlFor="creatorId">Select Creator *</Label>
                  <div className="relative">
                    <Button
                      type="button"
                      variant="outline"
                      id="creatorId"
                      onClick={() => setIsCreatorDropdownOpen(!isCreatorDropdownOpen)}
                      disabled={loadingCreators}
                      className="w-full justify-between"
                    >
                      {loadingCreators ? (
                        "Loading creators..."
                      ) : formData.creatorId ? (
                        (() => {
                          const selected = creators.find(c => c._id === formData.creatorId);
                          return selected ? `@${selected.username}` : "Select a creator";
                        })()
                      ) : (
                        "Select a creator"
                      )}
                      <svg
                        className={`ml-2 h-4 w-4 transition-transform ${isCreatorDropdownOpen ? "rotate-180" : ""}`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Button>
                    
                    {isCreatorDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-[300px] flex flex-col">
                        {/* Search Input inside dropdown */}
                        <div className="p-2 border-b">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search creators..."
                              value={creatorSearchQuery}
                              onChange={(e) => setCreatorSearchQuery(e.target.value)}
                              className="pl-9"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        
                        {/* Creators List */}
                        <div className="overflow-y-auto flex-1">
                          {loadingCreators ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                              <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                              Loading creators...
                            </div>
                          ) : filteredCreators.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                              {creatorSearchQuery ? "No creators found matching your search" : "No creators found"}
                            </div>
                          ) : (
                            filteredCreators.map((creator) => (
                              <div
                                key={creator._id}
                                onClick={() => {
                                  setFormData({ ...formData, creatorId: creator._id });
                                  setIsCreatorDropdownOpen(false);
                                  setCreatorSearchQuery("");
                                }}
                                className={`px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors ${
                                  formData.creatorId === creator._id ? "bg-gray-50" : ""
                                }`}
                              >
                                <div className="font-medium">
                                  @{creator.username}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {creator.email}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Click outside to close */}
                  {isCreatorDropdownOpen && (
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsCreatorDropdownOpen(false)}
                    />
                  )}
                  
                  {loadingCreators && (
                    <p className="text-xs text-muted-foreground">
                      Loading creators...
                    </p>
                  )}
                  {!loadingCreators && creators.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No creators available. Make sure creators are registered.
                    </p>
                  )}
                  {!loadingCreators && creators.length > 0 && creatorSearchQuery && (
                    <p className="text-xs text-muted-foreground">
                      Showing {filteredCreators.length} of {creators.length} creators
                    </p>
                  )}
                </div>
              )}

              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter notification title"
                  maxLength={200}
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Enter notification message"
                  className="min-h-[150px]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Notification
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Notifications Table */}
      {notifications.length === 0 ? (
        <div className="border rounded-lg p-12 text-center">
          <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Notifications Found</h3>
          <p className="text-muted-foreground">
            No notifications have been sent yet
          </p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Sent By</TableHead>
                <TableHead>Sent At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification._id}>
                  <TableCell>{getTypeBadge(notification.type)}</TableCell>
                  <TableCell className="font-medium max-w-[200px]">
                    <div className="truncate" title={notification.title}>
                      {notification.title}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <div className="text-sm text-muted-foreground truncate" title={notification.message}>
                      {notification.message}
                    </div>
                  </TableCell>
                  <TableCell>
                    {notification.creator ? (
                      <div>
                        <div className="font-medium">
                          @{notification.creator?.username || "N/A"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {notification.creator?.email || "N/A"}
                        </div>
                      </div>
                    ) : (
                      <Badge variant="outline">All Creators</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {notification.sentBy ? (
                      <div>
                        <div className="font-medium">
                          @{notification.sentBy?.username || "N/A"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {notification.sentBy?.email || "N/A"}
                        </div>
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(notification.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(notification._id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Notification"
        description="Are you sure you want to delete this notification? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />

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

export default NotificationsPage;

