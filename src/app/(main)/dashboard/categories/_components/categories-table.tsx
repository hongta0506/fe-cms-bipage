"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useContent, useDeleteContent } from "@/hooks/use-dashboard";

import { CategoryFormDialog } from "./category-form";
import { CategoryDeleteDialog } from "./category-delete-dialog";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number | null;
}

export function CategoriesTable() {
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const { data, isLoading } = useContent("categories", { pageSize: 200 });
  const deleteMutation = useDeleteContent("categories");

  const categories = (data?.items ?? []) as Category[];
  const total = data?.total ?? 0;

  const columns: ColumnDef<Category, unknown>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "slug", header: "Slug" },
    {
      accessorKey: "parent_id",
      header: "Parent",
      cell: ({ row }) => {
        if (!row.original.parent_id) return <span className="text-muted-foreground">-</span>;
        const parent = categories.find((c) => c.id === row.original.parent_id);
        return parent?.name ?? String(row.original.parent_id);
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditCategory(row.original); }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setDeleteCategory(row.original); }}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={categories} isLoading={isLoading} searchKey="name" searchPlaceholder="Search categories..." total={total}
        filters={[
          {
            key: "parent_id",
            label: "Parent",
            placeholder: "All categories",
            options: categories
              .filter((c) => !c.parent_id)
              .map((c) => ({ label: c.name, value: String(c.id) })),
          },
        ]}
      />
      {editCategory && <CategoryFormDialog open={!!editCategory} onOpenChange={(o) => !o && setEditCategory(null)} category={editCategory} categories={categories} />}
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
