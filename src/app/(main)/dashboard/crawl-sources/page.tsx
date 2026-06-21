"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth/auth-store";
import { useContent } from "@/hooks/use-dashboard";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { type ColumnDef } from "@tanstack/react-table";

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
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const columns: ColumnDef<CrawlSource>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "slug", header: "Slug" },
  { accessorKey: "base_url", header: "Base URL" },
  {
    accessorKey: "enabled",
    header: "Enabled",
    cell: ({ row }) => {
      const enabled = row.getValue("enabled") as boolean;
      return <Badge variant={enabled ? "default" : "secondary"}>{enabled ? "Yes" : "No"}</Badge>;
    },
  },
  {
    accessorKey: "last_status",
    header: "Last Status",
    cell: ({ row }) => {
      const status = row.getValue("last_status") as string;
      const variant = status === "success" ? "default" : status === "failed" ? "destructive" : "outline";
      return <Badge variant={variant}>{status || "-"}</Badge>;
    },
  },
  { accessorKey: "last_items_count", header: "Last Items Count" },
];

export default function CrawlSourcesPage() {
  const router = useRouter();
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
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

  const { data, isLoading: contentLoading } = useContent("crawl_sources");
  const items = (data?.items ?? []) as CrawlSource[];

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <h2 className="text-2xl font-bold">Crawl Sources</h2>
      <DataTable columns={columns} data={items} isLoading={contentLoading} searchKey="name" searchPlaceholder="Search by name..." />
    </div>
  );
}
