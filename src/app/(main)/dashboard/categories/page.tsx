"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Plus, LayoutList, Network } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAuthStore } from "@/stores/auth/auth-store";
import { useContent, useDeleteContent } from "@/hooks/use-dashboard";
import { TreeView, buildTree } from "@/components/ui/tree-view";

import { CategoriesTable } from "./_components/categories-table";
import { CategoryFormDialog } from "./_components/category-form";
import { CategoryDeleteDialog } from "./_components/category-delete-dialog";
import { Pencil, Trash2 } from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number | null;
  [key: string]: unknown;
}

export default function CategoriesPage() {
  const router = useRouter();
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState<"table" | "tree">("table");
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);

  const { data, isLoading: dataLoading } = useContent("categories", { pageSize: 500 });
  const deleteMutation = useDeleteContent("categories");

  const categories = (data?.items ?? []) as Category[];
  const treeData = buildTree(categories, "id", "parent_id", "name");

  useEffect(() => {
    if (!isLoading && !user) router.push("/auth/v1/login");
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Categories ({categories.length})</h2>
        <div className="flex items-center gap-3">
          <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as "table" | "tree")}>
            <ToggleGroupItem value="table" aria-label="Table view">
              <LayoutList className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="tree" aria-label="Tree view">
              <Network className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Category
          </Button>
        </div>
      </div>

      {view === "table" ? (
        <CategoriesTable />
      ) : (
        <TreeView
          data={treeData}
          showCount
          renderActions={(node) => (
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setEditCategory(node as unknown as Category)}>
                <Pencil className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setDeleteCategory(node as unknown as Category)}>
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          )}
        />
      )}

      <CategoryFormDialog open={showForm} onOpenChange={setShowForm} />
      {editCategory && (
        <CategoryFormDialog open={!!editCategory} onOpenChange={(o) => !o && setEditCategory(null)} category={editCategory} categories={categories} />
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
    </div>
  );
}
