"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateContent, useUpdateContent } from "@/hooks/use-dashboard";

const menuItemSchema = z.object({
  label: z.string().min(1, "Label is required"),
  url: z.string().min(1, "URL is required"),
  category_slug: z.string().optional(),
  sort_order: z.number().int().min(0, "Sort order must be non-negative"),
  parent_id: z.number().int().nullable(),
  menu_id: z.number().int().min(1, "Menu ID is required"),
  status: z.enum(["active", "inactive"]),
});

type MenuItemFormValues = z.infer<typeof menuItemSchema>;

interface MenuItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: { id: number; label: string; url: string; category_slug?: string; sort_order: number; parent_id: number | null; menu_id: number; status: string };
  items?: { id: number; label: string; parent_id?: number | null }[];
}

export function MenuItemFormDialog({ open, onOpenChange, item, items = [] }: MenuItemFormDialogProps) {
  const isEdit = !!item;
  const createMutation = useCreateContent("menu_items");
  const updateMutation = useUpdateContent("menu_items");

  const { handleSubmit, reset, setValue, watch, register, formState: { errors } } = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: { label: "", url: "", category_slug: "", sort_order: 0, parent_id: null, menu_id: 1, status: "active" },
  });

  useEffect(() => {
    if (open && item) {
      reset({
        label: item.label,
        url: item.url,
        category_slug: item.category_slug ?? "",
        sort_order: item.sort_order,
        parent_id: item.parent_id,
        menu_id: item.menu_id,
        status: item.status as "active" | "inactive",
      });
    } else if (open) {
      reset({ label: "", url: "", category_slug: "", sort_order: 0, parent_id: null, menu_id: 1, status: "active" });
    }
  }, [open, item, reset]);

  const onSubmit = (values: MenuItemFormValues) => {
    if (isEdit) {
      updateMutation.mutate({ id: item.id, data: values }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(values, { onSuccess: () => onOpenChange(false) });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Menu Item" : "New Menu Item"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="label">Label</Label>
            <input id="label" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" {...register("label")} />
            {errors.label && <p className="text-xs text-destructive">{errors.label.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="url">URL</Label>
            <input id="url" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" {...register("url")} />
            {errors.url && <p className="text-xs text-destructive">{errors.url.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category_slug">Category Slug</Label>
            <input id="category_slug" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" {...register("category_slug")} />
            {errors.category_slug && <p className="text-xs text-destructive">{errors.category_slug.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sort_order">Sort Order</Label>
            <input id="sort_order" type="number" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" {...register("sort_order", { valueAsNumber: true })} />
            {errors.sort_order && <p className="text-xs text-destructive">{errors.sort_order.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label>Parent Item</Label>
            <NativeSelect
              value={watch("parent_id") ?? ""}
              onChange={(e) => setValue("parent_id", e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">None (root)</option>
              {items
                .filter((i) => i.id !== item?.id && !Number(i.parent_id))
                .map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.label}
                  </option>
                ))}
            </NativeSelect>
            {errors.parent_id && <p className="text-xs text-destructive">{errors.parent_id.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="menu_id">Menu ID</Label>
            <input id="menu_id" type="number" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" {...register("menu_id", { valueAsNumber: true })} />
            {errors.menu_id && <p className="text-xs text-destructive">{errors.menu_id.message}</p>}
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
              {isEdit ? "Save Changes" : "Create Menu Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
