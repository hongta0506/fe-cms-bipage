"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { LayoutList, Loader2, Network, Pencil, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { buildTree, TreeView } from "@/components/ui/tree-view";
import { useContentAll, useDeleteContent } from "@/hooks/use-dashboard";
import { useAuthStore } from "@/stores/auth/auth-store";

import { MenuFormDialog } from "./_components/menu-form";
import { MenuItemDeleteDialog } from "./_components/menu-item-delete-dialog";
import { MenuItemFormDialog } from "./_components/menu-item-form";
import { MenuItemsTable } from "./_components/menu-items-table";
import { MenusTable } from "./_components/menus-table";

interface MenuItem {
  id: number;
  label: string;
  url: string;
  sort_order: number;
  parent_id: number | null;
  menu_id: number;
  status: boolean | string;
  [key: string]: unknown;
}

export default function MenusPage() {
  const router = useRouter();
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const [showForm, setShowForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [view, setView] = useState<"table" | "tree">("table");
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<MenuItem | null>(null);

  const { data, isLoading: itemsLoading } = useContentAll("menu_items", { pageSize: 1000 });
  const deleteMutation = useDeleteContent("menu_items");

  const items = (data?.items ?? []) as MenuItem[];
  const treeData = buildTree(items, "id", "parent_id", "label");

  useEffect(() => {
    if (!isLoading && !user) router.push("/auth/v1/login");
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-2xl">Menus</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Menu
        </Button>
      </div>
      <MenusTable />
      <MenuFormDialog open={showForm} onOpenChange={setShowForm} />

      <div className="mt-6 flex items-center justify-between">
        <h3 className="font-semibold text-xl">Menu Items ({items.length})</h3>
        <div className="flex items-center gap-3">
          <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as "table" | "tree")}>
            <ToggleGroupItem value="table" aria-label="Table view">
              <LayoutList className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="tree" aria-label="Tree view">
              <Network className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          <Button onClick={() => setShowItemForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {view === "table" ? (
        <MenuItemsTable onAddItem={() => setShowItemForm(true)} />
      ) : (
        <TreeView
          data={treeData}
          showCount
          renderActions={(node) => {
            const item = node as unknown as MenuItem;
            return (
              <div className="flex gap-1">
                <Badge
                  variant={item.status === true || item.status === "active" ? "default" : "secondary"}
                  className="mr-1 text-[10px]"
                >
                  {item.status === true || item.status === "active" ? "Active" : "Inactive"}
                </Badge>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setEditItem(item)}>
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setDeleteItem(item)}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            );
          }}
        />
      )}

      <MenuItemFormDialog open={showItemForm} onOpenChange={setShowItemForm} />
      {editItem && (
        <MenuItemFormDialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)} item={editItem as any} />
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
    </div>
  );
}
