"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { useContentAll, useCreateContent, useUpdateContent } from "@/hooks/use-dashboard";

const userSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  active: z.boolean(),
});

type UserFormValues = z.infer<typeof userSchema>;

interface Role {
  id: number;
  name: string;
}

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: { id: number; username: string; email: string; first_name: string; last_name: string; active: boolean; roles?: Role[] };
}

export function UserFormDialog({ open, onOpenChange, user }: UserFormDialogProps) {
  const isEdit = !!user;
  const createMutation = useCreateContent("user");
  const updateMutation = useUpdateContent("user");
  const { data: rolesData } = useContentAll("role", { page: 1, pageSize: 100 });
  const allRoles = (rolesData?.items ?? []) as Role[];
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: user?.username ?? "",
      email: user?.email ?? "",
      first_name: user?.first_name ?? "",
      last_name: user?.last_name ?? "",
      active: user?.active ?? true,
    },
  });

  useEffect(() => {
    if (open && user) {
      reset({ username: user.username, email: user.email, first_name: user.first_name, last_name: user.last_name, active: user.active });
      setSelectedRoleIds(user.roles?.map((r) => r.id) ?? []);
    } else if (open) {
      reset({ username: "", email: "", first_name: "", last_name: "", active: true });
      setSelectedRoleIds([]);
    }
  }, [open, user, reset]);

  const toggleRole = (roleId: number) => {
    setSelectedRoleIds((prev) => prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]);
  };

  const onSubmit = (values: UserFormValues) => {
    const payload = { ...values, role_ids: selectedRoleIds };
    if (isEdit) {
      updateMutation.mutate({ id: user!.id, data: payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>{isEdit ? "Edit User" : "New User"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Username</Label>
            <input className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm" {...register("username")} />
            {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <input className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>First Name</Label>
            <input className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm" {...register("first_name")} />
            {errors.first_name && <p className="text-sm text-destructive">{errors.first_name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Last Name</Label>
            <input className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm" {...register("last_name")} />
            {errors.last_name && <p className="text-sm text-destructive">{errors.last_name.message}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="active" checked={watch("active")} onCheckedChange={(checked) => setValue("active", !!checked)} />
            <Label htmlFor="active">Active</Label>
          </div>
          <div className="space-y-2">
            <Label>Roles</Label>
            {selectedRoleIds.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedRoleIds.map((roleId) => {
                  const role = allRoles.find((r) => r.id === roleId);
                  if (!role) return null;
                  return (
                    <Badge key={roleId} variant="secondary" className="gap-1">
                      {role.name}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => toggleRole(roleId)} />
                    </Badge>
                  );
                })}
              </div>
            )}
            <NativeSelect
              value=""
              onChange={(e) => { const id = Number(e.target.value); if (id) toggleRole(id); }}
            >
              <option value="">Select role...</option>
              {allRoles.filter((r) => !selectedRoleIds.includes(r.id)).map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </NativeSelect>
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
