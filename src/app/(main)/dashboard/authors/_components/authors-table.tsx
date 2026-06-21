"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useContent, useDeleteContent } from "@/hooks/use-dashboard";

import { AuthorFormDialog } from "./author-form";
import { AuthorDeleteDialog } from "./author-delete-dialog";

interface Author {
  id: number;
  username: string;
  display_name: string;
  created_at: string;
}

export function AuthorsTable() {
  const [editAuthor, setEditAuthor] = useState<Author | null>(null);
  const [deleteAuthor, setDeleteAuthor] = useState<Author | null>(null);
  const { data, isLoading } = useContent("authors", { pageSize: 200 });
  const deleteMutation = useDeleteContent("authors");

  const authors = (data?.items ?? []) as Author[];

  const columns: ColumnDef<Author, unknown>[] = [
    { accessorKey: "username", header: "Username" },
    { accessorKey: "display_name", header: "Display Name" },
    { accessorKey: "created_at", header: "Created At" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditAuthor(row.original); }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setDeleteAuthor(row.original); }}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={authors} isLoading={isLoading} searchKey="username" searchPlaceholder="Search authors..." />
      {editAuthor && <AuthorFormDialog open={!!editAuthor} onOpenChange={(o) => !o && setEditAuthor(null)} author={editAuthor} />}
      {deleteAuthor && (
        <AuthorDeleteDialog
          open={!!deleteAuthor}
          onOpenChange={(o) => !o && setDeleteAuthor(null)}
          author={deleteAuthor}
          onConfirm={() => deleteMutation.mutate(deleteAuthor.id, { onSuccess: () => setDeleteAuthor(null) })}
          isPending={deleteMutation.isPending}
        />
      )}
    </>
  );
}
