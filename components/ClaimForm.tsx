"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ClaimForm({ itemId, question }: { itemId: string; question: string }) {
  const router = useRouter();
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Please sign in to claim this item.");
      setBusy(false);
      return;
    }
    const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
    if (!profile) {
      setError("Please complete your profile first, then come back and submit your claim.");
      setBusy(false);
      return;
    }
    const { error: saveError } = await supabase.from("claims").insert({
      item_id: itemId,
      claimant_id: user.id,
      answer: answer.trim(),
    });
    if (saveError) setError(saveError.code === "23505" ? "You have already claimed this item." : saveError.message);
    else router.refresh();
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <h2 className="font-semibold text-slate-900">Think this belongs to you?</h2>
      <p className="mt-1 text-sm text-slate-700">Answer the reporter’s private question to support your claim.</p>
      <label className="mt-3 block text-sm font-medium text-slate-800">
        {question}
        <input required maxLength={300} value={answer} onChange={(event) => setAnswer(event.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" />
      </label>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
      <button disabled={busy} className="mt-3 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {busy ? "Sending..." : "Submit claim"}
      </button>
    </form>
  );
}
