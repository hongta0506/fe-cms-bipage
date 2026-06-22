"use client";

import { useState } from "react";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useContentAll, useDeleteContent } from "@/hooks/use-dashboard";

import { TagDeleteDialog } from "./tag-delete-dialog";
import { TagFormDialog } from "./tag-form";

interface Tag {
  id: number;
  name: string;
  slug: string;
}

export function TagsTable() {
  const [editTag, setEditTag] = useState<Tag | null>(null);
  const [deleteTag, setDeleteTag] = useState<Tag | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useContentAll("tags", { page, pageSize, search });
  const total = data?.total ?? 0;
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
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setEditTag(row.original);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTag(row.original);
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
        data={tags}
        isLoading={isLoading}
        searchKey="name"
        searchPlaceholder="Search tags..."
        onSearch={(s) => { setSearch(s); setPage(1); }}
        total={total}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onPaginationChange={(p) => setPage(p)}
      />
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
