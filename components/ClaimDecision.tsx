"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ClaimDecision({ claimId, answer, correctAnswer, status }: {
  claimId: string; answer: string; correctAnswer: string; status: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { error: actionError } = await createClient().rpc("decide_claim", { p_claim_id: claimId, p_approve: approve });
    if (actionError) setError(actionError.message);
    else router.refresh();
    setBusy(false);
  }
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium">Claim answer: <span className="font-normal">{answer}</span></p>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize">{status}</span>
      </div>
      <p className="mt-2 text-sm text-slate-600">Your saved answer: <strong className="text-slate-900">{correctAnswer}</strong></p>
      {status === "pending" ? <div className="mt-3 flex gap-2">
        <button disabled={busy} onClick={() => decide(true)} className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Approve</button>
        <button disabled={busy} onClick={() => decide(false)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60">Reject</button>
      </div> : null}
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </article>
  );
}
