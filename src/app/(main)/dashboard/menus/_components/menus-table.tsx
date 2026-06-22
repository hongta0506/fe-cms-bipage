"use client";

import { useState } from "react";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useContentAll, useDeleteContent } from "@/hooks/use-dashboard";

import { MenuDeleteDialog } from "./menu-delete-dialog";
import { MenuFormDialog } from "./menu-form";

interface Menu {
  id: number;
  key: string;
  label: string;
  location: string;
  locale: string;
  status: string;
  domain?: string;
  domain_id?: number;
}

export function MenusTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [editMenu, setEditMenu] = useState<Menu | null>(null);
  const [deleteMenu, setDeleteMenu] = useState<Menu | null>(null);
  const { data, isLoading } = useContentAll("menus", { page, pageSize, search });
  const deleteMutation = useDeleteContent("menus");

  const menus = (data?.items ?? []) as Menu[];
  const total = data?.total ?? 0;

  const columns: ColumnDef<Menu, unknown>[] = [
    { accessorKey: "key", header: "Key" },
    { accessorKey: "label", header: "Label" },
    { accessorKey: "location", header: "Location" },
    { accessorKey: "locale", header: "Locale" },
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
              setEditMenu(row.original);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteMenu(row.original);
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
        data={menus}
        isLoading={isLoading}
        searchKey="label"
        searchPlaceholder="Search menus..."
        onSearch={setSearch}
        total={total}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onPaginationChange={(p) => setPage(p)}
      />
      {editMenu && <MenuFormDialog open={!!editMenu} onOpenChange={(o) => !o && setEditMenu(null)} menu={editMenu} />}
      {deleteMenu && (
        <MenuDeleteDialog
          open={!!deleteMenu}
          onOpenChange={(o) => !o && setDeleteMenu(null)}
          menu={deleteMenu}
          onConfirm={() => deleteMutation.mutate(deleteMenu.id, { onSuccess: () => setDeleteMenu(null) })}
          isPending={deleteMutation.isPending}
        />
      )}
    </>
  );
}
