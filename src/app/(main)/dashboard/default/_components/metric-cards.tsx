"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useContentCount, useStats } from "@/hooks/use-dashboard";

function MetricCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-8" />
      </CardHeader>
      <CardContent>
        <Skeleton className="mb-1 h-7 w-[60px]" />
        <Skeleton className="h-3 w-[120px]" />
      </CardContent>
    </Card>
  );
}

export function MetricCards() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: postsCount, isLoading: postsLoading } = useContentCount("posts");
  const { data: categoriesCount, isLoading: categoriesLoading } = useContentCount("categories");
  const { data: tagsCount, isLoading: tagsLoading } = useContentCount("tags");

  const isLoading = statsLoading || postsLoading || categoriesLoading || tagsLoading;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {["posts", "categories", "tags", "users"].map((metric) => (
          <MetricCardSkeleton key={metric} />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Posts",
      value: postsCount ?? 0,
      description: "Total articles",
    },
    {
      title: "Categories",
      value: categoriesCount ?? 0,
      description: "Content categories",
    },
    {
      title: "Tags",
      value: tagsCount ?? 0,
      description: "Content tags",
    },
    {
      title: "Users",
      value: stats?.users ?? 0,
      description: "Registered users",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{card.value.toLocaleString()}</div>
            <p className="text-muted-foreground text-xs">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
