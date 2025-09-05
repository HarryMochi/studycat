
"use client";

import type { ShareRequest } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Check, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface InboxSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requests: ShareRequest[];
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
}

export function InboxSheet({ open, onOpenChange, requests, onAccept, onDecline }: InboxSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>My Inbox</SheetTitle>
          <SheetDescription>
            Accept or decline course sharing requests here.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100%-4rem)] mt-4 pr-4">
          {requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((req) => (
                <div key={req.id} className="p-4 border rounded-lg bg-muted/50">
                  <p className="font-semibold text-sm">
                    <span className="font-bold">{req.fromUsername}</span> wants to share the course:
                  </p>
                  <p className="font-bold text-primary truncate my-1">
                    {req.courseTopic}
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={() => onAccept(req.id)} size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                        <Check className="mr-2 h-4 w-4" /> Accept
                    </Button>
                    <Button onClick={() => onDecline(req.id)} size="sm" variant="destructive" className="flex-1">
                        <X className="mr-2 h-4 w-4" /> Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <p className="font-semibold">Your inbox is empty</p>
              <p className="text-sm">New share requests will appear here.</p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
