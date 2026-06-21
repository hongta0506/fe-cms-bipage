"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  const router = useRouter();
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const [saving, setSaving] = useState(false);

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
      <h2 className="text-2xl font-bold">Profile</h2>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Account Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Username</Label>
            <Input value={user.username} disabled />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user.email} disabled />
          </div>
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={user.name} disabled />
          </div>
          <p className="text-sm text-muted-foreground">
            Profile editing is managed through the Users section.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
