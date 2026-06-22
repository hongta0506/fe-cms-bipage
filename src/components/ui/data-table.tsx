"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, ChevronDown, X, Settings2 } from "lucide-react";

import { Button } from "./button";
import { Input } from "./input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { NativeSelect } from "./native-select";

interface FilterOption {
  key: string;
  label: string;
  options: { label: string; value: string }[];
  placeholder?: string;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  searchKey?: string;
  searchPlaceholder?: string;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
  onRowClick?: (row: TData) => void;
  total?: number;
  pageCount?: number;
  onPaginationChange?: (page: number, pageSize: number) => void;
  onSearch?: (search: string) => void;
  filters?: FilterOption[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  searchKey,
  searchPlaceholder = "Tìm kiếm...",
  pageSize: initialPageSize = 10,
  onPageSizeChange,
  onRowClick,
  total,
  onPaginationChange,
  onSearch,
  filters = [],
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: initialPageSize });
  const isServerPaginated = total !== undefined && total !== null;

  // Debounced server-side search
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const debouncedSearch = useCallback(
    (value: string) => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSearch?.(value);
        if (isServerPaginated) setPagination((p) => ({ ...p, pageIndex: 0 }));
      }, 300);
    },
    [onSearch, isServerPaginated],
  );
  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const searchedData =
    searchKey && search
      ? data.filter((row) => {
          const value = (row as Record<string, unknown>)[searchKey];
          return String(value ?? "").toLowerCase().includes(search.toLowerCase());
        })
      : data;

  const filteredData = filters.reduce((acc, filter) => {
    const val = filterValues[filter.key];
    if (!val || val === "all") return acc;
    return acc.filter((row) => String((row as Record<string, unknown>)[filter.key]) === val);
  }, searchedData);

  const table = useReactTable({
    data: isServerPaginated ? searchedData : filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(isServerPaginated
      ? {
          manualPagination: true,
          pageCount: Math.ceil(total / pagination.pageSize),
          state: { sorting, columnVisibility, pagination },
          onPaginationChange: (updater) => {
            const newPagination = typeof updater === "function" ? updater(pagination) : updater;
            setPagination(newPagination);
            onPaginationChange?.(newPagination.pageIndex + 1, newPagination.pageSize);
          },
        }
      : {
          getPaginationRowModel: getPaginationRowModel(),
          state: { sorting, columnVisibility },
          initialState: { pagination: { pageSize: initialPageSize } },
        }),
  });

  const activeFilters = Object.entries(filterValues).filter(([, v]) => v && v !== "all");

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, i) => (
                <TableHead key={i}>
                  <div className="h-4 bg-muted animate-pulse rounded" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((_, j) => (
                  <TableCell key={j}>
                    <div className="h-4 bg-muted animate-pulse rounded" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {searchKey && (
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (onSearch) debouncedSearch(e.target.value);
            }}
            className="max-w-sm"
          />
        )}
        {filters.map((filter) => (
          <Select
            key={filter.key}
            value={filterValues[filter.key] ?? "all"}
            onValueChange={(v) => setFilterValues((prev) => ({ ...prev, [filter.key]: v }))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={filter.placeholder ?? filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {filter.label}</SelectItem>
              {filter.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
        {activeFilters.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setFilterValues({})}>
            <X className="h-3 w-3 mr-1" />
            Xoá bộ lọc
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto">
              <Settings2 className="h-4 w-4 mr-1" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table.getAllLeafColumns()
              .filter((col) => col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  className="capitalize"
                  checked={col.getIsVisible()}
                  onCheckedChange={(value) => col.toggleVisibility(!!value)}
                >
                  {typeof col.columnDef.header === "string"
                    ? col.columnDef.header
                    : col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  return (
                    <TableHead
                      key={header.id}
                      className={canSort ? "cursor-pointer select-none" : ""}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          header.column.getIsSorted() === "asc" ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronsUpDown className="h-4 w-4 opacity-30" />
                          )
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={onRowClick ? "cursor-pointer" : ""}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {total ?? filteredData.length} kết quả
          </p>
          <NativeSelect
            value={String(pagination.pageSize)}
            onChange={(e) => {
              const size = Number(e.target.value);
              setPagination({ pageIndex: 0, pageSize: size });
              onPageSizeChange?.(size);
            }}
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>{size} / trang</option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            Đầu
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm whitespace-nowrap">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            Cuối
          </Button>
        </div>
      </div>
    </div>
  );
}
