"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface TagDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag: { id: number; name: string };
  onConfirm: () => void;
  isPending?: boolean;
}

export function TagDeleteDialog({ open, onOpenChange, tag, onConfirm, isPending }: TagDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Delete Tag</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete <strong>{tag.name}</strong>?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
