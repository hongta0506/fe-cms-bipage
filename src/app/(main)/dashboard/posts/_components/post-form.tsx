"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageField } from "@/components/ui/image-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { SlugInput } from "@/components/ui/slug-input";
import { Textarea } from "@/components/ui/textarea";
import { useContentAll, useCreateContent, useUpdateContent } from "@/hooks/use-dashboard";

const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  cover_image: z.string().optional(),
  status: z.enum(["draft", "published"]),
  author_id: z.number().int().nullable().optional(),
  category_id: z.number().int().nullable().optional(),
  domain_id: z.number().int().nullable().optional(),
});

type PostFormValues = z.infer<typeof postSchema>;

/** Extract ID from value that may be a nested object or flat number/string. */
function extractId(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v) || null;
  if (typeof v === "object" && "id" in v) return (v as { id: number }).id;
  return null;
}

interface PostFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post?: Record<string, unknown>;
}

export function PostFormDialog({ open, onOpenChange, post }: PostFormDialogProps) {
  const isEdit = !!post;
  const createMutation = useCreateContent("posts");
  const updateMutation = useUpdateContent("posts");
  const [title, setTitle] = useState((post?.title as string) ?? "");

  const { data: authorsData } = useContentAll("authors", { pageSize: 100 });
  const { data: domainsData } = useContentAll("domains", { pageSize: 100 });
  const { data: categoriesData } = useContentAll("categories", { pageSize: 500 });
  const authors = (authorsData?.items ?? []) as { id: number; display_name: string }[];
  const domains = (domainsData?.items ?? []) as { id: number; name: string }[];
  const allCategories = (categoriesData?.items ?? []) as { id: number; name: string; domain_id?: string | number }[];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: (post?.title as string) ?? "",
      slug: (post?.slug as string) ?? "",
      content: (post?.content as string) ?? "",
      excerpt: (post?.excerpt as string) ?? "",
      cover_image: (post?.cover_image as string) ?? "",
      status: post?.status === true || post?.status === "published" ? "published" : "draft",
      author_id: extractId(post?.author_id ?? (post as Record<string, unknown>)?.author),
      category_id: extractId(post?.category_id ?? (post as Record<string, unknown>)?.category),
      domain_id: extractId(post?.domain_id ?? (post as Record<string, unknown>)?.domain),
    },
  });

  const selectedDomainId = watch("domain_id");
  const categories = selectedDomainId
    ? allCategories.filter((c) => String(c.domain_id) === String(selectedDomainId))
    : allCategories;

  useEffect(() => {
    if (open && post) {
      reset({
        title: (post.title as string) ?? "",
        slug: (post.slug as string) ?? "",
        content: (post.content as string) ?? "",
        excerpt: (post.excerpt as string) ?? "",
        cover_image: (post.cover_image as string) ?? "",
        status: post.status === true || post.status === "published" ? "published" : "draft",
        author_id: extractId(post.author_id ?? post.author),
        category_id: extractId(post.category_id ?? post.category),
        domain_id: extractId(post.domain_id ?? post.domain),
      });
      setTitle((post.title as string) ?? "");
    } else if (open) {
      reset({
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        cover_image: "",
        status: "draft",
        author_id: null,
        category_id: null,
        domain_id: null,
      });
      setTitle("");
    }
  }, [open, post, reset]);

  const onSubmit = (values: PostFormValues) => {
    const payload = {
      ...values,
      status: values.status === "published",
      author_id: values.author_id || null,
      category_id: values.category_id || null,
      domain_id: values.domain_id || null,
    };
    if (isEdit) {
      updateMutation.mutate({ id: post?.id as number, data: payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: "800px" }} className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{post ? "Chỉnh sửa bài viết" : "Bài viết mới"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
          </div>

          <SlugInput title={title} value={watch("slug") as string} onChange={(v) => setValue("slug", v)} />

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Domain</Label>
              <NativeSelect
                value={watch("domain_id") ?? ""}
                onChange={(e) => {
                  setValue("domain_id", e.target.value ? Number(e.target.value) : null);
                  setValue("category_id", null);
                }}
              >
                <option value="">All Domains</option>
                {domains.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label>Author</Label>
              <NativeSelect
                value={watch("author_id") ?? ""}
                onChange={(e) => setValue("author_id", e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">None</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.display_name || a.id}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <NativeSelect
                value={watch("category_id") ?? ""}
                onChange={(e) => setValue("category_id", e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </div>

          <ImageField
            value={watch("cover_image") ?? ""}
            onChange={(v) => setValue("cover_image", v)}
            label="Cover Image"
          />

          <div className="space-y-2">
            <Label>Excerpt</Label>
            <Textarea {...register("excerpt")} rows={3} />
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <RichTextEditor value={watch("content") ?? ""} onChange={(v) => setValue("content", v)} />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <NativeSelect
              value={watch("status")}
              onChange={(e) => setValue("status", e.target.value as "draft" | "published")}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </NativeSelect>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
