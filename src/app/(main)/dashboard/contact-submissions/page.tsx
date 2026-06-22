"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NativeSelect } from "@/components/ui/native-select";
import { useContentAll, useDeleteContent, useUpdateContent } from "@/hooks/use-dashboard";
import { useAuthStore } from "@/stores/auth/auth-store";

interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  message: string;
  ip: string;
  locale: string;
  domain_slug: string;
  status: string;
  created_at: string;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function ContactSubmissionsPage() {
  const router = useRouter();
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [detailItem, setDetailItem] = useState<ContactSubmission | null>(null);
  const [deleteItem, setDeleteItem] = useState<ContactSubmission | null>(null);
  const deleteMutation = useDeleteContent("contact_submissions");

  useEffect(() => {
    if (!isLoading && !user) router.push("/auth/v1/login");
  }, [isLoading, user, router]);
  const { data, isLoading: contentLoading } = useContentAll("contact_submissions", { page, pageSize, search });

  if (isLoading || !user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const items = (data?.items ?? []) as ContactSubmission[];
  const total = data?.total ?? 0;

  const columns: ColumnDef<ContactSubmission>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "message", header: "Message",
      cell: ({ row }) => {
        const msg = row.getValue("message") as string;
        return <span title={msg}>{msg?.length > 60 ? `${msg.slice(0, 60)}...` : msg}</span>;
      },
    },
    {
      accessorKey: "status", header: "Status",
      cell: ({ row }) => {
        const s = row.getValue("status") as string;
        const v = s === "active" ? "default" : s === "pending" ? "secondary" : s === "spam" ? "destructive" : "outline";
        return <Badge variant={v}>{s}</Badge>;
      },
    },
    {
      accessorKey: "created_at", header: "Created",
      cell: ({ row }) => formatDate(row.getValue("created_at") as string),
    },
    {
      id: "actions", header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setDetailItem(row.original)}>View</Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteItem(row.original)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <h2 className="font-bold text-2xl">Contact Submissions</h2>
      <DataTable
        columns={columns}
        data={items}
        isLoading={contentLoading}
        searchKey="email"
        searchPlaceholder="Search by email..."
        onSearch={setSearch}
        filters={[{ key: "status", label: "Status", options: [{ label: "Active", value: "active" }, { label: "Pending", value: "pending" }, { label: "Spam", value: "spam" }, { label: "Closed", value: "closed" }] }]}
        total={total}
        pageSize={pageSize}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        onPaginationChange={(p) => setPage(p)}
      />
      {detailItem && (
        <ContactDetailDialog open={!!detailItem} onOpenChange={(o) => !o && setDetailItem(null)} item={detailItem} />
      )}
      {deleteItem && (
        <Dialog open={!!deleteItem} onOpenChange={(o) => !o && setDeleteItem(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Delete Submission</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">Delete submission from <strong>{deleteItem.name}</strong>?</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteItem(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteMutation.mutate(deleteItem.id, { onSuccess: () => setDeleteItem(null) })} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function ContactDetailDialog({ open, onOpenChange, item }: { open: boolean; onOpenChange: (o: boolean) => void; item: ContactSubmission }) {
  const updateMutation = useUpdateContent("contact_submissions");
  const [status, setStatus] = useState(item.status);

  const handleStatusChange = () => {
    updateMutation.mutate({ id: item.id, data: { status } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Contact Submission #{item.id}</DialogTitle></DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div><span className="font-medium">Name:</span> {item.name}</div>
            <div><span className="font-medium">Email:</span> {item.email}</div>
            <div><span className="font-medium">IP:</span> {item.ip}</div>
            <div><span className="font-medium">Domain:</span> {item.domain_slug}</div>
            <div><span className="font-medium">Locale:</span> {item.locale}</div>
            <div><span className="font-medium">Created:</span> {formatDate(item.created_at)}</div>
          </div>
          <div>
            <span className="font-medium">Message:</span>
            <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{item.message}</p>
          </div>
          <div className="flex items-center gap-3 pt-2 border-t">
            <span className="font-medium">Status:</span>
            <NativeSelect value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="spam">Spam</option>
              <option value="closed">Closed</option>
            </NativeSelect>
            <Button size="sm" onClick={handleStatusChange} disabled={updateMutation.isPending || status === item.status}>
              {updateMutation.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />} Update
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
