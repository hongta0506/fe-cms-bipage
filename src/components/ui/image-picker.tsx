"use client";

import { useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useContent } from "@/hooks/use-dashboard";
import { cn } from "@/lib/utils";

interface ImagePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  value?: string;
}

interface FileItem {
  id: number;
  name: string;
  path: string;
  type: string;
  disk: string;
}

export function ImagePicker({ open, onOpenChange, onSelect }: ImagePickerProps) {
  const [urlInput, setUrlInput] = useState("");
  const { data, isLoading } = useContent("file", { pageSize: 100 });

  const files = (data?.items ?? []) as FileItem[];
  const images = files.filter((f) => f.type?.startsWith("image/"));

  const handleSelect = (url: string) => {
    onSelect(url);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: "800px" }} className="max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Image</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Image URL</Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => urlInput && handleSelect(urlInput)}
                disabled={!urlInput}
              >
                Use URL
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or select from files</span>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[400px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No images found. Upload files first.
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {images.map((file) => (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => handleSelect(file.path)}
                    className="group relative aspect-square rounded-md border overflow-hidden hover:border-primary transition-colors"
                  >
                    <img
                      src={file.path}
                      alt={file.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-medium">Select</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ImageField({
  value,
  onChange,
  label = "Image URL",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          placeholder="https://example.com/image.jpg"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <Button type="button" variant="outline" onClick={() => setOpen(true)}>
          Browse
        </Button>
      </div>
      {value && (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Preview"
            className="h-20 w-20 rounded-md object-cover border"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      <ImagePicker open={open} onOpenChange={setOpen} onSelect={onChange} value={value} />
    </div>
  );
}
