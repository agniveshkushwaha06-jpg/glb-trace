"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function OwnerActions({
  itemId,
  status,
  canReturn = true,
}: {
  itemId: string;
  status: "open" | "resolved";
  canReturn?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"resolve" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function markResolved() {
    setError(null);
    setLoading("resolve");
    const supabase = createClient();
    const { error: updateError } = await supabase.rpc("mark_returned", { p_item_id: itemId });
    setLoading(null);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.refresh();
  }

  async function remove() {
    if (!window.confirm("Delete this report? This cannot be undone.")) return;
    setError(null);
    setLoading("delete");
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("items").delete().eq("id", itemId);
    setLoading(null);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    router.push("/my-items");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        {status === "open" && canReturn ? (
          <button
            type="button"
            onClick={markResolved}
            disabled={loading !== null}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-slate-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {loading === "resolve" ? "Updating..." : "Mark as Returned"}
          </button>
        ) : null}
        {status === "open" && !canReturn ? <p className="text-sm text-slate-500">Approve a claim before marking this item returned.</p> : null}
        <button
          type="button"
          onClick={remove}
          disabled={loading !== null}
          className="inline-flex items-center justify-center rounded-full border border-red-200 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
        >
          {loading === "delete" ? "Deleting..." : "Delete"}
        </button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
