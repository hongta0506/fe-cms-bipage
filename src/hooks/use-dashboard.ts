import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import { useDomainStore } from "@/stores/domain/domain-store";

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: () => api.getStats(),
  });
}

export function useContent(schema: string, options?: { page?: number; pageSize?: number; sort?: string }) {
  const domainId = useDomainStore((s) => s.selectedDomainId);
  return useQuery({
    queryKey: ["content", schema, { ...options, domainId }],
    queryFn: () => api.getContent(schema, { ...options, domainId }),
    enabled: !!schema,
  });
}

export function useSchemas() {
  return useQuery({
    queryKey: ["schemas"],
    queryFn: () => api.getSchemas(),
  });
}

/** Fetch content WITHOUT domain filter — use for reference data (authors, domains, categories). */
export function useContentAll(schema: string, options?: { page?: number; pageSize?: number; sort?: string }) {
  return useQuery({
    queryKey: ["content-all", schema, options],
    queryFn: () => api.getContent(schema, options),
    enabled: !!schema,
  });
}

export function useContentCount(schema: string) {
  const domainId = useDomainStore((s) => s.selectedDomainId);
  return useQuery({
    queryKey: ["content-count", schema, { domainId }],
    queryFn: async () => {
      const res = await api.getContent(schema, { pageSize: 0, domainId });
      return res.total;
    },
    enabled: !!schema,
  });
}

export function useCreateContent(schema: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.createContent(schema, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["content", schema] });
      qc.invalidateQueries({ queryKey: ["content-count", schema] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useUpdateContent(schema: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => api.updateContent(schema, id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["content", schema] });
    },
  });
}

export function useDeleteContent(schema: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.deleteContent(schema, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["content", schema] });
      qc.invalidateQueries({ queryKey: ["content-count", schema] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}
