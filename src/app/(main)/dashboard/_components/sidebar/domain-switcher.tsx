"use client";

import { Globe } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useContent } from "@/hooks/use-dashboard";
import { useDomainStore } from "@/stores/domain/domain-store";

export function DomainSwitcher() {
  const selectedDomainId = useDomainStore((s) => s.selectedDomainId);
  const setSelectedDomainId = useDomainStore((s) => s.setSelectedDomainId);
  const { data } = useContent("domains", { pageSize: 100 });
  const domains = (data?.items ?? []) as { id: number; name: string }[];

  const currentValue = selectedDomainId != null ? String(selectedDomainId) : "all";

  const handleChange = (v: string) => {
    setSelectedDomainId(v === "all" ? null : Number(v));
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Select value={currentValue} onValueChange={handleChange}>
          <SelectTrigger className="w-full">
            <SidebarMenuButton className="gap-2 w-full pointer-events-none">
              <Globe className="h-4 w-4 shrink-0" />
              <SelectValue />
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
