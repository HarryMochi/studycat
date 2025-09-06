"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { shareCourseAction } from "@/app/actions";
import type { Course } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course;
}

export function ShareDialog({ open, onOpenChange, course }: ShareDialogProps) {
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleShare = async () => {
    if (!user) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to share." });
        return;
    }
    if (!userId.trim()) {
      toast({ variant: "destructive", title: "User ID required", description: "Please enter a User ID to share with." });
      return;
    }
    setIsLoading(true);
    const result = await shareCourseAction(user.uid, userId.trim(), course.id);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: "Success!",
        description: result.message,
      });
      onOpenChange(false);
      setUserId("");
    } else {
      toast({
        variant: "destructive",
        title: "Error Sharing",
        description: result.message,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Course</DialogTitle>
          <DialogDescription>
            Share "{course.topic}" with another user by entering their unique User ID.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="userId" className="text-right">
              User ID
            </Label>
            <Input
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="col-span-3"
              placeholder="Paste the user's ID here"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleShare} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
