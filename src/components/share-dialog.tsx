
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

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course;
  fromUserId: string;
}

export function ShareDialog({ open, onOpenChange, course, fromUserId }: ShareDialogProps) {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    if (!username.trim()) {
      toast({ variant: "destructive", title: "Username required", description: "Please enter a username to share with." });
      return;
    }
    setIsLoading(true);
    const result = await shareCourseAction(fromUserId, username, course.id);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: "Success!",
        description: result.message,
      });
      onOpenChange(false);
      setUsername("");
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
            Share "{course.topic}" with another user by entering their unique username.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="col-span-3"
              placeholder="e.g., learncat123"
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
