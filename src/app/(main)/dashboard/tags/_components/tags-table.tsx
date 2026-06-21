"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useContent, useDeleteContent } from "@/hooks/use-dashboard";

import { TagFormDialog } from "./tag-form";
import { TagDeleteDialog } from "./tag-delete-dialog";

interface Tag {
  id: number;
  name: string;
  slug: string;
}

export function TagsTable() {
  const [editTag, setEditTag] = useState<Tag | null>(null);
  const [deleteTag, setDeleteTag] = useState<Tag | null>(null);
  const { data, isLoading } = useContent("tags", { pageSize: 200 });
  const deleteMutation = useDeleteContent("tags");

  const tags = (data?.items ?? []) as Tag[];

  const columns: ColumnDef<Tag, unknown>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "slug", header: "Slug" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditTag(row.original); }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setDeleteTag(row.original); }}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={tags} isLoading={isLoading} searchKey="name" searchPlaceholder="Search tags..." />
      {editTag && <TagFormDialog open={!!editTag} onOpenChange={(o) => !o && setEditTag(null)} tag={editTag} />}
      {deleteTag && (
        <TagDeleteDialog
          open={!!deleteTag}
          onOpenChange={(o) => !o && setDeleteTag(null)}
          tag={deleteTag}
          onConfirm={() => deleteMutation.mutate(deleteTag.id, { onSuccess: () => setDeleteTag(null) })}
          isPending={deleteMutation.isPending}
        />
      )}
    </>
  );
}
