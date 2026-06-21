"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth/auth-store";

import { RolesTable } from "./_components/roles-table";
import { RoleFormDialog } from "./_components/role-form";

export default function RolesPage() {
  const router = useRouter();
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push("/auth/v1/login");
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Roles</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Role
        </Button>
      </div>
      <RolesTable />
      <RoleFormDialog open={showForm} onOpenChange={setShowForm} />
    </div>
  );
}
