"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateContent, useUpdateContent } from "@/hooks/use-dashboard";

const menuSchema = z.object({
  key: z.string().min(1, "Key is required"),
  label: z.string().min(1, "Label is required"),
  location: z.string().min(1, "Location is required"),
  locale: z.enum(["vi", "en"]),
  status: z.enum(["active", "inactive"]),
});

type MenuFormValues = z.infer<typeof menuSchema>;

interface MenuFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menu?: { id: number; key: string; label: string; location: string; locale: string; status: string };
}

export function MenuFormDialog({ open, onOpenChange, menu }: MenuFormDialogProps) {
  const isEdit = !!menu;
  const createMutation = useCreateContent("menus");
  const updateMutation = useUpdateContent("menus");

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<MenuFormValues>({
    resolver: zodResolver(menuSchema),
    defaultValues: { key: "", label: "", location: "", locale: "vi", status: "active" },
  });

  useEffect(() => {
    if (open && menu) {
      reset({ key: menu.key, label: menu.label, location: menu.location, locale: menu.locale as "vi" | "en", status: menu.status as "active" | "inactive" });
    } else if (open) {
      reset({ key: "", label: "", location: "", locale: "vi", status: "active" });
    }
  }, [open, menu, reset]);

  const onSubmit = (values: MenuFormValues) => {
    if (isEdit) {
      updateMutation.mutate({ id: menu.id, data: values }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(values, { onSuccess: () => onOpenChange(false) });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Menu" : "New Menu"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="key">Key</Label>
            <input id="key" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" {...register("key")} />
            {errors.key && <p className="text-xs text-destructive">{errors.key.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="label">Label</Label>
            <input id="label" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" {...register("label")} />
            {errors.label && <p className="text-xs text-destructive">{errors.label.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <input id="location" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" {...register("location")} />
            {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label>Locale</Label>
            <Select value={watch("locale")} onValueChange={(v) => setValue("locale", v as "vi" | "en")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="vi">Vietnamese (vi)</SelectItem>
                <SelectItem value="en">English (en)</SelectItem>
              </SelectContent>
            </Select>
            {errors.locale && <p className="text-xs text-destructive">{errors.locale.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select value={watch("status")} onValueChange={(v) => setValue("status", v as "active" | "inactive")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-xs text-destructive">{errors.status.message}</p>}
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Menu"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
