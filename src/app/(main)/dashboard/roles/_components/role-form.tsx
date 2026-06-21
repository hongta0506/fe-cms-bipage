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
import { useCreateContent, useUpdateContent } from "@/hooks/use-dashboard";

const roleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  root: z.boolean(),
});

type RoleFormValues = z.infer<typeof roleSchema>;

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: { id: number; name: string; description: string; root: boolean };
}

export function RoleFormDialog({ open, onOpenChange, role }: RoleFormDialogProps) {
  const isEdit = !!role;
  const createMutation = useCreateContent("role");
  const updateMutation = useUpdateContent("role");

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: role?.name ?? "",
      description: role?.description ?? "",
      root: role?.root ?? false,
    },
  });

  useEffect(() => {
    if (open && role) {
      reset({ name: role.name, description: role.description, root: role.root });
    } else if (open) {
      reset({ name: "", description: "", root: false });
    }
  }, [open, role, reset]);

  const onSubmit = (values: RoleFormValues) => {
    if (isEdit) {
      updateMutation.mutate({ id: role.id, data: values }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(values, { onSuccess: () => onOpenChange(false) });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>{isEdit ? "Edit Role" : "New Role"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <input className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <input className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm" {...register("description")} />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="root" checked={watch("root")} onCheckedChange={(checked) => setValue("root", !!checked)} />
            <Label htmlFor="root">Root</Label>
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
