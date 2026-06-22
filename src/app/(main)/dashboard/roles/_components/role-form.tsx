"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { useCreateContent, useUpdateContent } from "@/hooks/use-dashboard";
import { ALL_RESOURCES, RolePermissions } from "./role-permissions";

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

interface PermissionRecord {
  id: number;
  role_id: number;
  resource: string;
  value: string;
}

export function RoleFormDialog({ open, onOpenChange, role }: RoleFormDialogProps) {
  const isEdit = !!role;
  const createMutation = useCreateContent("role");
  const updateMutation = useUpdateContent("role");

  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [existingPermissions, setExistingPermissions] = useState<PermissionRecord[]>([]);
  const [loadingPerms, setLoadingPerms] = useState(false);

  // Fetch permissions for this role when editing
  useEffect(() => {
    if (open && isEdit && role) {
      setLoadingPerms(true);
      api
        .getContent("permission", { filter: JSON.stringify({ role_id: role.id }), pageSize: 1000 })
        .then((res) => {
          const items = res.items as PermissionRecord[];
          setExistingPermissions(items);
          setSelectedResources(items.map((p) => p.resource));
        })
        .catch(() => {
          setExistingPermissions([]);
          setSelectedResources([]);
        })
        .finally(() => setLoadingPerms(false));
    } else if (open) {
      setExistingPermissions([]);
      setSelectedResources([]);
    }
  }, [open, isEdit, role]);

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

  const handleToggle = (resource: string) => {
    setSelectedResources((prev) =>
      prev.includes(resource) ? prev.filter((r) => r !== resource) : [...prev, resource]
    );
  };

  const onSubmit = async (values: RoleFormValues) => {
    if (!isEdit || !role) {
      createMutation.mutate(values, { onSuccess: () => onOpenChange(false) });
      return;
    }

    // Compute permissions to add and remove
    const toAdd = selectedResources.filter((r) => !existingPermissions.some((p) => p.resource === r));
    const toRemove = existingPermissions.filter((p) => !selectedResources.includes(p.resource));

    // Update role basic info
    updateMutation.mutate(
      { id: role.id, data: values },
      {
        onSuccess: async () => {
          // Create new permission records
          const createPromises = toAdd.map((resource) =>
            api.createContent("permission", { role_id: role.id, resource, value: "allow" })
          );
          // Delete removed permission records
          const deletePromises = toRemove.map((p) => api.deleteContent("permission", p.id));

          await Promise.all([...createPromises, ...deletePromises]);
          onOpenChange(false);
        },
      }
    );
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Role" : "New Role"}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="basic">
          <TabsList>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>
          <TabsContent value="basic">
            <form id="role-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <input
                  id="name"
                  {...register("name")}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <input
                  id="description"
                  {...register("description")}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="root" checked={watch("root")} onCheckedChange={(checked) => {
                  setValue("root", !!checked);
                  if (checked) {
                    setSelectedResources([...ALL_RESOURCES]);
                  } else {
                    setSelectedResources([]);
                  }
                }} />
                <Label htmlFor="root" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Root (Full Access)
                </Label>
              </div>
            </form>
          </TabsContent>
          <TabsContent value="permissions">
            <div className="py-4">
              {loadingPerms ? (
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading permissions...
                </div>
              ) : (
                <RolePermissions selectedResources={selectedResources} onToggle={handleToggle} />
              )}
            </div>
          </TabsContent>
        </Tabs>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="role-form" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
