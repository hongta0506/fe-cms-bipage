"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface MenuItemDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: { id: number; label: string };
  onConfirm: () => void;
  isPending?: boolean;
}

export function MenuItemDeleteDialog({ open, onOpenChange, item, onConfirm, isPending }: MenuItemDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Delete Menu Item</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete <strong>{item.label}</strong>?
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
