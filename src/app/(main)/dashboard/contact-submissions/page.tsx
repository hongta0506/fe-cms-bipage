"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import type { ColumnDef } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { useContent } from "@/hooks/use-dashboard";
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
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const columns: ColumnDef<ContactSubmission>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "message",
    header: "Message",
    cell: ({ row }) => {
      const message = row.getValue("message") as string;
      return <span title={message}>{message?.length > 60 ? `${message.slice(0, 60)}...` : message}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant =
        status === "active"
          ? "default"
          : status === "pending"
            ? "secondary"
            : status === "spam"
              ? "destructive"
              : "outline";
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => formatDate(row.getValue("created_at") as string),
  },
];

export default function ContactSubmissionsPage() {
  const router = useRouter();
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  useEffect(() => {
    if (!isLoading && !user) router.push("/auth/v1/login");
  }, [isLoading, user, router]);
  const { data, isLoading: contentLoading } = useContent("contact_submissions", { page, pageSize });
  if (isLoading || !user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  const items = (data?.items ?? []) as ContactSubmission[];
  const total = data?.total ?? 0;

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <h2 className="font-bold text-2xl">Contact Submissions</h2>
      <DataTable
        columns={columns}
        data={items}
        isLoading={contentLoading}
        searchKey="email"
        searchPlaceholder="Search by email..."
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
