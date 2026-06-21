"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth/auth-store";
import { useContent } from "@/hooks/use-dashboard";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { type ColumnDef } from "@tanstack/react-table";

interface Domain {
  id: number;
  slug: string;
  name: string;
  hostnames: string;
  default_locale: string;
  active: boolean;
  status: string;
}

const columns: ColumnDef<Domain>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "slug", header: "Slug" },
  { accessorKey: "hostnames", header: "Hostnames" },
  { accessorKey: "default_locale", header: "Default Locale" },
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
];

export default function DomainsPage() {
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

  const { data, isLoading: contentLoading } = useContent("domains");
  const items = (data?.items ?? []) as Domain[];

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <h2 className="text-2xl font-bold">Domains</h2>
      <DataTable columns={columns} data={items} isLoading={contentLoading} searchKey="name" searchPlaceholder="Search by name..." />
    </div>
  );
}
