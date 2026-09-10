"use client";

import { useCallback, useEffect, useState } from "react";

import { AlertTriangle, CheckCircle2, Gift, Loader2, RotateCcw, Send } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/providers/locale-provider";

type Release = { version: number; hash: string; publishedAt?: string; active: boolean };
type Current = { active?: Release; versions: Release[] };

const copy = {
  vi: {
    title: "Xuất bản cấu hình phần thưởng",
    subtitle: "Đồng bộ cấu hình đang bật từ FastSchema sang Nakama runtime.",
    active: "Phiên bản đang dùng",
    none: "Chưa có phiên bản đang hoạt động",
    publish: "Kiểm tra và xuất bản",
    publishing: "Đang xuất bản...",
    history: "Lịch sử phiên bản",
    rollback: "Khôi phục",
    confirm: "Khôi phục phiên bản này? Cấu hình runtime hiện tại sẽ được thay thế.",
    success: "Cập nhật runtime thành công.",
    loadError: "Không thể tải trạng thái cấu hình.",
    version: "Phiên bản",
    published: "Xuất bản",
    activeBadge: "Đang dùng",
  },
  en: {
    title: "Publish reward configuration",
    subtitle: "Sync enabled FastSchema configuration to Nakama runtime.",
    active: "Active release",
    none: "No active release",
    publish: "Validate and publish",
    publishing: "Publishing...",
    history: "Release history",
    rollback: "Rollback",
    confirm: "Rollback to this release? Current runtime configuration will be replaced.",
    success: "Runtime updated successfully.",
    loadError: "Could not load configuration status.",
    version: "Version",
    published: "Published",
    activeBadge: "Active",
  },
};

export default function RewardPublishPage() {
  const { locale } = useLocale();
  const t = copy[locale];
  const [data, setData] = useState<Current>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ error?: boolean; text: string }>();

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/rewards/current", { cache: "no-store" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      setData(body);
    } catch (e) {
      setMessage({ error: true, text: (e as Error).message || t.loadError });
    }
  }, [t.loadError]);

  useEffect(() => {
    void load();
  }, [load]);

  async function mutate(path: string, body?: object) {
    setBusy(true);
    setMessage(undefined);
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setMessage({ text: `${t.success} ${t.version} ${result.version}.` });
      await load();
    } catch (e) {
      setMessage({ error: true, text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  const versions = [...(data?.versions ?? [])].sort((a, b) => b.version - a.version);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Gift className="size-5" />
          </div>
          <h1 className="text-balance font-heading font-semibold text-2xl tracking-tight sm:text-3xl">{t.title}</h1>
          <p className="mt-2 text-pretty text-muted-foreground">{t.subtitle}</p>
        </div>
        <Button disabled={busy} onClick={() => void mutate("/api/rewards/publish")}>
          {busy ? <Loader2 className="animate-spin" /> : <Send />} {busy ? t.publishing : t.publish}
        </Button>
      </header>

      {message && (
        <div
          role="status"
          className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${message.error ? "border-destructive/30 bg-destructive/5 text-destructive" : "border-emerald-600/25 bg-emerald-600/5 text-emerald-700 dark:text-emerald-400"}`}
        >
          {message.error ? (
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          ) : (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t.active}</CardTitle>
          <CardDescription>{data?.active ? `${t.version} ${data.active.version}` : t.none}</CardDescription>
        </CardHeader>
        {data?.active && (
          <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t pt-4">
            <Badge>{t.activeBadge}</Badge>
            <code className="break-all text-muted-foreground text-xs">{data.active.hash}</code>
            {data.active.publishedAt && (
              <span className="text-muted-foreground text-sm">
                {new Date(data.active.publishedAt).toLocaleString(locale)}
              </span>
            )}
          </CardContent>
        )}
      </Card>

      <section>
        <h2 className="mb-3 font-heading font-medium text-lg">{t.history}</h2>
        <div className="overflow-hidden rounded-xl border bg-card">
          {versions.length === 0 ? (
            <p className="p-6 text-muted-foreground text-sm">{t.none}</p>
          ) : (
            versions.map((release, index) => (
              <div
                key={release.version}
                className={`flex flex-wrap items-center justify-between gap-3 p-4 ${index ? "border-t" : ""}`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {t.version} {release.version}
                    </span>
                    {release.active && <Badge variant="secondary">{t.activeBadge}</Badge>}
                  </div>
                  <code className="block max-w-full truncate text-muted-foreground text-xs">{release.hash}</code>
                </div>
                {!release.active && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() =>
                      window.confirm(t.confirm) && void mutate("/api/rewards/rollback", { version: release.version })
                    }
                  >
                    <RotateCcw />
                    {t.rollback}
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
