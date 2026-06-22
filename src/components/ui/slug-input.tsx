"use client";

import { useEffect, useState } from "react";
import { Input } from "./input";
import { Label } from "./label";

function toSlug(text: string): string {
  const vietnameseMap: Record<string, string> = {
    à: "a", á: "a", ả: "a", ã: "a", ạ: "a", ă: "a", ằ: "a", ắ: "a", ẳ: "a", ẵ: "a", ặ: "a",
    â: "a", ầ: "a", ấ: "a", ẩ: "a", ẫ: "a", ậ: "a",
    đ: "d", è: "e", é: "e", ẻ: "e", ẽ: "e", ẹ: "e",
    ê: "e", ề: "e", ế: "e", ể: "e", ễ: "e", ệ: "e",
    ì: "i", í: "i", ỉ: "i", ĩ: "i", ị: "i",
    ò: "o", ó: "o", ỏ: "o", õ: "o", ọ: "o",
    ô: "o", ồ: "o", ố: "o", ổ: "o", ỗ: "o", ộ: "o",
    ơ: "o", ờ: "o", ớ: "o", ở: "o", ỡ: "o", ợ: "o",
    ù: "u", ú: "u", ủ: "u", ũ: "u", ụ: "u",
    ư: "u", ừ: "u", ứ: "u", ử: "u", ữ: "u", ự: "u",
    ỳ: "y", ý: "y", ỷ: "y", ỹ: "y", ỵ: "y",
  };
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split("")
    .map((ch) => vietnameseMap[ch] ?? ch)
    .join("");
  return normalized
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

interface SlugInputProps {
  title: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  makeUnique?: (slug: string) => string;
}

export function SlugInput({ title, value, onChange, prefix = "/posts/", makeUnique }: SlugInputProps) {
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (!manual) {
      const slug = makeUnique ? makeUnique(toSlug(title)) : toSlug(title);
      onChange(slug);
    }
  }, [title, manual, onChange, makeUnique]);

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
