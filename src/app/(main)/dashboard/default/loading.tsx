import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="@container/main flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-[120px]" />
        <Skeleton className="h-[120px]" />
        <Skeleton className="h-[120px]" />
        <Skeleton className="h-[120px]" />
      </div>
      <Skeleton className="h-[350px] w-full" />
      <Skeleton className="h-[300px] w-full" />
    </div>
  );
}
