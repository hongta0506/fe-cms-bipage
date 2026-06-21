"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth/auth-store";
import { useSchemas } from "@/hooks/use-dashboard";
import { DynamicSchemaPage } from "@/components/ui/dynamic-schema-page";

export default function DynamicSchemaRoute() {
  const router = useRouter();
  const params = useParams();
  const schemaName = params.schema as string;

  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const { data: schemas, isLoading: schemasLoading } = useSchemas();

  useEffect(() => {
    if (!isLoading && !user) router.push("/auth/v1/login");
  }, [isLoading, user, router]);

  const schema = useMemo(() => {
    if (!schemas) return null;
    const found = schemas.find((s) => s.name === schemaName);
    return found ?? null;
  }, [schemas, schemaName]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (schemasLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">Schema "{schemaName}" not found.</p>
      </div>
    );
  }

  return <DynamicSchemaPage schema={schema} />;
}
