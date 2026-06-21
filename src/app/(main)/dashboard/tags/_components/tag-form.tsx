"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { SlugInput } from "@/components/ui/slug-input";
import { useCreateContent, useUpdateContent } from "@/hooks/use-dashboard";

const tagSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
});

type TagFormValues = z.infer<typeof tagSchema>;

interface TagFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag?: { id: number; name: string; slug: string };
}

export function TagFormDialog({ open, onOpenChange, tag }: TagFormDialogProps) {
  const isEdit = !!tag;
  const createMutation = useCreateContent("tags");
  const updateMutation = useUpdateContent("tags");
  const [name, setName] = useState(tag?.name ?? "");

  const { handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<TagFormValues>({
    resolver: zodResolver(tagSchema),
    defaultValues: { name: tag?.name ?? "", slug: tag?.slug ?? "" },
  });

  useEffect(() => {
    if (open && tag) {
      reset({ name: tag.name, slug: tag.slug });
      setName(tag.name);
    } else if (open) {
      reset({ name: "", slug: "" });
      setName("");
    }
  }, [open, tag, reset]);

  const onSubmit = (values: TagFormValues) => {
    if (isEdit) {
      updateMutation.mutate({ id: tag.id, data: values }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(values, { onSuccess: () => onOpenChange(false) });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>{isEdit ? "Edit Tag" : "New Tag"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <input className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm" value={name} onChange={(e) => setName(e.target.value)} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <SlugInput title={name} value={watch("slug")} onChange={(v) => setValue("slug", v)} prefix="/tags/" />
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
