"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useCreateContent, useUpdateContent } from "@/hooks/use-dashboard";

const authorSchema = z.object({
  username: z.string().min(1, "Username is required"),
  display_name: z.string().min(1, "Display name is required"),
});

type AuthorFormValues = z.infer<typeof authorSchema>;

interface AuthorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  author?: { id: number; username: string; display_name: string };
}

export function AuthorFormDialog({ open, onOpenChange, author }: AuthorFormDialogProps) {
  const isEdit = !!author;
  const createMutation = useCreateContent("authors");
  const updateMutation = useUpdateContent("authors");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AuthorFormValues>({
    resolver: zodResolver(authorSchema),
    defaultValues: { username: author?.username ?? "", display_name: author?.display_name ?? "" },
  });

  useEffect(() => {
    if (open && author) {
      reset({ username: author.username, display_name: author.display_name });
    } else if (open) {
      reset({ username: "", display_name: "" });
    }
  }, [open, author, reset]);

  const onSubmit = (values: AuthorFormValues) => {
    if (isEdit) {
      updateMutation.mutate({ id: author.id, data: values }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(values, { onSuccess: () => onOpenChange(false) });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>{isEdit ? "Edit Author" : "New Author"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Username</Label>
            <input className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm" {...register("username")} />
            {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Display Name</Label>
            <input className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm" {...register("display_name")} />
            {errors.display_name && <p className="text-sm text-destructive">{errors.display_name.message}</p>}
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
