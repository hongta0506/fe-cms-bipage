"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateContent, useUpdateContent } from "@/hooks/use-dashboard";

const blockSchema = z.object({
  title: z.string().min(1, "Title is required"),
  key: z.string().min(1, "Key is required"),
  type: z.string().min(1, "Type is required"),
  content: z.string().optional(),
  link_url: z.string().optional(),
  link_label: z.string().optional(),
  active: z.boolean(),
});

type BlockFormValues = z.infer<typeof blockSchema>;

interface BlockFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  block?: { id: number; title: string; key: string; type: string; content: string; link_url: string; link_label: string; active: boolean };
}

export function BlockFormDialog({ open, onOpenChange, block }: BlockFormDialogProps) {
  const isEdit = !!block;
  const createMutation = useCreateContent("blocks");
  const updateMutation = useUpdateContent("blocks");

  const { handleSubmit, register, reset, watch, setValue, formState: { errors } } = useForm<BlockFormValues>({
    resolver: zodResolver(blockSchema),
    defaultValues: {
      title: block?.title ?? "",
      key: block?.key ?? "",
      type: block?.type ?? "html",
      content: block?.content ?? "",
      link_url: block?.link_url ?? "",
      link_label: block?.link_label ?? "",
      active: block?.active ?? true,
    },
  });

  useEffect(() => {
    if (open && block) {
      reset({
        title: block.title,
        key: block.key,
        type: block.type,
        content: block.content,
        link_url: block.link_url,
        link_label: block.link_label,
        active: block.active,
      });
    } else if (open) {
      reset({ title: "", key: "", type: "html", content: "", link_url: "", link_label: "", active: true });
    }
  }, [open, block, reset]);

  const onSubmit = (values: BlockFormValues) => {
    if (isEdit) {
      updateMutation.mutate({ id: block.id, data: values }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(values, { onSuccess: () => onOpenChange(false) });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: "800px" }}>
        <DialogHeader><DialogTitle>{isEdit ? "Edit Block" : "New Block"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <input className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm" {...register("title")} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Key</Label>
            <input className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm" {...register("key")} />
            {errors.key && <p className="text-sm text-destructive">{errors.key.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={watch("type")} onValueChange={(v) => setValue("type", v)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="image">Image</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Content</Label>
            <textarea className="flex min-h-[100px] w-full rounded-md border bg-transparent px-3 py-2 text-sm" {...register("content")} />
          </div>
          <div className="space-y-2">
            <Label>Link URL</Label>
            <input className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm" {...register("link_url")} />
          </div>
          <div className="space-y-2">
            <Label>Link Label</Label>
            <input className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm" {...register("link_label")} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="active" checked={watch("active")} onCheckedChange={(checked) => setValue("active", !!checked)} />
            <Label htmlFor="active">Active</Label>
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
