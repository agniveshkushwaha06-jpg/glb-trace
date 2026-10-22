import Link from "next/link";
import { MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { ItemWithReporter } from "@/types";
import { StatusBadge } from "./StatusBadge";

export function ItemCard({ item }: { item: ItemWithReporter }) {
  return (
    <Link
      href={`/items/${item.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-slate-100">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt={item.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
            No photo
          </div>
        )}
        <div className="absolute left-3 top-3">
          <StatusBadge type={item.type} status={item.status} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-teal-700">
          {item.category}
        </p>
        <h3 className="line-clamp-1 text-base font-semibold text-foreground group-hover:text-accent">
          {item.title}
        </h3>
        <p className="mt-auto flex items-center gap-1 text-sm text-slate-600">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{item.location}</span>
          <span className="ml-auto shrink-0 text-xs text-slate-400">
            {formatDate(item.item_date)}
          </span>
        </p>
      </div>
    </Link>
  );
}
