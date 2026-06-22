"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useAuthStore } from "@/stores/auth/auth-store";
import { useContentAll } from "@/hooks/use-dashboard";
import { DomainDeleteDialog } from "./_components/domain-delete-dialog";
import { DomainFormDialog } from "./_components/domain-form";

interface Domain {
  id: number;
  slug: string;
  name: string;
  hostnames: string;
  default_locale: string;
  active: boolean;
  status: string;
}

export default function DomainsPage() {
  const router = useRouter();
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Domain | null>(null);
  const [deleteItem, setDeleteItem] = useState<Domain | null>(null);
  const { data, isLoading: contentLoading } = useContentAll("domains", { page, pageSize, search });
  const items = (data?.items ?? []) as Domain[];
  const total = data?.total ?? 0;

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

  const columns: ColumnDef<Domain>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "slug", header: "Slug" },
    { accessorKey: "hostnames", header: "Hostnames" },
    { accessorKey: "default_locale", header: "Locale" },
    {
      accessorKey: "active",
      header: "Active",
      cell: ({ row }) => {
        const active = row.getValue("active") as boolean;
        return <Badge variant={active ? "default" : "secondary"}>{active ? "Yes" : "No"}</Badge>;
      },
    },
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
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-2xl">Domains</h2>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Domain
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={items}
        isLoading={contentLoading}
        searchKey="name"
        searchPlaceholder="Search by name..."
        onSearch={setSearch}
        total={total}
        pageSize={pageSize}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        onPaginationChange={(p) => setPage(p)}
      />
      <DomainFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      <DomainFormDialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)} domain={(editItem as unknown as Record<string, unknown>) ?? undefined} />
      {deleteItem && <DomainDeleteDialog open={!!deleteItem} onOpenChange={(o) => !o && setDeleteItem(null)} domain={deleteItem} />}
    </div>
  );
}
