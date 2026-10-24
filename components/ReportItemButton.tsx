"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ReportItemButton({ itemId }: { itemId: string }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function report() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Sign in first to report this post."); return; }
    const { error: reportError } = await supabase.from("reports").insert({ item_id: itemId, reporter_id: user.id, reason: "Inappropriate or inaccurate post" });
    if (reportError?.code === "23505") setSent(true);
    else if (reportError) setError(reportError.message);
    else setSent(true);
  }
  return <div className="mt-3"><button onClick={report} disabled={sent} className="text-sm text-slate-500 underline disabled:no-underline">{sent ? "Post reported" : "Report this post"}</button>{error ? <p className="text-xs text-red-700">{error}</p> : null}</div>;
}
