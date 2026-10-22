import Link from "next/link";
import { SearchX } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  icon,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-700">
        {icon ?? <SearchX className="h-6 w-6" />}
      </div>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-slate-600">{description}</p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-6 inline-flex items-center rounded-full bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
