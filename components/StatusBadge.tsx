import type { ItemStatus, ItemType } from "@/types";
import { cn } from "@/lib/utils";

export function StatusBadge({
  type,
  status,
}: {
  type: ItemType;
  status?: ItemStatus;
}) {
  if (status === "resolved") {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-slate-600">
        Returned
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        type === "lost"
          ? "bg-orange-50 text-orange-700"
          : "bg-emerald-50 text-emerald-700",
      )}
    >
      {type === "lost" ? "Lost" : "Found"}
    </span>
  );
}
