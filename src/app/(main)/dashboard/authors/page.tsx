"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth/auth-store";

import { AuthorFormDialog } from "./_components/author-form";
import { AuthorsTable } from "./_components/authors-table";

export default function AuthorsPage() {
  const router = useRouter();
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push("/auth/v1/login");
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-2xl">Authors</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Author
        </Button>
      </div>
      <AuthorsTable />
      <AuthorFormDialog open={showForm} onOpenChange={setShowForm} />
    </div>
  );
}
