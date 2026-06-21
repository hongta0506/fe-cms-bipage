"use client";

import { useEffect, useState } from "react";
import { Input } from "./input";
import { Label } from "./label";

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

interface SlugInputProps {
  title: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
}

export function SlugInput({ title, value, onChange, prefix = "/posts/" }: SlugInputProps) {
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (!manual) {
      onChange(toSlug(title));
    }
  }, [title, manual, onChange]);

  return (
    <div className="space-y-2">
      <Label>Slug</Label>
      <Input
        value={value}
        onChange={(e) => {
          setManual(true);
          onChange(toSlug(e.target.value));
        }}
        placeholder="post-slug"
      />
      <p className="text-xs text-muted-foreground">
        URL: {prefix}{value || "post-slug"}
      </p>
    </div>
  );
}
