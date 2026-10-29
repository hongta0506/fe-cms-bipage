"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <AlertTriangle className="h-12 w-12 text-destructive" />
      <h2 className="font-semibold text-xl">Something went wrong</h2>
      <p className="max-w-md text-center text-muted-foreground">{error.message || "An unexpected error occurred."}</p>
      <Button onClick={reset} variant="outline">
        <RefreshCw className="mr-2 h-4 w-4" />
        Try again
      </Button>
    </div>
  );
}
