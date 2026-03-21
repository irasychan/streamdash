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

const MAX_REASON_LENGTH = 500;

const REASON_PRESETS = ["Spam", "Harassment", "Advertising", "Other"] as const;

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

  const handlePreset = (preset: string) => {
    setReason(preset);
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
            This will permanently ban the user from the channel. This action cannot be undone from
            the dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label htmlFor="ban-reason" className="text-sm font-medium text-muted-foreground">
            Reason (optional)
          </label>

          {/* Preset reason chips */}
          <div className="flex flex-wrap gap-1.5">
            {REASON_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePreset(preset)}
                className="rounded-full border border-border/60 px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground"
              >
                {preset}
              </button>
            ))}
          </div>

          <Textarea
            id="ban-reason"
            placeholder="Enter a reason for the ban..."
            value={reason}
            onChange={(e) => setReason(e.target.value.slice(0, MAX_REASON_LENGTH))}
            className="resize-none"
            rows={2}
          />

          {/* Character count */}
          <div className="text-right text-[11px] text-muted-foreground/50">
            {reason.length}/{MAX_REASON_LENGTH}
          </div>
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
