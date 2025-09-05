
"use client";

import { useState, useTransition } from "react";
import type { UserProfile } from "@/lib/types";
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
import { updateUserProfileAction } from "@/app/actions";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userProfile: UserProfile;
  onProfileUpdate: () => void;
}

export function ProfileDialog({ open, onOpenChange, userProfile, onProfileUpdate }: ProfileDialogProps) {
  const [username, setUsername] = useState(userProfile.username || "");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateUserProfileAction(userProfile.id, { username });
      
      if (result.success) {
        toast({
          title: "Success!",
          description: "Your profile has been updated.",
        });
        onProfileUpdate();
        onOpenChange(false);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>My Profile</DialogTitle>
          <DialogDescription>
            View your details and set a unique username to enable sharing.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input id="email" value={userProfile.email} disabled className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="col-span-3"
              placeholder="e.g., spacecat99"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={isPending || username === (userProfile.username || '')}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
