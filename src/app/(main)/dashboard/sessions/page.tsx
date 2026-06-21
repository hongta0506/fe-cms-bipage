"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth/auth-store";
import { useContent } from "@/hooks/use-dashboard";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { type ColumnDef } from "@tanstack/react-table";

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

  const { data, isLoading: contentLoading } = useContent("session");
  const items = (data?.items ?? []) as Session[];

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <h2 className="text-2xl font-bold">Sessions</h2>
      <DataTable columns={columns} data={items} isLoading={contentLoading} searchKey="ip_address" searchPlaceholder="Search by IP..." />
    </div>
  );
}
