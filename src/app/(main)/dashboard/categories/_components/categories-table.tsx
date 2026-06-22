"use client";

import { useState } from "react";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useContentAll, useDeleteContent } from "@/hooks/use-dashboard";

import { CategoryDeleteDialog } from "./category-delete-dialog";
import { CategoryFormDialog } from "./category-form";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number | null;
  domain_id?: string | number;
}

export function CategoriesTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const { data, isLoading } = useContentAll("categories", { page, pageSize, search, searchField: "name" });
  const { data: domainsData } = useContentAll("domains", { pageSize: 100 });
  const deleteMutation = useDeleteContent("categories");

  const categories = (data?.items ?? []) as Category[];
  const domains = (domainsData?.items ?? []) as { id: number; name: string }[];
  const domainMap = Object.fromEntries(domains.map((d) => [String(d.id), d.name]));
  const total = data?.total ?? 0;

  const columns: ColumnDef<Category, unknown>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "slug", header: "Slug" },
    {
      accessorKey: "parent_id",
      header: "Parent",
      cell: ({ row }) => {
        if (!row.original.parent_id) return <span className="text-muted-foreground">-</span>;
        const pid = Number(row.original.parent_id);
        const parent = categories.find((c) => c.id === pid);
        return parent?.name ?? String(row.original.parent_id);
      },
    },
    {
      accessorKey: "domain_id",
      header: "Domain",
      cell: ({ row }) => domainMap[String(row.original.domain_id)] ?? "-",
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
              setEditCategory(row.original);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteCategory(row.original);
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
        data={categories}
        isLoading={isLoading}
        searchKey="name"
        searchPlaceholder="Tìm danh mục..."
        onSearch={(s) => { setSearch(s); setPage(1); }}
        total={total}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onPaginationChange={(p) => setPage(p)}
        filters={[
          {
            key: "parent_id",
            label: "Danh mục cha",
            placeholder: "Tất cả danh mục",
            options: categories.filter((c) => !c.parent_id).map((c) => ({ label: c.name, value: String(c.id) })),
          },
          {
            key: "domain_id",
            label: "Tên miền",
            placeholder: "Tất cả tên miền",
            options: domains.map((d) => ({ label: d.name, value: String(d.id) })),
          },
        ]}
      />
      {editCategory && (
        <CategoryFormDialog
          open={!!editCategory}
          onOpenChange={(o) => !o && setEditCategory(null)}
          category={editCategory as unknown as Record<string, unknown>}
          categories={categories}
        />
      )}
      {deleteCategory && (
        <CategoryDeleteDialog
          open={!!deleteCategory}
          onOpenChange={(o) => !o && setDeleteCategory(null)}
          category={deleteCategory}
          onConfirm={() => deleteMutation.mutate(deleteCategory.id, { onSuccess: () => setDeleteCategory(null) })}
          isPending={deleteMutation.isPending}
        />
      )}
    </>
  );
}
