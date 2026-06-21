"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateContent, useUpdateContent } from "@/hooks/use-dashboard";

const bannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  key: z.string().min(1, "Key is required"),
  image: z.string().min(1, "Image is required"),
  link_url: z.string().optional(),
  position: z.string().optional(),
  sort_order: z.number().int().optional(),
  active: z.boolean(),
});

type BannerFormValues = z.infer<typeof bannerSchema>;

interface BannerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banner?: {
    id: number;
    title: string;
    key: string;
    image: string;
    link_url: string;
    position: string;
    sort_order: number;
    active: boolean;
  };
}

export function BannerFormDialog({ open, onOpenChange, banner }: BannerFormDialogProps) {
  const isEdit = !!banner;
  const createMutation = useCreateContent("banners");
  const updateMutation = useUpdateContent("banners");

  const { handleSubmit, register, reset, watch, setValue, formState: { errors } } = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: banner?.title ?? "",
      key: banner?.key ?? "",
      image: banner?.image ?? "",
      link_url: banner?.link_url ?? "",
      position: banner?.position ?? "",
      sort_order: banner?.sort_order ?? 0,
      active: banner?.active ?? true,
    },
  });

  useEffect(() => {
    if (open && banner) {
      reset({
        title: banner.title,
        key: banner.key,
        image: banner.image,
        link_url: banner.link_url,
        position: banner.position,
        sort_order: banner.sort_order,
        active: banner.active,
      });
    } else if (open) {
      reset({ title: "", key: "", image: "", link_url: "", position: "", sort_order: 0, active: true });
    }
  }, [open, banner, reset]);

  const onSubmit = (values: BannerFormValues) => {
    if (isEdit) {
      updateMutation.mutate({ id: banner.id, data: values }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(values, { onSuccess: () => onOpenChange(false) });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEdit ? "Edit Banner" : "New Banner"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input {...register("title")} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Key</Label>
            <Input {...register("key")} />
            {errors.key && <p className="text-sm text-destructive">{errors.key.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Image URL</Label>
            <Input {...register("image")} />
            {errors.image && <p className="text-sm text-destructive">{errors.image.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Link URL</Label>
            <Input {...register("link_url")} />
          </div>
          <div className="space-y-2">
            <Label>Position</Label>
            <Input {...register("position")} />
          </div>
          <div className="space-y-2">
            <Label>Sort Order</Label>
            <Input type="number" {...register("sort_order", { valueAsNumber: true })} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={watch("active")} onCheckedChange={(checked) => setValue("active", !!checked)} />
            <Label>Active</Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
