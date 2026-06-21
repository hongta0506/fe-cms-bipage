"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { useContent, useDeleteContent } from "@/hooks/use-dashboard";

import { PostFormDialog } from "./post-form";
import { PostDeleteDialog } from "./post-delete-dialog";

interface Post {
  id: number;
  title: string;
  slug: string;
  status: string;
  author_id?: number;
  created_at: string;
}

export function PostsTable() {
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [deletePost, setDeletePost] = useState<Post | null>(null);
  const { data, isLoading } = useContent("posts", { pageSize: 100 });
  const deleteMutation = useDeleteContent("posts");

  const posts = (data?.items ?? []) as Post[];
  const total = data?.total ?? 0;

  const columns: ColumnDef<Post, unknown>[] = [
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "published" ? "default" : "secondary"}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
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
              setEditPost(row.original);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setDeletePost(row.original);
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
        data={posts}
        isLoading={isLoading}
        searchKey="title"
        searchPlaceholder="Search posts..."
        total={total}
      />
      {editPost && (
        <PostFormDialog
          open={!!editPost}
          onOpenChange={(open) => !open && setEditPost(null)}
          post={editPost}
        />
      )}
      {deletePost && (
        <PostDeleteDialog
          open={!!deletePost}
          onOpenChange={(open) => !open && setDeletePost(null)}
          post={deletePost}
          onConfirm={() => {
            deleteMutation.mutate(deletePost.id, {
              onSuccess: () => setDeletePost(null),
            });
          }}
          isPending={deleteMutation.isPending}
        />
      )}
    </>
  );
}
