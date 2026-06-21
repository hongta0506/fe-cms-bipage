"use client";

import { Globe } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useContent } from "@/hooks/use-dashboard";
import { useDomainStore } from "@/stores/domain/domain-store";

export function DomainSwitcher() {
  const { selectedDomainId, setSelectedDomainId } = useDomainStore();
  const { data } = useContent("domains", { pageSize: 100 });
  const domains = (data?.items ?? []) as { id: number; name: string }[];

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Select
          value={selectedDomainId ? String(selectedDomainId) : "all"}
          onValueChange={(v) => setSelectedDomainId(v === "all" ? null : Number(v))}
        >
          <SelectTrigger className="w-full">
            <SidebarMenuButton className="gap-2 w-full">
              <Globe className="h-4 w-4 shrink-0" />
              <SelectValue placeholder="All Domains" />
            </SidebarMenuButton>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Domains</SelectItem>
            {domains.map((d) => (
              <SelectItem key={d.id} value={String(d.id)}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
