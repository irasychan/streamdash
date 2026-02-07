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
import { Textarea } from "@/components/ui/textarea";
import { PlatformBadge } from "./PlatformBadge";
import type { ChatPlatform } from "../types/chat";

type BanConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason?: string) => void;
  username: string;
  platform: ChatPlatform;
};

export function BanConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  username,
  platform,
}: BanConfirmDialogProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirm(reason.trim() || undefined);
    setReason("");
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setReason("");
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlatformBadge platform={platform} />
            Ban {username}?
          </DialogTitle>
          <DialogDescription>
            This will permanently ban the user from the channel. This action
            cannot be undone from the dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label
            htmlFor="ban-reason"
            className="text-sm font-medium text-muted-foreground"
          >
            Reason (optional)
          </label>
          <Textarea
            id="ban-reason"
            placeholder="Enter a reason for the ban..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="resize-none"
            rows={2}
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Ban {username}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
