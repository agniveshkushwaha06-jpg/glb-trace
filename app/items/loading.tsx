import { ItemGridSkeleton } from "@/components/ItemGrid";

export default function ItemsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
      <div className="mt-6 h-12 animate-pulse rounded-full bg-slate-200" />
      <div className="mt-4">
        <ItemGridSkeleton />
      </div>
    </div>
  );
}
