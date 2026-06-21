"use client";

import { useMemo, useState } from "react";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useContent, useContentAll, useDeleteContent, useUpdateContent } from "@/hooks/use-dashboard";

import { PostDeleteDialog } from "./post-delete-dialog";
import { PostFormDialog } from "./post-form";

interface Post {
  id: number;
  title: string;
  slug: string;
  content?: string;
  summary?: string;
  cover_image?: string;
  thumbnail_image?: string;
  status: boolean;
  published?: boolean;
  featured?: boolean;
  author_id?: number | null;
  category_id?: number | null;
  domain_id?: number | null;
  source_name?: string;
  source_url?: string;
  source_author?: string;
  tags?: string[];
  locale?: string;
  published_at?: string;
  view_count?: number;
  created_at: string;
}

export function PostsTable() {
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [deletePost, setDeletePost] = useState<Post | null>(null);
  const [selectedPosts, setSelectedPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const { data, isLoading } = useContent("posts", { page, pageSize });
  const { data: domainsData } = useContentAll("domains", { pageSize: 100 });
  const { data: categoriesData } = useContentAll("categories", { pageSize: 200 });
  const deleteMutation = useDeleteContent("posts");
  const updateMutation = useUpdateContent("posts");

  const posts = (data?.items ?? []) as Post[];
  const domains = (domainsData?.items ?? []) as { id: number; name: string }[];
  const categories = (categoriesData?.items ?? []) as { id: number; name: string }[];
  const domainMap = useMemo(() => Object.fromEntries(domains.map((d) => [String(d.id), d.name])), [domains]);
  const categoryMap = useMemo(() => Object.fromEntries(categories.map((c) => [String(c.id), c.name])), [categories]);
  const total = data?.total ?? 0;

  const columns: ColumnDef<Post, unknown>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          className="accent-primary"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => {
            table.toggleAllPageRowsSelected(e.target.checked);
            setSelectedPosts(e.target.checked ? posts : []);
          }}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="accent-primary"
          checked={row.getIsSelected()}
          onChange={(e) => {
            row.toggleSelected(e.target.checked);
            setSelectedPosts((prev) =>
              e.target.checked ? [...prev, row.original] : prev.filter((p) => p.id !== row.original.id),
            );
          }}
        />
      ),
      enableHiding: false,
    },
    {
      accessorKey: "cover_image",
      header: "Ảnh",
      cell: ({ row }) => (
        <div className="flex h-10 w-16 items-center justify-center overflow-hidden rounded bg-muted">
          {row.original.cover_image ? (
            <img src={row.original.cover_image} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-[10px] text-muted-foreground">No img</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: "Tiêu đề",
      cell: ({ row }) => (
        <div className="max-w-[300px]">
          <p className="truncate font-medium">{row.original.title}</p>
          <p className="truncate text-muted-foreground text-xs">{row.original.slug}</p>
        </div>
      ),
    },
    {
      accessorKey: "published",
      header: "Trạng thái",
      cell: ({ row }) => {
        const isPublished = row.original.published === true || row.original.status === true;
        return (
          <Badge variant={isPublished ? "default" : "secondary"}>
            <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${isPublished ? "bg-green-500" : "bg-yellow-500"}`} />
            {isPublished ? "Đã xuất bản" : "Bản nháp"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "featured",
      header: "Nổi bật",
      cell: ({ row }) =>
        row.original.featured ? (
          <Badge variant="outline" className="border-amber-300 text-amber-600">
            Nổi bật
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      accessorKey: "source_name",
      header: "Nguồn",
      cell: ({ row }) => {
        const src = row.original.source_name || row.original.source_url;
        return src ? (
          <Badge variant="outline" className="max-w-[120px] truncate">
            {src}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: "category_id",
      header: "Danh mục",
      cell: ({ row }) => categoryMap[String(row.original.category_id)] ?? "-",
    },
    {
      accessorKey: "domain_id",
      header: "Tên miền",
      cell: ({ row }) => domainMap[String(row.original.domain_id)] ?? "-",
    },
    {
      accessorKey: "created_at",
      header: "Ngày tạo",
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString("vi-VN"),
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => (
        <div className="flex gap-1">
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
      enableHiding: false,
    },
  ];

  return (
    <>
      {/* Bulk actions bar */}
      {selectedPosts.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
          <span className="text-muted-foreground text-sm">Đã chọn {selectedPosts.length} bài viết</span>
          <Button
            size="sm"
            variant="outline"
            disabled={updateMutation.isPending}
            onClick={() => {
              selectedPosts.forEach((p) => updateMutation.mutate({ id: p.id, data: { status: "published" } }));
              setSelectedPosts([]);
            }}
          >
            Xuất bản
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={updateMutation.isPending}
            onClick={() => {
              selectedPosts.forEach((p) => updateMutation.mutate({ id: p.id, data: { status: "draft" } }));
              setSelectedPosts([]);
            }}
          >
            Chuyển nháp
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={deleteMutation.isPending}
            onClick={() => {
              selectedPosts.forEach((p) => deleteMutation.mutate(p.id));
              setSelectedPosts([]);
            }}
          >
            Xoá ({selectedPosts.length})
          </Button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={posts}
        isLoading={isLoading}
        searchKey="title"
        searchPlaceholder="Tìm bài viết..."
        total={total}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
          setSelectedPosts([]);
        }}
        onPaginationChange={(p) => {
          setPage(p);
          setSelectedPosts([]);
        }}
        filters={[
          {
            key: "status",
            label: "Trạng thái",
            placeholder: "Tất cả trạng thái",
            options: [
              { label: "Đã xuất bản", value: "published" },
              { label: "Bản nháp", value: "draft" },
            ],
          },
          {
            key: "domain_id",
            label: "Tên miền",
            placeholder: "Tất cả tên miền",
            options: domains.map((d) => ({ label: d.name, value: String(d.id) })),
          },
        ]}
      />
      {editPost && (
        <PostFormDialog
          open={!!editPost}
          onOpenChange={(open) => !open && setEditPost(null)}
          post={editPost as unknown as Record<string, unknown>}
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
