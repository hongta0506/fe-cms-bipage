"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { SlugInput } from "@/components/ui/slug-input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateContent, useUpdateContent } from "@/hooks/use-dashboard";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  parent_id: z.number().nullable().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

/** Extract ID from value that may be a nested object or flat number/string. */
function extractId(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v) || null;
  if (typeof v === "object" && "id" in v) return (v as { id: number }).id;
  return null;
}

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Record<string, unknown>;
  categories?: { id: number; name: string; parent_id?: number | null }[];
}

export function CategoryFormDialog({ open, onOpenChange, category, categories = [] }: CategoryFormDialogProps) {
  const isEdit = !!category;
  const createMutation = useCreateContent("categories");
  const updateMutation = useUpdateContent("categories");
  const [name, setName] = useState((category?.name as string) ?? "");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: (category?.name as string) ?? "",
      slug: (category?.slug as string) ?? "",
      description: (category?.description as string) ?? "",
      parent_id: extractId(category?.parent_id ?? category?.parent),
    },
  });

  useEffect(() => {
    if (open && category) {
      reset({
        name: (category.name as string) ?? "",
        slug: (category.slug as string) ?? "",
        description: (category.description as string) ?? "",
        parent_id: extractId(category.parent_id ?? category.parent),
      });
      setName((category.name as string) ?? "");
    } else if (open) {
      reset({ name: "", slug: "", description: "", parent_id: null });
      setName("");
    }
  }, [open, category, reset]);

  const onSubmit = (values: CategoryFormValues) => {
    if (isEdit) {
      updateMutation.mutate({ id: category?.id as number, data: values }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(values, { onSuccess: () => onOpenChange(false) });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: "800px" }}>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Category" : "New Category"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              {...register("name")}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                register("name").onChange(e);
              }}
            />
            {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
          </div>
          <SlugInput
            title={name}
            value={watch("slug") as string}
            onChange={(v) => setValue("slug", v)}
            prefix="/categories/"
          />
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea {...register("description")} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Parent Category</Label>
            <NativeSelect
              value={watch("parent_id") ?? ""}
              onChange={(e) => setValue("parent_id", e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">None (root)</option>
              {categories
                .filter((c) => c.id !== category?.id && !Number(c.parent_id))
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </NativeSelect>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
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
