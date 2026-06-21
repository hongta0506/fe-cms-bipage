"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import type { ColumnDef } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { useContent } from "@/hooks/use-dashboard";
import { useAuthStore } from "@/stores/auth/auth-store";

interface Session {
  id: number;
  user_id: number;
  device_info: string;
  ip_address: string;
  last_activity_at: string;
  status: string;
  expires_at: string;
  created_at: string;
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

const columns: ColumnDef<Session>[] = [
  { accessorKey: "user_id", header: "User ID" },
  { accessorKey: "ip_address", header: "IP Address" },
  { accessorKey: "device_info", header: "Device" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant = status === "active" ? "default" : status === "expired" ? "destructive" : "outline";
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: "last_activity_at",
    header: "Last Activity",
    cell: ({ row }) => formatDate(row.getValue("last_activity_at") as string),
  },
  {
    accessorKey: "expires_at",
    header: "Expires At",
    cell: ({ row }) => formatDate(row.getValue("expires_at") as string),
  },
];

export default function SessionsPage() {
  const router = useRouter();
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const { data, isLoading: contentLoading } = useContent("session", { page, pageSize });
  const items = (data?.items ?? []) as Session[];
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

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <h2 className="font-bold text-2xl">Sessions</h2>
      <DataTable
        columns={columns}
        data={items}
        isLoading={contentLoading}
        searchKey="ip_address"
        searchPlaceholder="Search by IP..."
        total={total}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onPaginationChange={(p) => setPage(p)}
      />
    </div>
  );
}
