"use client";

import { useState } from "react";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useContentAll, useDeleteContent } from "@/hooks/use-dashboard";

import { RoleDeleteDialog } from "./role-delete-dialog";
import { RoleFormDialog } from "./role-form";

interface Role {
  id: number;
  name: string;
  description: string;
  root: boolean;
  created_at: string;
}

export function RolesTable() {
  const [search, setSearch] = useState("");
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [deleteRole, setDeleteRole] = useState<Role | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const { data, isLoading } = useContentAll("role", { page, pageSize, search });
  const total = data?.total ?? 0;
  const deleteMutation = useDeleteContent("role");

  const roles = (data?.items ?? []) as Role[];

  const columns: ColumnDef<Role, unknown>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "description", header: "Description" },
    {
      accessorKey: "root",
      header: "Root",
      cell: ({ row }) => (
        <Badge variant={row.original.root ? "default" : "secondary"}>{row.original.root ? "Root" : "Normal"}</Badge>
      ),
    },
    { accessorKey: "created_at", header: "Created At" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setEditRole(row.original);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteRole(row.original);
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={roles}
        isLoading={isLoading}
        searchKey="name"
        searchPlaceholder="Search roles..."
        onSearch={setSearch}
        total={total}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onPaginationChange={(p) => setPage(p)}
      />
      {editRole && <RoleFormDialog open={!!editRole} onOpenChange={(o) => !o && setEditRole(null)} role={editRole} />}
      {deleteRole && (
        <RoleDeleteDialog
          open={!!deleteRole}
          onOpenChange={(o) => !o && setDeleteRole(null)}
          role={deleteRole}
          onConfirm={() => deleteMutation.mutate(deleteRole.id, { onSuccess: () => setDeleteRole(null) })}
          isPending={deleteMutation.isPending}
        />
      )}
    </>
  );
}
