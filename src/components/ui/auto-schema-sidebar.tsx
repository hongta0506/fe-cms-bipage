"use client";

import { useMemo } from "react";
import { useSchemas } from "@/hooks/use-dashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

// Schema icons mapping (by name)
const schemaIcons: Record<string, string> = {
  posts: "📝",
  categories: "📁",
  tags: "🏷️",
  authors: "👤",
  banners: "🖼️",
  blocks: "🧱",
  menus: "📋",
  menu_items: "📄",
  settings: "⚙️",
  domains: "🌐",
  file: "📁",
  session: "🔐",
  contact_submissions: "📬",
  crawl_sources: "🔍",
  user: "👤",
  role: "🛡️",
  permission: "🔑",
  roles_users: "👥",
  post_views: "👁️",
};

// Human-readable labels
function labelize(name: string): string {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface SchemaItem {
  name: string;
  label: string;
  icon?: string;
  fields: Array<{ name: string; type: string }>;
}

export function AutoSchemaSidebar({ className }: { className?: string }) {
  const { data: schemas, isLoading } = useSchemas();
  const pathname = usePathname();

  const items = useMemo(() => {
    if (!schemas) return [];
    // Exclude pivot/internal schemas
    const exclude = ["roles_users", "post_views"];
    return (schemas as SchemaItem[]).filter((s) => !exclude.includes(s.name));
  }, [schemas]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="px-3 py-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Auto Schemas ({items.length})
        </h3>
      </div>
      <ScrollArea className="h-[300px]">
        <div className="space-y-1 px-2">
          {items.map((schema) => {
            const href = `/dashboard/content/${schema.name}`;
            const isActive = pathname === href;
            const icon = schemaIcons[schema.name] || "📄";
            const fieldCount = schema.fields?.length ?? 0;

            return (
              <Link
                key={schema.name}
                href={href}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                  isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                <span className="text-base">{icon}</span>
                <span className="flex-1 truncate">{labelize(schema.name)}</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {fieldCount}
                </Badge>
              </Link>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
