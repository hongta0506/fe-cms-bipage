"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

// Static permission resource tree — all available API endpoints
const PERMISSION_TREE: { group: string; resources: string[] }[] = [
  {
    group: "Auth",
    resources: [
      "api.auth.me",
      "api.auth.logout",
      "api.auth.token/refresh",
      "api.auth.local.login",
      "api.auth.local.register",
      "api.auth.local.activate",
      "api.auth.local.activate/send",
      "api.auth.local.recover",
      "api.auth.local.recover/check",
      "api.auth.local.recover/reset",
    ],
  },
  {
    group: "Schema",
    resources: [
      "api.schema.list",
      "api.schema.create",
      "api.schema.detail",
      "api.schema.update",
      "api.schema.delete",
      "api.schema.import",
      "api.schema.export",
    ],
  },
  {
    group: "Realtime",
    resources: ["api.realtime.content"],
  },
  {
    group: "Role",
    resources: [
      "api.role.list",
      "api.role.detail",
      "api.role.create",
      "api.role.update",
      "api.role.delete",
    ],
  },
  {
    group: "File",
    resources: ["api.file.upload", "api.file.delete"],
  },
  {
    group: "Tool",
    resources: ["api.tool.stats"],
  },
  {
    group: "Config",
    resources: ["api.config"],
  },
  {
    group: "Content - Crawl Sources",
    resources: [
      "api.content.crawl_sources.list",
      "api.content.crawl_sources.detail",
      "api.content.crawl_sources.create",
      "api.content.crawl_sources.update",
      "api.content.crawl_sources.delete",
    ],
  },
  {
    group: "Content - Menu Items",
    resources: [
      "api.content.menu_items.list",
      "api.content.menu_items.detail",
      "api.content.menu_items.create",
      "api.content.menu_items.update",
      "api.content.menu_items.delete",
    ],
  },
  {
    group: "Content - Post Views",
    resources: [
      "api.content.post_views.list",
      "api.content.post_views.detail",
      "api.content.post_views.create",
      "api.content.post_views.update",
      "api.content.post_views.delete",
    ],
  },
  {
    group: "Content - Settings",
    resources: [
      "api.content.settings.list",
      "api.content.settings.detail",
      "api.content.settings.create",
      "api.content.settings.update",
      "api.content.settings.delete",
    ],
  },
  {
    group: "Content - Banners",
    resources: [
      "api.content.banners.list",
      "api.content.banners.detail",
      "api.content.banners.create",
      "api.content.banners.update",
      "api.content.banners.delete",
    ],
  },
  {
    group: "Content - Categories",
    resources: [
      "api.content.categories.list",
      "api.content.categories.detail",
      "api.content.categories.create",
      "api.content.categories.update",
      "api.content.categories.delete",
    ],
  },
  {
    group: "Content - Contact Submissions",
    resources: [
      "api.content.contact_submissions.list",
      "api.content.contact_submissions.detail",
      "api.content.contact_submissions.create",
      "api.content.contact_submissions.update",
      "api.content.contact_submissions.delete",
    ],
  },
  {
    group: "Content - Blocks",
    resources: [
      "api.content.blocks.list",
      "api.content.blocks.detail",
      "api.content.blocks.create",
      "api.content.blocks.update",
      "api.content.blocks.delete",
    ],
  },
  {
    group: "Content - Tags",
    resources: [
      "api.content.tags.list",
      "api.content.tags.detail",
      "api.content.tags.create",
      "api.content.tags.update",
      "api.content.tags.delete",
    ],
  },
  {
    group: "Content - Menus",
    resources: [
      "api.content.menus.list",
      "api.content.menus.detail",
      "api.content.menus.create",
      "api.content.menus.update",
      "api.content.menus.delete",
    ],
  },
  {
    group: "Content - File",
    resources: [
      "api.content.file.list",
      "api.content.file.detail",
      "api.content.file.create",
      "api.content.file.update",
      "api.content.file.delete",
    ],
  },
  {
    group: "Content - Posts",
    resources: [
      "api.content.posts.list",
      "api.content.posts.detail",
      "api.content.posts.create",
      "api.content.posts.update",
      "api.content.posts.delete",
    ],
  },
  {
    group: "Content - Authors",
    resources: [
      "api.content.authors.list",
      "api.content.authors.detail",
      "api.content.authors.create",
      "api.content.authors.update",
      "api.content.authors.delete",
    ],
  },
  {
    group: "Content - Domains",
    resources: [
      "api.content.domains.list",
      "api.content.domains.detail",
      "api.content.domains.create",
      "api.content.domains.update",
      "api.content.domains.delete",
    ],
  },
  {
    group: "Content - Session",
    resources: [
      "api.content.session.list",
      "api.content.session.detail",
      "api.content.session.create",
      "api.content.session.update",
      "api.content.session.delete",
    ],
  },
  {
    group: "Content - Users",
    resources: [
      "api.content.users.list",
      "api.content.users.detail",
      "api.content.users.create",
      "api.content.users.update",
      "api.content.users.delete",
    ],
  },
  {
    group: "Docs",
    resources: ["docs.spec", "docs.viewer"],
  },
];

interface RolePermissionsProps {
  selectedResources: string[];
  onToggle: (resource: string) => void;
}

export function RolePermissions({ selectedResources, onToggle }: RolePermissionsProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleGroup = (group: string) => {
    setExpanded((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const toggleAllInGroup = (resources: string[]) => {
    const allSelected = resources.every((r) => selectedResources.includes(r));
    resources.forEach((r) => {
      if (allSelected !== selectedResources.includes(r)) {
        onToggle(r);
      }
    });
  };

  return (
    <div className="max-h-[400px] overflow-y-auto space-y-1">
      {PERMISSION_TREE.map(({ group, resources }) => {
        const selectedCount = resources.filter((r) => selectedResources.includes(r)).length;
        const allSelected = selectedCount === resources.length;
        const someSelected = selectedCount > 0 && !allSelected;
        const isExpanded = expanded[group] ?? false;

        return (
          <div key={group} className="border rounded-md">
            <div
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted/50"
              onClick={() => toggleGroup(group)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0" />
              )}
              <input
                type="checkbox"
                ref={(el) => { if (el) el.indeterminate = someSelected; }}
                checked={allSelected}
                onChange={() => toggleAllInGroup(resources)}
                onClick={(e) => e.stopPropagation()}
                className="h-4 w-4 rounded border-input"
              />
              <span className="text-sm font-medium flex-1">{group}</span>
              <span className="text-xs text-muted-foreground">
                {selectedCount}/{resources.length}
              </span>
            </div>
            {isExpanded && (
              <div className="border-t px-3 py-2 space-y-1">
                {resources.map((resource) => (
                  <label key={resource} className="flex items-center gap-2 cursor-pointer py-0.5">
                    <input
                      type="checkbox"
                      checked={selectedResources.includes(resource)}
                      onChange={() => onToggle(resource)}
                      className="h-4 w-4 rounded border-input"
                    />
                    <span className="text-sm">{resource}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
