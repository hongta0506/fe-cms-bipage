"use client";

import { useEffect, useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Loader2, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  useContent,
  useCreateContent,
  useUpdateContent,
  useDeleteContent,
} from "@/hooks/use-dashboard";

/* ---------- Types from /api/schema ---------- */

interface SchemaField {
  name: string;
  type: string;
  label?: string;
  required?: boolean;
  default_value?: unknown;
  enum?: string[];
  relation?: { schema: string; field: string };
}

interface SchemaDef {
  name: string;
  label: string;
  icon?: string;
  fields: SchemaField[];
}

/* ---------- Helpers ---------- */

function formatDate(s: string) {
  if (!s) return "-";
  return new Date(s).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isSystemField(name: string) {
  return name === "deleted_at" || name.startsWith("pivot_");
}

function isHiddenField(name: string) {
  // Fields to hide from table (too long, internal, etc.)
  return ["raw_payload", "content", "source_url", "source_name", "source_author", "source_published_at", "crawled_at", "crawler_id"].includes(name);
}

function isReadOnlyField(name: string) {
  return ["id", "created_at", "updated_at", "view_count", "pivot_authors_id", "pivot_categories_id"].includes(name);
}

function isFormHiddenField(name: string) {
  return ["id", "created_at", "updated_at", "deleted_at", "raw_payload", "pivot_authors_id", "pivot_categories_id"].includes(name);
}

function isBooleanField(f: SchemaField) {
  return f.type === "bool" || f.type === "boolean";
}

function isNumberField(f: SchemaField) {
  return f.type === "int" || f.type === "integer" || f.type === "number" || f.type === "float";
}

function isDateField(f: SchemaField) {
  return f.type === "datetime" || f.type === "date" || f.type === "timestamp";
}

function isRelationField(f: SchemaField) {
  return !!f.relation || f.type === "relation" || f.type === "has_one" || f.type === "has_many";
}

/** Extract the ID from a value that may be a nested object from the API. */
function extractId(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || null;
  if (typeof value === "object" && "id" in value) return (value as { id: number }).id;
  return null;
}

function isEnumField(f: SchemaField) {
  return !!f.enum && f.enum.length > 0;
}

function isLongTextField(f: SchemaField) {
  return ["text", "longtext", "richtext"].includes(f.type);
}

function getFieldLabel(f: SchemaField) {
  return f.label || f.name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ---------- Dynamic Table Column ---------- */

function renderCellValue(value: unknown, field: SchemaField): React.ReactNode {
  if (value === null || value === undefined) return <span className="text-muted-foreground">-</span>;

  if (isBooleanField(field)) {
    return <Badge variant={value ? "default" : "secondary"}>{value ? "Yes" : "No"}</Badge>;
  }

  if (isDateField(field)) {
    return formatDate(String(value));
  }

  if (Array.isArray(value)) {
    return <span className="text-muted-foreground">[{value.length} items]</span>;
  }

  if (typeof value === "object") {
    return <span className="text-muted-foreground">[object]</span>;
  }

  const str = String(value);
  if (str.length > 80) return <span title={str}>{str.slice(0, 80)}...</span>;
  return <span>{str}</span>;
}

/* ---------- Relation data hook ---------- */

function useRelationOptions(schemaName: string) {
  const { data } = useContent(schemaName, { pageSize: 200 });
  return useMemo(() => {
    if (!data?.items) return [] as { id: number; name: string }[];
    return (data.items as Record<string, unknown>[]).map((item) => ({
      id: item.id as number,
      name: (item.name ?? item.title ?? String(item.id)) as string,
    }));
  }, [data]);
}

/* ---------- Relation Select ---------- */

function RelationSelect({
  schemaName,
  value,
  onChange,
  placeholder,
}: {
  schemaName: string;
  value: number | null;
  onChange: (id: number | null) => void;
  placeholder?: string;
}) {
  const options = useRelationOptions(schemaName);

  return (
    <NativeSelect
      value={value != null ? String(value) : ""}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
    >
      <option value="">{placeholder ?? "None"}</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.name}
        </option>
      ))}
    </NativeSelect>
  );
}

/* ---------- Dynamic Form ---------- */

