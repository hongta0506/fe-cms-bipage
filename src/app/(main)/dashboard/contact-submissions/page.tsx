"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth/auth-store";
import { useContent } from "@/hooks/use-dashboard";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { type ColumnDef } from "@tanstack/react-table";

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
      return (
        <span title={message}>
          {message?.length > 60 ? message.slice(0, 60) + "..." : message}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant = status === "active" ? "default" : status === "pending" ? "secondary" : status === "spam" ? "destructive" : "outline";
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

  const { data, isLoading: contentLoading } = useContent("contact_submissions");
  const items = (data?.items ?? []) as ContactSubmission[];

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <h2 className="text-2xl font-bold">Contact Submissions</h2>
      <DataTable columns={columns} data={items} isLoading={contentLoading} searchKey="email" searchPlaceholder="Search by email..." />
    </div>
  );
}
