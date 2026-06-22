"use client";

import { useState } from "react";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useContent, useDeleteContent } from "@/hooks/use-dashboard";

import { BannerDeleteDialog } from "./banner-delete-dialog";
import { BannerFormDialog } from "./banner-form";

interface Banner {
  id: number;
  key: string;
  title: string;
  image: string;
  link_url: string;
  position: string;
  sort_order: number;
  active: boolean;
  locale: string;
  domain: string;
  status: string;
  domain_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export function BannersTable() {
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [deleteBanner, setDeleteBanner] = useState<Banner | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useContent("banners", { page, pageSize, search });
  const total = data?.total ?? 0;
  const deleteMutation = useDeleteContent("banners");

  const banners = (data?.items ?? []) as Banner[];

  const columns: ColumnDef<Banner, unknown>[] = [
    { accessorKey: "title", header: "Title" },
    { accessorKey: "position", header: "Position" },
    {
      accessorKey: "active",
      header: "Active",
      cell: ({ row }) => (
        <Badge variant={row.original.active ? "default" : "secondary"}>{row.original.active ? "Yes" : "No"}</Badge>
      ),
    },
    { accessorKey: "sort_order", header: "Sort" },
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
              setEditBanner(row.original);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteBanner(row.original);
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
        data={banners}
        isLoading={isLoading}
        searchKey="title"
        searchPlaceholder="Search banners..."
        total={total}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onPaginationChange={(p) => setPage(p)}
      />
      {editBanner && (
        <BannerFormDialog open={!!editBanner} onOpenChange={(o) => !o && setEditBanner(null)} banner={editBanner} />
      )}
      {deleteBanner && (
        <BannerDeleteDialog
          open={!!deleteBanner}
          onOpenChange={(o) => !o && setDeleteBanner(null)}
          banner={deleteBanner}
          onConfirm={() => deleteMutation.mutate(deleteBanner.id, { onSuccess: () => setDeleteBanner(null) })}
          isPending={deleteMutation.isPending}
        />
      )}
    </>
  );
}