function DynamicForm({
  schema,
  item,
  onSuccess,
  onOpenChange,
}: {
  schema: SchemaDef;
  item?: Record<string, unknown>;
  onSuccess: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = !!item;
  const createMutation = useCreateContent(schema.name);
  const updateMutation = useUpdateContent(schema.name);

  const formFields = useMemo(
    () => schema.fields.filter((f) => !isFormHiddenField(f.name) && !isSystemField(f.name)),
    [schema.fields]
  );

  const [formData, setFormData] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    formFields.forEach((f) => {
      if (item) {
        if (isRelationField(f)) {
          // API may return relation as nested object under various keys:
          // - item["category_id"] = 5
          // - item["category"] = { id: 5, name: "..." }
          // - item["category"] = 5
          const raw = item[f.name]
            ?? item[f.name.replace(/_id$/, "")]
            ?? item[f.name.replace(/_id$/, "")];
          initial[f.name] = extractId(raw) ?? (f.default_value as number | null ?? null);
        } else {
          initial[f.name] = item[f.name] ?? (isBooleanField(f) ? false : isNumberField(f) ? 0 : "");
        }
      } else {
        initial[f.name] = f.default_value ?? (isBooleanField(f) ? false : isNumberField(f) ? 0 : "");
      }
    });
    return initial;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && item) {
      updateMutation.mutate({ id: item.id as number, data: formData }, { onSuccess });
    } else {
      createMutation.mutate(formData, { onSuccess });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formFields.map((f) => (
        <div key={f.name} className="space-y-2">
          <Label>{getFieldLabel(f)}</Label>
          {isBooleanField(f) ? (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={!!formData[f.name]}
                onCheckedChange={(checked) => setFormData({ ...formData, [f.name]: checked })}
              />
              <span className="text-sm text-muted-foreground">{formData[f.name] ? "Active" : "Inactive"}</span>
            </div>
          ) : isRelationField(f) && f.relation ? (
            <RelationSelect
              schemaName={f.relation.schema}
              value={extractId(formData[f.name])}
              onChange={(id) => setFormData({ ...formData, [f.name]: id })}
            />
          ) : isEnumField(f) ? (
            <NativeSelect
              value={String(formData[f.name] ?? "")}
              onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
            >
              <option value="">Select...</option>
              {f.enum!.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </NativeSelect>
          ) : isLongTextField(f) ? (
            <RichTextEditor
              value={String(formData[f.name] ?? "")}
              onChange={(val) => setFormData({ ...formData, [f.name]: val })}
            />
          ) : isNumberField(f) ? (
            <Input
              type="number"
              value={formData[f.name] !== undefined ? String(formData[f.name]) : ""}
              onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value ? Number(e.target.value) : 0 })}
            />
          ) : (
            <Input
              value={String(formData[f.name] ?? "")}
              onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
            />
          )}
        </div>
      ))}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}

/* ---------- Main Page Component ---------- */

export function DynamicSchemaPage({ schema }: { schema: SchemaDef }) {
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null);
  const [deleteItem, setDeleteItem] = useState<Record<string, unknown> | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useContent(schema.name, { page, pageSize });
  const deleteMutation = useDeleteContent(schema.name);

  const items = useMemo(() => (data?.items ?? []) as Record<string, unknown>[], [data]);

  // Build columns dynamically from schema fields
  const columns: ColumnDef<Record<string, unknown>>[] = useMemo(() => {
    const cols: ColumnDef<Record<string, unknown>>[] = [];

    schema.fields.forEach((f) => {
      if (isSystemField(f.name) || isHiddenField(f.name)) return;

      cols.push({
        accessorKey: f.name,
        header: getFieldLabel(f),
        cell: ({ row }) => renderCellValue(row.original[f.name], f),
      });
    });

    // Actions column
    cols.push({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditItem(row.original); }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setDeleteItem(row.original); }}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    });

    return cols;
  }, [schema.fields]);

  // Determine search key (first text-like field)
  const searchKey = useMemo(() => {
    const first = schema.fields.find(
      (f) => !isSystemField(f.name) && !isHiddenField(f.name) && !isBooleanField(f) && !isNumberField(f) && !isDateField(f) && !isRelationField(f)
    );
    return first?.name;
  }, [schema.fields]);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{schema.label}</h2>
        <Button onClick={() => setShowCreate(true)}>
          <Loader2 className="mr-2 h-4 w-4 hidden" />
          New {schema.label.replace(/s$/, "")}
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        searchKey={searchKey}
        searchPlaceholder={`Tìm ${schema.label.toLowerCase()}...`}
        onSearch={(s) => { /* server-side search handled by parent if needed */ }}
        total={data?.total ?? 0}
        pageSize={pageSize}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        onPaginationChange={(p) => setPage(p)}
      />

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent style={{ maxWidth: "800px" }} className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New {schema.label.replace(/s$/, "")}</DialogTitle></DialogHeader>
          <DynamicForm schema={schema} onOpenChange={setShowCreate} onSuccess={() => setShowCreate(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      {editItem && (
        <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
          <DialogContent style={{ maxWidth: "800px" }} className="max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Edit {schema.label.replace(/s$/, "")}</DialogTitle></DialogHeader>
            <DynamicForm schema={schema} item={editItem} onOpenChange={(o) => !o && setEditItem(null)} onSuccess={() => setEditItem(null)} />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete dialog */}
      {deleteItem && (
        <Dialog open={!!deleteItem} onOpenChange={(o) => !o && setDeleteItem(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Delete</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <strong>{String(deleteItem.name || deleteItem.title || deleteItem.id)}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteItem(null)}>Cancel</Button>
              <Button
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  deleteMutation.mutate(deleteItem.id as number, { onSuccess: () => setDeleteItem(null) });
                }}
              >
                {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
