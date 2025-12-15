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
  Clock,
  Crown
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
  const [subscriptionFilter, setSubscriptionFilter] = useState("all");
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
    const proUsers = creators.filter(c => c.subscription_status === "pro").length;
    
    return {
      total,
      approved,
      onboardingCompleted,
      verified,
      proUsers,
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

      // Subscription filter
      if (subscriptionFilter === "pro" && creator.subscription_status !== "pro") return false;
      if (subscriptionFilter === "free" && creator.subscription_status !== "free") return false;

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
  }, [creators, approvedFilter, onboardingFilter, subscriptionFilter, searchQuery]);

  const getStatusBadge = (verified, approved) => {
    if (approved && verified) {
      return <Badge className="bg-green-500 text-white border border-green-600 rounded-md px-2 py-1 font-black">Verified & Approved</Badge>;
    } else if (approved) {
      return <Badge className="bg-blue-500 text-white border border-blue-600 rounded-md px-2 py-1 font-black">Approved</Badge>;
    } else if (verified) {
      return <Badge className="bg-yellow-500 text-white border border-yellow-600 rounded-md px-2 py-1 font-black">Verified</Badge>;
    } else {
      return <Badge className="bg-red-500 text-white border border-red-600 rounded-md px-2 py-1 font-black">Pending</Badge>;
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

  const handleCreatorDelete = (creatorId) => {
    // Remove the creator from the list
    setCreators(creators.filter(c => 
      c._id !== creatorId && c.creator_id !== creatorId
    ));
    // Close the dialog
    setDialogOpen(false);
    setSelectedCreator(null);
    // Refresh the list to ensure consistency
    fetchCreators();
  };

  const clearFilters = () => {
    setApprovedFilter("all");
    setOnboardingFilter("all");
    setSubscriptionFilter("all");
    setSearchQuery("");
  };

  const hasActiveFilters = approvedFilter !== "all" || 
    onboardingFilter !== "all" || 
    subscriptionFilter !== "all" ||
    searchQuery !== "";

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-black text-black uppercase tracking-tight">Total Creators</CardTitle>
            <div className="h-10 w-10 bg-linear-to-br from-[#828BF8] to-[#5C66D4] border-[3px] border-black rounded-lg flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-black">{analytics.total}</div>
            <p className="text-xs font-bold text-black/60 mt-1">All signed up users</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-black text-black uppercase tracking-tight">Onboarding Completed</CardTitle>
            <div className="h-10 w-10 bg-linear-to-br from-[#AAD6B8] to-[#7FB896] border-[3px] border-black rounded-lg flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-black">{analytics.onboardingCompleted}</div>
            <p className="text-xs font-bold text-black/60 mt-1">
              {analytics.total > 0 
                ? `${Math.round((analytics.onboardingCompleted / analytics.total) * 100)}% completed`
                : "0% completed"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-black text-black uppercase tracking-tight">Approved Creators</CardTitle>
            <div className="h-10 w-10 bg-linear-to-br from-[#FEF18C] to-[#FEF18C]/80 border-[3px] border-black rounded-lg flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <UserCheck className="h-5 w-5 text-black" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-black">{analytics.approved}</div>
            <p className="text-xs font-bold text-black/60 mt-1">
              {analytics.total > 0 
                ? `${Math.round((analytics.approved / analytics.total) * 100)}% approved`
                : "0% approved"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-black text-black uppercase tracking-tight">Pro Users</CardTitle>
            <div className="h-10 w-10 bg-linear-to-br from-[#A855F7] to-[#9333EA] border-[3px] border-black rounded-lg flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <Crown className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-black">{analytics.proUsers}</div>
            <p className="text-xs font-bold text-black/60 mt-1">
              {analytics.total > 0 
                ? `${Math.round((analytics.proUsers / analytics.total) * 100)}% pro users`
                : "0% pro users"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <Card className="bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader className="bg-linear-to-r from-[#828BF8] to-[#828BF8]/90 border-b-[3px] border-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-white" />
              <CardTitle className="text-white font-black uppercase tracking-tight">Filters</CardTitle>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 bg-white hover:bg-[#FEF18C] text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black z-10" />
              <Input
                placeholder="Search creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white border-[3px] border-black focus:border-[#828BF8] focus:ring-0 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-none font-bold"
              />
            </div>

            {/* Approved Filter */}
            <Select value={approvedFilter} onValueChange={setApprovedFilter}>
              <SelectTrigger className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:border-[#828BF8]">
                <SelectValue placeholder="Approval Status" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <SelectItem value="all">All Approval Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="notApproved">Not Approved</SelectItem>
              </SelectContent>
            </Select>

            {/* Onboarding Filter */}
            <Select value={onboardingFilter} onValueChange={setOnboardingFilter}>
              <SelectTrigger className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:border-[#828BF8]">
                <SelectValue placeholder="Onboarding Status" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <SelectItem value="all">All Onboarding Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
              </SelectContent>
            </Select>

            {/* Subscription Filter */}
            <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
              <SelectTrigger className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:border-[#828BF8]">
                <SelectValue placeholder="Subscription Status" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <SelectItem value="all">All Subscription Status</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="free">Free</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Creators Table */}
      <Card className="bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader className="bg-linear-to-r from-[#828BF8] to-[#828BF8]/90 border-b-[3px] border-black">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white font-black uppercase tracking-tight">Creators List</CardTitle>
            <CardDescription className="text-[#FEF18C] font-bold text-sm">
              Showing {filteredCreators.length} of {creators.length} creators
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-t-[3px] border-black">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#FEF18C]/20 border-b-2 border-black">
                  <TableHead className="font-black text-black uppercase text-xs border-r-2 border-black">Name</TableHead>
                  <TableHead className="font-black text-black uppercase text-xs border-r-2 border-black">Username</TableHead>
                  <TableHead className="font-black text-black uppercase text-xs border-r-2 border-black">Email</TableHead>
                  <TableHead className="font-black text-black uppercase text-xs border-r-2 border-black">Phone</TableHead>
                  <TableHead className="font-black text-black uppercase text-xs border-r-2 border-black">Status</TableHead>
                  <TableHead className="font-black text-black uppercase text-xs border-r-2 border-black">Subscription</TableHead>
                  <TableHead className="font-black text-black uppercase text-xs border-r-2 border-black">Onboarding</TableHead>
                  <TableHead className="font-black text-black uppercase text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCreators.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-black/60 font-bold border-b-2 border-black">
                      No creators found matching the filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCreators.map((creator, index) => (
                    <TableRow 
                      key={creator.creator_id || creator._id}
                      className={`border-b-2 border-black hover:bg-[#FEF18C]/10 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-[#FEF18C]/5'
                      }`}
                    >
                      <TableCell className="font-black text-black border-r-2 border-black">
                        {creator.firstName} {creator.lastName}
                      </TableCell>
                      <TableCell className="font-bold text-black border-r-2 border-black">@{creator.username}</TableCell>
                      <TableCell className="text-black border-r-2 border-black">{creator.email}</TableCell>
                      <TableCell className="text-black border-r-2 border-black">{creator.phone || "N/A"}</TableCell>
                      <TableCell className="border-r-2 border-black">{getStatusBadge(creator.verified, creator.approved)}</TableCell>
                      <TableCell className="border-r-2 border-black">
                        <Badge 
                          className={
                            creator.subscription_status === "pro" 
                              ? "bg-purple-500 text-white border border-purple-600 rounded-md px-2 py-1 font-black" 
                              : "bg-gray-500 text-white border border-gray-600 rounded-md px-2 py-1 font-black"
                          }
                        >
                          {creator.subscription_status === "pro" ? "PRO" : "FREE"}
                        </Badge>
                      </TableCell>
                      <TableCell className="border-r-2 border-black">
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
                          className="bg-white hover:bg-[#828BF8] hover:text-white text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200"
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
        <DialogContent className="max-w-[98vw] min-w-[70vw] max-h-[90vh] overflow-y-auto w-full px-8 bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <DialogHeader className="bg-linear-to-r from-[#828BF8] to-[#828BF8]/90 border-b-[3px] border-black -mx-8 -mt-8 px-8 pt-6 pb-4 mb-6">
            <DialogTitle className="text-white font-black uppercase tracking-tight text-2xl">Creator Details</DialogTitle>
            <DialogDescription className="text-[#FEF18C] font-bold mt-2">
              Complete information for {selectedCreator?.firstName} {selectedCreator?.lastName}
            </DialogDescription>
          </DialogHeader>
          {selectedCreator && (
            <Creator 
              creator={selectedCreator} 
              embedded 
              onCreatorUpdate={handleCreatorUpdate}
              onCreatorDelete={handleCreatorDelete}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreatorsPage;

