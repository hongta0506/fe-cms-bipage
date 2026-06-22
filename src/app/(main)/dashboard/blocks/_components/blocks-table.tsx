"use client";

import { useState } from "react";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useContent, useDeleteContent } from "@/hooks/use-dashboard";

import { BlockDeleteDialog } from "./block-delete-dialog";
import { BlockFormDialog } from "./block-form";

interface Block {
  id: number;
  key: string;
  title: string;
  type: string;
  content: string;
  link_url: string;
  link_label: string;
  active: boolean;
  locale: string;
  domain: string;
  status: string;
  domain_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export function BlocksTable() {
  const [search, setSearch] = useState("");
  const [editBlock, setEditBlock] = useState<Block | null>(null);
  const [deleteBlock, setDeleteBlock] = useState<Block | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const { data, isLoading } = useContent("blocks", { page, pageSize, search, searchField: "title" });
  const deleteMutation = useDeleteContent("blocks");

  const blocks = (data?.items ?? []) as Block[];
  const total = data?.total ?? 0;

  const columns: ColumnDef<Block, unknown>[] = [
    { accessorKey: "title", header: "Title" },
    { accessorKey: "key", header: "Key" },
    { accessorKey: "type", header: "Type" },
    {
      accessorKey: "active",
      header: "Active",
      cell: ({ row }) => (
        <Badge variant={row.original.active ? "default" : "secondary"}>{row.original.active ? "Yes" : "No"}</Badge>
      ),
    },
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
              setEditBlock(row.original);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteBlock(row.original);
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
        data={blocks}
        isLoading={isLoading}
        searchKey="title"
        searchPlaceholder="Search blocks..."
        onSearch={(s) => { setSearch(s); setPage(1); }}
        total={total}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onPaginationChange={(p) => setPage(p)}
      />
      {editBlock && (
        <BlockFormDialog open={!!editBlock} onOpenChange={(o) => !o && setEditBlock(null)} block={editBlock} />
      )}
      {deleteBlock && (
        <BlockDeleteDialog
          open={!!deleteBlock}
          onOpenChange={(o) => !o && setDeleteBlock(null)}
          block={deleteBlock}
          onConfirm={() => deleteMutation.mutate(deleteBlock.id, { onSuccess: () => setDeleteBlock(null) })}
          isPending={deleteMutation.isPending}
        />
      )}
    </>
  );
}
