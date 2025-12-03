import React, { useEffect, useState, useMemo } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import Creator from "../our/Creator";
import { useAuthStore } from "../stores/authStore";
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  UserCheck,
  Search,
  Filter,
  X,
  Clock
} from "lucide-react";

async function getCreators(token) {
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
  const data = await response.json();
  return data;
}

const CreatorsPage = () => {
  const { token } = useAuthStore();
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Filter states
  const [approvedFilter, setApprovedFilter] = useState("all");
  const [onboardingFilter, setOnboardingFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (token) {
      fetchCreators();
    }
  }, [token]);

  const fetchCreators = async () => {
    try {
      setLoading(true);
      const data = await getCreators(token);
      if (data.success) {
        // Show all creators (including admins to match dashboard behavior)
        setCreators(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching creators:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics
  const analytics = useMemo(() => {
    const total = creators.length;
    const approved = creators.filter(c => c.approved).length;
    const onboardingCompleted = creators.filter(
      c => c.onboarding?.completed
    ).length;
    const verified = creators.filter(c => c.verified).length;
    
    return {
      total,
      approved,
      onboardingCompleted,
      verified,
    };
  }, [creators]);

  // Filter creators
  const filteredCreators = useMemo(() => {
    return creators.filter((creator) => {
      // Approved filter
      if (approvedFilter === "approved" && !creator.approved) return false;
      if (approvedFilter === "notApproved" && creator.approved) return false;

      // Onboarding filter
      if (onboardingFilter === "completed" && !creator.onboarding?.completed) return false;
      if (onboardingFilter === "incomplete" && creator.onboarding?.completed) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchableText = [
          creator.firstName,
          creator.lastName,
          creator.username,
          creator.email,
          creator.phone,
        ].filter(Boolean).join(" ").toLowerCase();
        
        if (!searchableText.includes(query)) return false;
      }

      return true;
    });
  }, [creators, approvedFilter, onboardingFilter, searchQuery]);

  const getStatusBadge = (verified, approved) => {
    if (approved && verified) {
      return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Verified & Approved</Badge>;
    } else if (approved) {
      return <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">Approved</Badge>;
    } else if (verified) {
      return <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-200">Verified</Badge>;
    } else {
      return <Badge variant="destructive">Pending</Badge>;
    }
  };

  const openCreatorDetails = (creator) => {
    setSelectedCreator(creator);
    setDialogOpen(true);
  };

  const handleCreatorUpdate = (updatedCreator) => {
    if (creators && updatedCreator) {
      setCreators(creators.map(c => 
        c._id === updatedCreator._id || c.creator_id === updatedCreator.creator_id 
          ? updatedCreator 
          : c
      ));
    }
    if (selectedCreator && updatedCreator && 
        (selectedCreator._id === updatedCreator._id || selectedCreator.creator_id === updatedCreator.creator_id)) {
      setSelectedCreator(updatedCreator);
    }
  };

  const clearFilters = () => {
    setApprovedFilter("all");
    setOnboardingFilter("all");
    setSearchQuery("");
  };

  const hasActiveFilters = approvedFilter !== "all" || 
    onboardingFilter !== "all" || 
    searchQuery !== "";

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Creators Management</h1>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Creators</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total}</div>
            <p className="text-xs text-muted-foreground">All signed up users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onboarding Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.onboardingCompleted}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.total > 0 
                ? `${Math.round((analytics.onboardingCompleted / analytics.total) * 100)}% completed`
                : "0% completed"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Creators</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.approved}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.total > 0 
                ? `${Math.round((analytics.approved / analytics.total) * 100)}% approved`
                : "0% approved"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle>Filters</CardTitle>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Approved Filter */}
            <Select value={approvedFilter} onValueChange={setApprovedFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Approval Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Approval Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="notApproved">Not Approved</SelectItem>
              </SelectContent>
            </Select>

            {/* Onboarding Filter */}
            <Select value={onboardingFilter} onValueChange={setOnboardingFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Onboarding Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Onboarding Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Creators Table */}
      <Card>
        <CardHeader>
          <CardTitle>Creators List</CardTitle>
          <CardDescription>
            Showing {filteredCreators.length} of {creators.length} creators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Onboarding</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCreators.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No creators found matching the filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCreators.map((creator) => (
                    <TableRow key={creator.creator_id || creator._id}>
                      <TableCell className="font-medium">
                        {creator.firstName} {creator.lastName}
                      </TableCell>
                      <TableCell>@{creator.username}</TableCell>
                      <TableCell>{creator.email}</TableCell>
                      <TableCell>{creator.phone || "N/A"}</TableCell>
                      <TableCell>{getStatusBadge(creator.verified, creator.approved)}</TableCell>
                      <TableCell>
                        {creator.onboarding?.completed ? (
                          <Badge variant="default" className="bg-green-500 text-white border border-green-600 rounded-md px-2 py-1">
                            <CheckCircle2 className="w-3 h-3 mr-1.5" />
                            Completed
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-500 text-blue-200 border border-black rounded-md px-2 py-1">
                            <Clock className="w-3 h-3 mr-1.5" />
                            In Progress
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openCreatorDetails(creator)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Creator Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[98vw] min-w-[70vw] max-h-[90vh] overflow-y-auto w-full px-8">
          <DialogHeader>
            <DialogTitle>Creator Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedCreator?.firstName} {selectedCreator?.lastName}
            </DialogDescription>
          </DialogHeader>
          {selectedCreator && (
            <Creator 
              creator={selectedCreator} 
              embedded 
              onCreatorUpdate={handleCreatorUpdate}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreatorsPage;

