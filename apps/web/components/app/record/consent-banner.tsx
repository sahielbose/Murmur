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
import { Switch } from "@/components/ui/switch";

/**
 * One-time recording-consent notice shown before the first capture
 * (MURMUR_CONTEXT.md §13; original copy MURMUR_UI.md §13). The "others were
 * informed" toggle is optional and logged.
 */
export function ConsentBanner({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: (othersInformed: boolean) => void;
  onCancel: () => void;
}) {
  const [informed, setInformed] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Before you record</DialogTitle>
          <DialogDescription>
            Recording laws vary by location, and many require everyone&apos;s
            consent. You&apos;re responsible for getting it - Murmur shows this
            reminder once, and is a tool rather than legal advice.
          </DialogDescription>
        </DialogHeader>

        <label className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
          <span className="text-sm text-fg">
            Everyone here knows they&apos;re being recorded
          </span>
          <Switch
            checked={informed}
            onCheckedChange={setInformed}
            aria-label="Others were informed"
          />
        </label>

        <DialogFooter>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm(informed)}>Got it - start</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
