"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useContentAll } from "@/hooks/use-dashboard";
import { useAuthStore } from "@/stores/auth/auth-store";
import { CrawlSourceDeleteDialog } from "./_components/crawl-source-delete-dialog";
import { CrawlSourceFormDialog } from "./_components/crawl-source-form";

interface CrawlSource {
  id: number;
  name: string;
  slug: string;
  base_url: string;
  enabled: boolean;
  last_crawled_at: string;
  last_status: string;
  last_items_count: number;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function CrawlSourcesPage() {
  const router = useRouter();
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<CrawlSource | null>(null);
  const [deleteItem, setDeleteItem] = useState<CrawlSource | null>(null);
  useEffect(() => {
    if (!isLoading && !user) router.push("/auth/v1/login");
  }, [isLoading, user, router]);
  const { data, isLoading: contentLoading } = useContentAll("crawl_sources", { page, pageSize, search });
  if (isLoading || !user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  const items = (data?.items ?? []) as CrawlSource[];
  const total = data?.total ?? 0;

  const columns: ColumnDef<CrawlSource>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "slug", header: "Slug" },
    { accessorKey: "base_url", header: "Base URL" },
    {
      accessorKey: "enabled", header: "Enabled",
      cell: ({ row }) => {
        const enabled = row.getValue("enabled") as boolean;
        return <Badge variant={enabled ? "default" : "secondary"}>{enabled ? "Yes" : "No"}</Badge>;
      },
    },
    {
      accessorKey: "last_status", header: "Last Status",
      cell: ({ row }) => {
        const status = row.getValue("last_status") as string;
        const variant = status === "success" ? "default" : status === "failed" ? "destructive" : "outline";
        return <Badge variant={variant}>{status || "-"}</Badge>;
      },
    },
    {
      accessorKey: "last_crawled_at", header: "Last Crawled",
      cell: ({ row }) => formatDate(row.getValue("last_crawled_at") as string),
    },
    { accessorKey: "last_items_count", header: "Items" },
    {
      id: "actions", header: "Actions",
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
        <h2 className="font-bold text-2xl">Crawl Sources</h2>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Source
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
      <CrawlSourceFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      <CrawlSourceFormDialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)} item={editItem as unknown as Record<string, unknown> ?? undefined} />
      {deleteItem && <CrawlSourceDeleteDialog open={!!deleteItem} onOpenChange={(o) => !o && setDeleteItem(null)} item={deleteItem} />}
    </div>
  );
}
