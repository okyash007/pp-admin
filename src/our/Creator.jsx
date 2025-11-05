import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  CheckCircle, 
  XCircle, 
  CreditCard, 
  FileText,
  ExternalLink,
  Calendar,
  Building,
  Hash,
  CheckCircle2,
  Loader2,
  Edit,
  Save,
  X,
  DollarSign
} from "lucide-react";

const Creator = ({ creator, onCreatorUpdate, embedded = false }) => {
  const navigate = useNavigate();
  const [identityDialogOpen, setIdentityDialogOpen] = useState(false);
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [approveSuccess, setApproveSuccess] = useState(false);
  const [isEditingRazorpay, setIsEditingRazorpay] = useState(false);
  const [razorpayAccountId, setRazorpayAccountId] = useState(creator?.razorpay_account_id || "");
  const [isSavingRazorpay, setIsSavingRazorpay] = useState(false);

  // Sync razorpay_account_id when creator prop changes
  useEffect(() => {
    setRazorpayAccountId(creator?.razorpay_account_id || "");
  }, [creator?.razorpay_account_id]);

  if (!creator) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">No creator data available</div>
      </div>
    );
  }

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

  const getRoleBadge = (role) => {
    const roleColors = {
      admin: "bg-purple-100 text-purple-800 border-purple-200",
      creator: "bg-blue-100 text-blue-800 border-blue-200",
      user: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return (
      <Badge variant="outline" className={roleColors[role] || roleColors.user}>
        {role?.charAt(0).toUpperCase() + role?.slice(1)}
      </Badge>
    );
  };

  const handleUpdateRazorpayAccountId = async () => {
    if (!creator?._id) {
      console.error('Creator ID not found');
      return;
    }

    setIsSavingRazorpay(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/creator/profile/${creator._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_account_id: razorpayAccountId.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update Razorpay account ID');
      }

      const result = await response.json();
      // Handle ApiResponse structure: { data: {...}, message: "...", statusCode: ... }
      const updatedCreator = result.data || result;
      
      // Call the parent component's update function if provided
      if (onCreatorUpdate) {
        onCreatorUpdate(updatedCreator);
      }
      
      setIsEditingRazorpay(false);
      console.log('Razorpay account ID updated successfully:', updatedCreator);
    } catch (error) {
      console.error('Error updating Razorpay account ID:', error);
      alert(`Error updating Razorpay account ID: ${error.message}`);
    } finally {
      setIsSavingRazorpay(false);
    }
  };

  const handleCancelEditRazorpay = () => {
    setRazorpayAccountId(creator?.razorpay_account_id || "");
    setIsEditingRazorpay(false);
  };

  const handleApproveCreator = async () => {
    if (!creator?._id) {
      console.error('Creator ID not found');
      return;
    }

    // Check if razorpay_account_id exists
    if (!creator.razorpay_account_id && !razorpayAccountId.trim()) {
      alert('Please add Razorpay Account ID before verifying the creator.');
      return;
    }

    setIsApproving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/creator/verify/${creator._id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve creator');
      }

      const result = await response.json();
      // Handle ApiResponse structure: { data: { creator: {...}, overlay: {...}, ... }, message: "...", statusCode: ... }
      const responseData = result.data || result;
      const updatedCreator = responseData.creator || responseData;
      
      // Call the parent component's update function if provided
      if (onCreatorUpdate) {
        onCreatorUpdate(updatedCreator);
      }
      
      // Show success message
      setApproveSuccess(true);
      setTimeout(() => setApproveSuccess(false), 3000); // Hide after 3 seconds
      
      console.log('Creator approved successfully:', updatedCreator);
    } catch (error) {
      console.error('Error approving creator:', error);
      alert(`Error approving creator: ${error.message}`);
    } finally {
      setIsApproving(false);
    }
  };

  const profileHeader = (
    <div className={`bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 ${embedded ? 'p-4 rounded-lg' : 'p-4 md:p-6'}`}>
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative shrink-0">
            <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
              <AvatarImage src={creator.image?.src} alt={`${creator.firstName} ${creator.lastName}`} />
              <AvatarFallback className="text-lg font-semibold">
                {creator.firstName?.[0]}{creator.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            {creator.verified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-white">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">
              {creator.firstName} {creator.lastName}
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 truncate">
              @{creator.username}
            </p>
            <div className="flex items-center flex-wrap gap-2 mt-2">
              {getStatusBadge(creator.verified, creator.approved)}
              {getRoleBadge(creator.role)}
            </div>
          </div>
        </div>
        <div className="text-left sm:text-right w-full sm:w-auto">
          <div className="text-sm text-gray-500 dark:text-gray-400">Creator ID</div>
          <div className="font-mono text-base md:text-lg font-semibold break-all">{creator.creator_id}</div>
        </div>
      </div>
    </div>
  );

  const mainContent = (
    <div className={`${embedded ? 'px-2 py-4 md:px-4 md:py-6' : 'px-4 py-4 md:px-6 md:py-6'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <User className="w-5 h-5 mr-2" />
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{creator.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{creator.phone}</span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <ExternalLink className="w-5 h-5 mr-2" />
                Social Links
              </h3>
              <div className="space-y-2">
                {creator.socials?.map((social, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium capitalize">{social.platform}:</span>
                    <a 
                      href={social.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 truncate"
                    >
                      {social.url}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Onboarding Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Onboarding Status
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-medium">Step Completed</span>
                <span className="text-lg font-bold text-blue-600">{creator.onboarding?.step || 0}/3</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-medium">Status</span>
                <div className="flex items-center">
                  {creator.onboarding?.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mr-1" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${creator.onboarding?.completed ? 'text-green-600' : 'text-red-600'}`}>
                    {creator.onboarding?.completed ? 'Completed' : 'Incomplete'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-medium">Updated</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {creator.onboarding?.updatedAt ? new Date(creator.onboarding.updatedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Razorpay Account ID Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Razorpay Account ID
            </h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {isEditingRazorpay ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Razorpay Account ID
                    </label>
                    <Input
                      type="text"
                      value={razorpayAccountId}
                      onChange={(e) => setRazorpayAccountId(e.target.value)}
                      placeholder="Enter Razorpay Account ID (e.g., acc_xxxxx)"
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpdateRazorpayAccountId}
                      disabled={isSavingRazorpay}
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      {isSavingRazorpay ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>{isSavingRazorpay ? 'Saving...' : 'Save'}</span>
                    </Button>
                    <Button
                      onClick={handleCancelEditRazorpay}
                      disabled={isSavingRazorpay}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {creator.razorpay_account_id || razorpayAccountId ? (
                      <div className="space-y-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Account ID</span>
                        <div className="font-mono text-base font-medium break-all">
                          {creator.razorpay_account_id || razorpayAccountId}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400">No Razorpay Account ID added</span>
                        <div className="text-sm text-amber-600 dark:text-amber-400">
                          Please add Razorpay Account ID before verifying the creator
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => setIsEditingRazorpay(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2 ml-4"
                  >
                    <Edit className="w-4 h-4" />
                    <span>{creator.razorpay_account_id || razorpayAccountId ? 'Edit' : 'Add'}</span>
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Success Message */}
          {approveSuccess && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-green-800 dark:text-green-200 font-medium">
                Creator approved successfully!
              </span>
            </div>
          )}

          {/* Warning Message if Razorpay Account ID is missing */}
          {!creator.approved && !(creator.razorpay_account_id || razorpayAccountId.trim()) && (
            <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span className="text-amber-800 dark:text-amber-200 font-medium">
                Please add Razorpay Account ID before verifying the creator.
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {/* Approve Button - Only show if creator is not approved */}
            {!creator.approved && (
              <Button 
                onClick={handleApproveCreator}
                disabled={isApproving || !(creator.razorpay_account_id || razorpayAccountId.trim())}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isApproving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>{isApproving ? 'Approving...' : 'Approve Creator'}</span>
              </Button>
            )}
            
            {/* Payout Button - Only show if creator is approved */}
            {creator.approved && (
              <Button 
                onClick={() => navigate(`/payout/${creator.creator_id}`)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <DollarSign className="w-4 h-4" />
                <span>Payout</span>
              </Button>
            )}
            
            <Dialog open={identityDialogOpen} onOpenChange={setIdentityDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>View Identity Details</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Identity Verification Details
                  </DialogTitle>
                  <DialogDescription>
                    Personal and legal information for identity verification
                  </DialogDescription>
                </DialogHeader>
                
                {creator.onboarding?.identity && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">Type</label>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-sm font-medium capitalize">
                            {creator.onboarding.identity.type}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">Legal Name</label>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-sm font-medium">
                            {creator.onboarding.identity.legal_name}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">PAN Number</label>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-sm font-mono font-medium">
                            {creator.onboarding.identity.pan_number}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">GST IN</label>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-sm font-medium">
                            {creator.onboarding.identity.gst_in || 'Not provided'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold">Document Images</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {creator.onboarding.identity.pan_image && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500">PAN Image</label>
                            <div className="border rounded-lg overflow-hidden">
                              <img
                                src={creator.onboarding.identity.pan_image}
                                alt="PAN Document"
                                className="w-full h-48 object-cover"
                              />
                            </div>
                          </div>
                        )}
                        {creator.onboarding.identity.gst_in_image && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500">GST IN Image</label>
                            <div className="border rounded-lg overflow-hidden">
                              <img
                                src={creator.onboarding.identity.gst_in_image}
                                alt="GST IN Document"
                                className="w-full h-48 object-cover"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <Dialog open={bankDialogOpen} onOpenChange={setBankDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4" />
                  <span>View Bank Details</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Bank Account Details
                  </DialogTitle>
                  <DialogDescription>
                    Banking information for payouts and transactions
                  </DialogDescription>
                </DialogHeader>
                
                {creator.onboarding?.bank_account && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">Account Holder Name</label>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-sm font-medium">
                            {creator.onboarding.bank_account.name}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">Bank Name</label>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-sm font-medium">
                            {creator.onboarding.bank_account.bank_name}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">Account Number</label>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-sm font-mono font-medium">
                            {creator.onboarding.bank_account.account_number}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">IFSC Code</label>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-sm font-mono font-medium">
                            {creator.onboarding.bank_account.ifsc_code}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {creator.onboarding.bank_account.account_image && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">Account Document</label>
                        <div className="border rounded-lg overflow-hidden">
                          <img
                            src={creator.onboarding.bank_account.account_image}
                            alt="Bank Account Document"
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
    </div>
  );

  // If embedded (used in dialog), return without outer card
  if (embedded) {
    return (
      <>
        {profileHeader}
        {mainContent}
      </>
    );
  }

  // Otherwise, wrap in card for standalone use
  return (
    <Card className="overflow-hidden space-y-6">
      <CardHeader className="p-0">
        {profileHeader}
      </CardHeader>
      <CardContent className="p-0">
        {mainContent}
      </CardContent>
    </Card>
  );
};

export default Creator;
