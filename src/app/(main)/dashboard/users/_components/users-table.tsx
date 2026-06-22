"use client";

import { useState } from "react";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useContentAll, useDeleteContent } from "@/hooks/use-dashboard";

import { UserDeleteDialog } from "./user-delete-dialog";
import { UserFormDialog } from "./user-form";

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  active: boolean;
  created_at: string;
  roles?: { id: number; name: string }[];
}

export function UsersTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const { data, isLoading } = useContentAll("user", { page, pageSize, search });
  const deleteMutation = useDeleteContent("user");

  const users = (data?.items ?? []) as User[];
  const total = data?.total ?? 0;

  const columns: ColumnDef<User, unknown>[] = [
    { accessorKey: "username", header: "Username" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "first_name", header: "First Name" },
    { accessorKey: "last_name", header: "Last Name" },
    {
      accessorKey: "active",
      header: "Active",
      cell: ({ row }) => (
        <Badge variant={row.original.active ? "default" : "secondary"}>
          {row.original.active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "roles",
      header: "Roles",
      cell: ({ row }) => {
        const roles = row.original.roles ?? [];
        if (roles.length === 0) return <span className="text-muted-foreground">-</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {roles.map((r) => (
              <Badge key={r.id} variant="outline">{r.name}</Badge>
            ))}
          </div>
        );
      },
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
              setEditUser(row.original);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteUser(row.original);
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
        data={users}
        isLoading={isLoading}
        searchKey="username"
        searchPlaceholder="Search users..."
        onSearch={setSearch}
        total={total}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onPaginationChange={(p) => setPage(p)}
      />
      {editUser && <UserFormDialog open={!!editUser} onOpenChange={(o) => !o && setEditUser(null)} user={editUser} />}
      {deleteUser && (
        <UserDeleteDialog
          open={!!deleteUser}
          onOpenChange={(o) => !o && setDeleteUser(null)}
          user={deleteUser}
          onConfirm={() => deleteMutation.mutate(deleteUser.id, { onSuccess: () => setDeleteUser(null) })}
          isPending={deleteMutation.isPending}
        />
      )}
    </>
  );
}
