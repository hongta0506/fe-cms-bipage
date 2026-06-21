"use client";

import { useMemo, useState } from "react";
import { ChevronRight, ChevronDown, Folder, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

/* ---------- Types ---------- */

interface TreeNode {
  id: string | number;
  label: string;
  children?: TreeNode[];
  [key: string]: unknown;
}

interface TreeViewProps {
  data: TreeNode[];
  className?: string;
  defaultExpandAll?: boolean;
  onSelect?: (node: TreeNode) => void;
  selectedId?: string | number | null;
  renderActions?: (node: TreeNode) => React.ReactNode;
  showCount?: boolean;
}

/* ---------- Helpers ---------- */

function buildTree<T extends Record<string, unknown>>(
  items: T[],
  idKey: string = "id",
  parentKey: string = "parent_id",
  labelKey: string = "name",
): TreeNode[] {
  const map = new Map<string | number, TreeNode>();
  const roots: TreeNode[] = [];

  // First pass: create nodes
  for (const item of items) {
    const id = item[idKey] as string | number;
    map.set(id, {
      id,
      label: String(item[labelKey] ?? ""),
      children: [],
      ...item,
    });
  }

  // Second pass: build tree
  for (const item of items) {
    const id = item[idKey] as string | number;
    const parentId = item[parentKey] as string | number | null | undefined;
    const node = map.get(id)!;
    // Coerce parentId to match map key type (API may return parent_id as string)
    const normalizedParentId = parentId != null ? (typeof id === "number" ? Number(parentId) : String(parentId)) : null;

    if (normalizedParentId && map.has(normalizedParentId)) {
      map.get(normalizedParentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  }

  // Clean empty children arrays
  const clean = (nodes: TreeNode[]): TreeNode[] =>
    nodes.map((n) => ({
      ...n,
      children: n.children?.length ? clean(n.children) : undefined,
    }));

  return clean(roots);
}

/* ---------- TreeItem ---------- */

function TreeItem({
  node,
  level,
  expanded,
  onToggle,
  onSelect,
  selectedId,
  renderActions,
  showCount,
}: {
  node: TreeNode;
  level: number;
  expanded: Set<string | number>;
  onToggle: (id: string | number) => void;
  onSelect?: (node: TreeNode) => void;
  selectedId?: string | number | null;
  renderActions?: (node: TreeNode) => React.ReactNode;
  showCount?: boolean;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded.has(node.id);
  const isSelected = selectedId === node.id;
  const hasChildrenProp = node.children && node.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground",
          isSelected && "bg-accent text-accent-foreground font-medium",
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => {
          if (hasChildren) onToggle(node.id);
          onSelect?.(node);
        }}
      >
        {/* Expand/collapse icon */}
        <span className="flex h-4 w-4 shrink-0 items-center justify-center">
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )
          ) : (
            <File className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </span>

        {/* Icon */}
        <span className="flex h-4 w-4 shrink-0 items-center justify-center">
          {hasChildren ? (
            <Folder className={cn("h-3.5 w-3.5", isExpanded ? "text-primary" : "text-muted-foreground")} />
          ) : null}
        </span>

        {/* Label */}
        <span className="flex-1 truncate">{node.label}</span>

        {/* Count badge */}
        {showCount && hasChildrenProp && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-1">
            {node.children!.length}
          </Badge>
        )}

        {/* Actions */}
        {renderActions && (
          <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-1" onClick={(e) => e.stopPropagation()}>
            {renderActions(node)}
          </span>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              level={level + 1}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
              selectedId={selectedId}
              renderActions={renderActions}
              showCount={showCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- TreeView ---------- */

export function TreeView({
  data,
  className,
  defaultExpandAll = false,
  onSelect,
  selectedId,
  renderActions,
  showCount = true,
}: TreeViewProps) {
  const [expanded, setExpanded] = useState<Set<string | number>>(() => {
    if (defaultExpandAll) {
      const allIds = new Set<string | number>();
      const collect = (nodes: TreeNode[]) => {
        for (const n of nodes) {
          if (n.children?.length) {
            allIds.add(n.id);
            collect(n.children);
          }
        }
      };
      collect(data);
      return allIds;
    }
    // Default: expand first level only
    return new Set(data.map((n) => n.id));
  });

  const toggle = (id: string | number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!data.length) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
        No items
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border bg-background p-2", className)}>
      {data.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          level={0}
          expanded={expanded}
          onToggle={toggle}
          onSelect={onSelect}
          selectedId={selectedId}
          renderActions={renderActions}
          showCount={showCount}
        />
      ))}
    </div>
  );
}

export { buildTree };
export type { TreeNode };
