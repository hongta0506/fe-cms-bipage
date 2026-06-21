"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, Pencil } from "lucide-react";
import { useAuthStore } from "@/stores/auth/auth-store";
import { useContent, useUpdateContent } from "@/hooks/use-dashboard";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type ColumnDef } from "@tanstack/react-table";

interface Setting {
  id: number;
  key: string;
  value: string;
  group: string;
  locale: string;
  status: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const [editItem, setEditItem] = useState<Setting | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.push("/auth/v1/login");
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { data, isLoading: contentLoading } = useContent("settings");
  const items = (data?.items ?? []) as Setting[];

  const columns: ColumnDef<Setting>[] = [
    { accessorKey: "key", header: "Key" },
    { accessorKey: "value", header: "Value" },
    { accessorKey: "group", header: "Group" },
    { accessorKey: "locale", header: "Locale" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variant = status === "active" ? "default" : status === "draft" ? "secondary" : "outline";
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={() => setEditItem(row.original)}>
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <h2 className="text-2xl font-bold">Settings</h2>
      <DataTable columns={columns} data={items} isLoading={contentLoading} searchKey="key" searchPlaceholder="Search by key..." />
      {editItem && <SettingEditDialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)} setting={editItem} />}
    </div>
  );
}

function SettingEditDialog({ open, onOpenChange, setting }: { open: boolean; onOpenChange: (o: boolean) => void; setting: Setting }) {
  const [value, setValue] = useState(setting.value);
  const updateMutation = useUpdateContent("settings");

  const handleSave = () => {
    updateMutation.mutate(
      { id: setting.id, data: { value } },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Edit Setting</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Key</Label>
            <Input value={setting.key} disabled />
          </div>
          <div className="space-y-2">
            <Label>Value</Label>
            <Input value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
