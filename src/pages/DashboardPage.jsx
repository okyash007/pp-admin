import React from "react";
import { useEffect } from "react";
import { useState } from "react";
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
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Creator from "../our/Creator";

async function getCreators() {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/creator/all`
  );
  const data = await response.json();
  return data;
}

const DashboardPage = () => {
  const [creators, setCreators] = useState(null);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  useEffect(() => {
    getCreators().then((data) => {
      setCreators(data.data);
    });
  }, []);

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
    // Update the creator in the list
    if (creators && updatedCreator) {
      setCreators(creators.map(c => 
        c._id === updatedCreator._id || c.creator_id === updatedCreator.creator_id 
          ? updatedCreator 
          : c
      ));
    }
    // Update selected creator if it's the same one
    if (selectedCreator && updatedCreator && 
        (selectedCreator._id === updatedCreator._id || selectedCreator.creator_id === updatedCreator.creator_id)) {
      setSelectedCreator(updatedCreator);
    }
  };

  if (!creators) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Creators Dashboard</h1>
      
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
            {creators.map((creator) => (
              <TableRow key={creator.creator_id}>
                <TableCell className="font-medium">
                  {creator.firstName} {creator.lastName}
                </TableCell>
                <TableCell>@{creator.username}</TableCell>
                <TableCell>{creator.email}</TableCell>
                <TableCell>{creator.phone}</TableCell>
                <TableCell>{getStatusBadge(creator.verified, creator.approved)}</TableCell>
                <TableCell>
                  {creator.onboarding?.completed ? (
                    <span className="text-green-600">Completed</span>
                  ) : (
                    <span className="text-orange-600">In Progress</span>
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
            ))}
          </TableBody>
        </Table>
      </div>

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

export default DashboardPage;
