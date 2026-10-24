"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AdminRemoveButton({ itemId }: { itemId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function remove() {
    if (!window.confirm("Remove this post from the campus feed?")) return;
    setBusy(true);
    const { error: actionError } = await createClient().rpc("admin_remove_item", { p_item_id: itemId });
    if (actionError) setError(actionError.message);
    else router.refresh();
    setBusy(false);
  }
  return <div><button onClick={remove} disabled={busy} className="rounded-full border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-700 disabled:opacity-60">{busy ? "Removing…" : "Remove post"}</button>{error ? <p className="mt-1 text-xs text-red-700">{error}</p> : null}</div>;
}
