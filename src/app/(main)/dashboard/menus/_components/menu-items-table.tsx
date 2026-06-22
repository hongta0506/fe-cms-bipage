"use client";

import { useState } from "react";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useContentAll, useDeleteContent } from "@/hooks/use-dashboard";

import { MenuItemDeleteDialog } from "./menu-item-delete-dialog";
import { MenuItemFormDialog } from "./menu-item-form";

interface MenuItem {
  id: number;
  label: string;
  url: string;
  sort_order: number;
  parent_id: number | null;
  menu_id: number;
  status: string;
}

interface MenuItemsTableProps {
  onAddItem: () => void;
}

export function MenuItemsTable({ onAddItem }: MenuItemsTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<MenuItem | null>(null);
  const { data, isLoading } = useContentAll("menu_items", { page, pageSize, search });
  const deleteMutation = useDeleteContent("menu_items");

  const items = (data?.items ?? []) as MenuItem[];
  const total = data?.total ?? 0;

  const columns: ColumnDef<MenuItem, unknown>[] = [
    { accessorKey: "label", header: "Label" },
    { accessorKey: "url", header: "URL" },
    { accessorKey: "sort_order", header: "Sort Order" },
    { accessorKey: "parent_id", header: "Parent ID" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "active" ? "default" : "secondary"}>{row.original.status}</Badge>
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
              setEditItem(row.original);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteItem(row.original);
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
        data={items}
        isLoading={isLoading}
        searchKey="label"
        searchPlaceholder="Search menu items..."
        onSearch={(s) => { setSearch(s); setPage(1); }}
        total={total}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onPaginationChange={(p) => setPage(p)}
      />
      {editItem && (
        <MenuItemFormDialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)} item={editItem} items={items} />
      )}
      {deleteItem && (
        <MenuItemDeleteDialog
          open={!!deleteItem}
          onOpenChange={(o) => !o && setDeleteItem(null)}
          item={deleteItem}
          onConfirm={() => deleteMutation.mutate(deleteItem.id, { onSuccess: () => setDeleteItem(null) })}
          isPending={deleteMutation.isPending}
        />
      )}
    </>
  );
}
