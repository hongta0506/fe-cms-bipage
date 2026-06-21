"use client";

import { useQuery } from "@tanstack/react-query";
import { Globe } from "lucide-react";

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { api } from "@/lib/api";
import { useDomainStore } from "@/stores/domain/domain-store";

export function DomainSwitcher() {
  const selectedDomainId = useDomainStore((s) => s.selectedDomainId);
  const setSelectedDomainId = useDomainStore((s) => s.setSelectedDomainId);

  // Direct query — don't use useContent which adds domainId filter
  const { data } = useQuery({
    queryKey: ["domains-list"],
    queryFn: () => api.getContent("domains", { pageSize: 100 }),
  });

  const domains = (data?.items ?? []) as { id: number; name: string }[];

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton className="gap-2">
          <Globe className="h-4 w-4 shrink-0" />
          <select
            value={selectedDomainId != null ? String(selectedDomainId) : ""}
            onChange={(e) => setSelectedDomainId(e.target.value ? Number(e.target.value) : null)}
            className="flex-1 cursor-pointer bg-transparent text-sm outline-none"
          >
            <option value="">Tất cả tên miền</option>
            {domains.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
