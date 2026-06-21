"use client";

import { useEffect, useState } from "react";
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

const domainSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  hostnames: z.string().min(1, "Hostnames is required"),
  default_locale: z.string(),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  gtag_id: z.string().optional(),
  gtag_secret: z.string().optional(),
  active: z.boolean(),
  status: z.enum(["active", "draft"]),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  seo_keywords: z.string().optional(),
  theme: z.string().optional(),
});

type DomainFormValues = z.infer<typeof domainSchema>;

interface DomainFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  domain?: Record<string, unknown>;
}

export function DomainFormDialog({ open, onOpenChange, domain }: DomainFormDialogProps) {
  const isEdit = !!domain;
  const createMutation = useCreateContent("domains");
  const updateMutation = useUpdateContent("domains");

  const { handleSubmit, reset, register, watch, setValue, formState: { errors } } = useForm<DomainFormValues>({
    resolver: zodResolver(domainSchema),
    defaultValues: {
      name: "", slug: "", hostnames: "", default_locale: "vi",
      logo: "", favicon: "", gtag_id: "", gtag_secret: "",
      active: true, status: "active",
      seo_title: "", seo_description: "", seo_keywords: "", theme: "",
    },
  });

  useEffect(() => {
    if (open && domain) {
      reset({
        name: String(domain.name ?? ""),
        slug: String(domain.slug ?? ""),
        hostnames: String(domain.hostnames ?? ""),
        default_locale: String(domain.default_locale ?? "vi"),
        logo: String(domain.logo ?? ""),
        favicon: String(domain.favicon ?? ""),
        gtag_id: String(domain.gtag_id ?? ""),
        gtag_secret: String(domain.gtag_secret ?? ""),
        active: domain.active === true || domain.active === "active",
        status: (domain.status as "active" | "draft") ?? "active",
        seo_title: String(domain.seo_title ?? ""),
        seo_description: String(domain.seo_description ?? ""),
        seo_keywords: String(domain.seo_keywords ?? ""),
        theme: String(domain.theme ?? ""),
      });
    } else if (open) {
      reset({ name: "", slug: "", hostnames: "", default_locale: "vi", logo: "", favicon: "", gtag_id: "", gtag_secret: "", active: true, status: "active", seo_title: "", seo_description: "", seo_keywords: "", theme: "" });
    }
  }, [open, domain, reset]);

  const onSubmit = (values: DomainFormValues) => {
    const payload = { ...values, active: !!values.active };
    if (isEdit) {
      updateMutation.mutate({ id: domain!.id as number, data: payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Domain" : "Create Domain"}</DialogTitle>
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
            <Label>Hostnames</Label>
            <Input {...register("hostnames")} placeholder="example.com, www.example.com" />
            {errors.hostnames && <p className="text-xs text-destructive">{errors.hostnames.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Default Locale</Label>
              <NativeSelect {...register("default_locale")}>
                <option value="vi">Vietnamese</option>
                <option value="en">English</option>
              </NativeSelect>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <NativeSelect {...register("status")}>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </NativeSelect>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Logo URL</Label>
              <Input {...register("logo")} />
            </div>
            <div className="grid gap-2">
              <Label>Favicon URL</Label>
              <Input {...register("favicon")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>GA Tag ID</Label>
              <Input {...register("gtag_id")} />
            </div>
            <div className="grid gap-2">
              <Label>GA Tag Secret</Label>
              <Input {...register("gtag_secret")} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>SEO Title</Label>
            <Input {...register("seo_title")} />
          </div>
          <div className="grid gap-2">
            <Label>SEO Description</Label>
            <Textarea {...register("seo_description")} rows={2} />
          </div>
          <div className="grid gap-2">
            <Label>SEO Keywords</Label>
            <Input {...register("seo_keywords")} />
          </div>
          <div className="grid gap-2">
            <Label>Theme</Label>
            <Input {...register("theme")} />
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
