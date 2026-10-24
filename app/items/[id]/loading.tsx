export default function ItemDetailLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
      <div className="mt-4 overflow-hidden rounded-3xl border border-slate-100 bg-white">
        <div className="aspect-[16/10] animate-pulse bg-slate-200" />
        <div className="space-y-3 p-6">
          <div className="h-6 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-8 w-2/3 animate-pulse rounded bg-slate-200" />
          <div className="h-20 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
