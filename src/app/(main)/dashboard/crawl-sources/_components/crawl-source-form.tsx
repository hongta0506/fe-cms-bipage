"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateContent, useUpdateContent } from "@/hooks/use-dashboard";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  base_url: z.string().url("Must be a valid URL"),
  enabled: z.boolean(),
  schedule: z.string().optional(),
  description: z.string().optional(),
  selector: z.string().optional(),
  title_selector: z.string().optional(),
  content_selector: z.string().optional(),
  image_selector: z.string().optional(),
  link_selector: z.string().optional(),
  date_selector: z.string().optional(),
  author_selector: z.string().optional(),
  category_selector: z.string().optional(),
  tags_selector: z.string().optional(),
  custom_config: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: Record<string, unknown>;
}

export function CrawlSourceFormDialog({ open, onOpenChange, item }: Props) {
  const isEdit = !!item;
  const createMutation = useCreateContent("crawl_sources");
  const updateMutation = useUpdateContent("crawl_sources");

  const { handleSubmit, reset, register, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "", slug: "", base_url: "", enabled: true, schedule: "daily",
      description: "", selector: "", title_selector: "", content_selector: "",
      image_selector: "", link_selector: "", date_selector: "", author_selector: "",
      category_selector: "", tags_selector: "", custom_config: "",
    },
  });

  useEffect(() => {
    if (open && item) {
      reset({
        name: String(item.name ?? ""),
        slug: String(item.slug ?? ""),
        base_url: String(item.base_url ?? ""),
        enabled: item.enabled === true || item.enabled === "enabled",
        schedule: String(item.schedule ?? "daily"),
        description: String(item.description ?? ""),
        selector: String(item.selector ?? ""),
        title_selector: String(item.title_selector ?? ""),
        content_selector: String(item.content_selector ?? ""),
        image_selector: String(item.image_selector ?? ""),
        link_selector: String(item.link_selector ?? ""),
        date_selector: String(item.date_selector ?? ""),
        author_selector: String(item.author_selector ?? ""),
        category_selector: String(item.category_selector ?? ""),
        tags_selector: String(item.tags_selector ?? ""),
        custom_config: String(item.custom_config ?? ""),
      });
    } else if (open) {
      reset({ name: "", slug: "", base_url: "", enabled: true, schedule: "daily", description: "", selector: "", title_selector: "", content_selector: "", image_selector: "", link_selector: "", date_selector: "", author_selector: "", category_selector: "", tags_selector: "", custom_config: "" });
    }
  }, [open, item, reset]);

  const onSubmit = (values: FormValues) => {
    const payload = { ...values, enabled: !!values.enabled };
    if (isEdit) {
      updateMutation.mutate({ id: item!.id as number, data: payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Crawl Source" : "Create Crawl Source"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label>Slug</Label>
              <Input {...register("slug")} />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Base URL</Label>
            <Input {...register("base_url")} placeholder="https://example.com" />
            {errors.base_url && <p className="text-xs text-destructive">{errors.base_url.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Enabled</Label>
              <NativeSelect value={watch("enabled") ? "true" : "false"} onChange={(e) => setValue("enabled", e.target.value === "true")}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </NativeSelect>
            </div>
            <div className="grid gap-2">
              <Label>Schedule</Label>
              <NativeSelect {...register("schedule")}>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="manual">Manual</option>
              </NativeSelect>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Description</Label>
            <Textarea {...register("description")} rows={2} />
          </div>
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3">CSS Selectors</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Item Selector</Label><Input {...register("selector")} /></div>
              <div className="grid gap-2"><Label>Title Selector</Label><Input {...register("title_selector")} /></div>
              <div className="grid gap-2"><Label>Content Selector</Label><Input {...register("content_selector")} /></div>
              <div className="grid gap-2"><Label>Image Selector</Label><Input {...register("image_selector")} /></div>
              <div className="grid gap-2"><Label>Link Selector</Label><Input {...register("link_selector")} /></div>
              <div className="grid gap-2"><Label>Date Selector</Label><Input {...register("date_selector")} /></div>
              <div className="grid gap-2"><Label>Author Selector</Label><Input {...register("author_selector")} /></div>
              <div className="grid gap-2"><Label>Category Selector</Label><Input {...register("category_selector")} /></div>
              <div className="grid gap-2"><Label>Tags Selector</Label><Input {...register("tags_selector")} /></div>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Custom Config (JSON)</Label>
            <Textarea {...register("custom_config")} rows={3} placeholder='{"timeout": 30000}' />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
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
