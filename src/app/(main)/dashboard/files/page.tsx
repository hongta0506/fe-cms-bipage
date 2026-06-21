"use client";

import { useCallback, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useContentAll, useDeleteContent } from "@/hooks/use-dashboard";
import { useAuthStore } from "@/stores/auth/auth-store";

interface FileItem {
  id: number;
  disk: string;
  name: string;
  path: string;
  type: string;
  size: number;
  user_id: number;
  created_at: string;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatSize(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export default function FilesPage() {
  const router = useRouter();
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [uploading, setUploading] = useState(false);
  const [deleteItem, setDeleteItem] = useState<FileItem | null>(null);
  const deleteMutation = useDeleteContent("file");

  const columns: ColumnDef<FileItem>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "type", header: "Type" },
    { accessorKey: "disk", header: "Disk" },
    { accessorKey: "size", header: "Size", cell: ({ row }) => formatSize(row.getValue("size") as number) },
    { accessorKey: "created_at", header: "Created", cell: ({ row }) => formatDate(row.getValue("created_at") as string) },
    {
      id: "actions", header: "Actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={() => setDeleteItem(row.original)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];
  useEffect(() => {
    if (!isLoading && !user) router.push("/auth/v1/login");
  }, [isLoading, user, router]);
  const { data, isLoading: contentLoading } = useContentAll("file", { page, pageSize });
  const items = (data?.items ?? []) as FileItem[];
  const total = data?.total ?? 0;

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = useAuthStore.getState().token;
      await fetch(`${process.env.NEXT_PUBLIC_FASTSCHEMA_URL || "https://api.bipage.net"}/api/file/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      window.location.reload();
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  }, []);

  if (isLoading || !user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-2xl">Files</h2>
        <div>
          <input type="file" id="file-upload" className="hidden" onChange={handleUpload} />
          <Button asChild disabled={uploading}>
            <label htmlFor="file-upload" className="cursor-pointer">
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Upload
            </label>
          </Button>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={items}
        isLoading={contentLoading}
        searchKey="name"
        searchPlaceholder="Search by name..."
        total={total}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onPaginationChange={(p) => setPage(p)}
      />
      {deleteItem && (
        <Dialog open={!!deleteItem} onOpenChange={(o) => !o && setDeleteItem(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete File</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <strong>{deleteItem.name}</strong>?
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
