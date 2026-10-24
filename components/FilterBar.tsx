"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES, LOCATIONS } from "@/lib/constants";

function updateParam(
  current: URLSearchParams,
  key: string,
  value: string,
) {
  const params = new URLSearchParams(current.toString());
  if (!value || value === "all") params.delete(key);
  else params.set(key, value);
  return params;
}

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") ?? "all";
  const category = searchParams.get("category") ?? "all";
  const location = searchParams.get("location") ?? "all";
  const dateFrom = searchParams.get("dateFrom") ?? "";
  const dateTo = searchParams.get("dateTo") ?? "";
  const includeResolved = searchParams.get("resolved") === "1";

  function push(params: URLSearchParams) {
    router.push(`/items?${params.toString()}`);
  }

  const selectClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";

  return (
    <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
      <label className="block text-xs font-medium text-slate-500">
        Type
        <select
          className={`mt-1 ${selectClass}`}
          value={type}
          onChange={(event) => push(updateParam(searchParams, "type", event.target.value))}
        >
          <option value="all">All</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>
      </label>
      <label className="block text-xs font-medium text-slate-500">
        From date
        <input type="date" value={dateFrom} onChange={(event) => push(updateParam(searchParams, "dateFrom", event.target.value))} className={`mt-1 ${selectClass}`} />
      </label>
      <label className="block text-xs font-medium text-slate-500">
        To date
        <input type="date" value={dateTo} onChange={(event) => push(updateParam(searchParams, "dateTo", event.target.value))} className={`mt-1 ${selectClass}`} />
      </label>
      <label className="block text-xs font-medium text-slate-500">
        Category
        <select
          className={`mt-1 ${selectClass}`}
          value={category}
          onChange={(event) =>
            push(updateParam(searchParams, "category", event.target.value))
          }
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-xs font-medium text-slate-500">
        Location
        <select
          className={`mt-1 ${selectClass}`}
          value={location}
          onChange={(event) =>
            push(updateParam(searchParams, "location", event.target.value))
          }
        >
          <option value="all">All locations</option>
          {LOCATIONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-end gap-2 pb-2 text-sm text-slate-700">
        <input
          type="checkbox"
          className="h-4 w-4 accent-teal-700"
          checked={includeResolved}
          onChange={(event) => {
            const params = new URLSearchParams(searchParams.toString());
            if (event.target.checked) params.set("resolved", "1");
            else params.delete("resolved");
            push(params);
          }}
        />
        Include resolved
      </label>
    </div>
  );
}
