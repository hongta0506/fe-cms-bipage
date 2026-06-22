"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useContentAll, useDeleteContent, useUpdateContent } from "@/hooks/use-dashboard";
import { useAuthStore } from "@/stores/auth/auth-store";

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
  const [deleteItem, setDeleteItem] = useState<Setting | null>(null);
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const deleteMutation = useDeleteContent("settings");

  const { data, isLoading: contentLoading } = useContentAll("settings", { page, pageSize: 500, search, searchField: "key" });
  const allItems = (data?.items ?? []) as Setting[];
  const items = groupFilter === "all" ? allItems : allItems.filter((i) => i.group === groupFilter);
  const total = items.length;
  const groups = [...new Set(allItems.map((i) => i.group))];

  useEffect(() => {
    if (!isLoading && !user) router.push("/auth/v1/login");
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setEditItem(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteItem(row.original)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <h2 className="font-bold text-2xl">Settings</h2>
      <DataTable
        columns={columns}
        data={items}
        isLoading={contentLoading}
        searchKey="key"
        searchPlaceholder="Search by key..."
        onSearch={(s) => { setSearch(s); setPage(1); }}
        filters={[{ key: "group", label: "Group", options: groups.map((g) => ({ label: g, value: g })) }]}
        total={total}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onPaginationChange={(p) => setPage(p)}
      />
      {editItem && (
        <SettingEditDialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)} setting={editItem} />
      )}
      {deleteItem && (
        <Dialog open={!!deleteItem} onOpenChange={(o) => !o && setDeleteItem(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete Setting</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <strong>{deleteItem.key}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteItem(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteMutation.mutate(deleteItem.id, { onSuccess: () => setDeleteItem(null) })} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function SettingEditDialog({
  open,
  onOpenChange,
  setting,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  setting: Setting;
}) {
  const [value, setValue] = useState(setting.value);
  const updateMutation = useUpdateContent("settings");

  const handleSave = () => {
    updateMutation.mutate({ id: setting.id, data: { value } }, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Setting</DialogTitle>
        </DialogHeader>
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
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
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
