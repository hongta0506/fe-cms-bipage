"use client";

import { useMemo } from "react";

import { format, startOfDay, subDays } from "date-fns";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useContentAll } from "@/hooks/use-dashboard";

export function PerformanceOverview() {
  const { data, isLoading } = useContentAll("posts", { pageSize: 30 });

  const chartData = useMemo(() => {
    if (!data?.items) return [];

    const now = new Date();
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(now, 29 - i);
      return {
        date: format(date, "MMM dd"),
        count: 0,
      };
    });

    (data.items as { created_at?: string }[]).forEach((item) => {
      if (!item.created_at) return;
      const created = startOfDay(new Date(item.created_at));
      const dayStr = format(created, "MMM dd");
      const entry = last30Days.find((d) => d.date === dayStr);
      if (entry) entry.count++;
    });

    return last30Days;
  }, [data]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Activity</CardTitle>
        <CardDescription>Posts created in the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
