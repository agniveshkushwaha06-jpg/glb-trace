import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Calendar, MapPin, Tag } from "lucide-react";
import { ClaimForm } from "@/components/ClaimForm";
import { ClaimDecision } from "@/components/ClaimDecision";
import { ClaimContact } from "@/components/ClaimContact";
import { ReportItemButton } from "@/components/ReportItemButton";
import { OwnerActions } from "@/components/OwnerActions";
import { StatusBadge } from "@/components/StatusBadge";
import { fetchItemById } from "@/lib/items";
import { formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { SetupNotice } from "@/components/SetupNotice";

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <SetupNotice />
      </div>
    );
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/items/${id}`);
  }

  let item;
  try {
    item = await fetchItemById(id);
  } catch {
    notFound();
  }
  if (!item) notFound();

  const isOwner = user.id === item.reported_by;
  const [{ data: claims }, { data: secret }, { data: ownClaim }] = await Promise.all([
    supabase.from("claims").select("id, claimant_id, answer, status, created_at").eq("item_id", id).order("created_at", { ascending: false }),
    isOwner ? supabase.from("item_secrets").select("answer").eq("item_id", id).maybeSingle() : Promise.resolve({ data: null }),
    !isOwner ? supabase.from("claims").select("id, status").eq("item_id", id).eq("claimant_id", user.id).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  const approved = (claims ?? []).some((claim) => claim.status === "approved");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/items" className="text-sm font-medium text-accent hover:underline">
        ← Back to listings
      </Link>
      <div className="mt-4 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="aspect-[16/10] bg-slate-100">
          {item.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">No photo</div>
          )}
        </div>
        <div className="space-y-5 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge type={item.type} status={item.status} />
            <span className="inline-flex items-center gap-1 text-sm text-slate-600">
              <Tag className="h-3.5 w-3.5" />
              {item.category}
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">{item.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {item.location}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(item.item_date)}
            </span>
          </div>
          <p className="whitespace-pre-wrap text-slate-700">
            {item.description || "No description provided."}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className={`rounded-xl p-3 text-sm ${item.status === "resolved" ? "bg-emerald-50 text-emerald-900" : "bg-slate-50 text-slate-600"}`}>
              <p className="font-semibold">1 · Reported</p><p>{item.type === "found" ? "Found on campus" : "Lost on campus"}</p>
            </div>
            <div className={`rounded-xl p-3 text-sm ${approved ? "bg-emerald-50 text-emerald-900" : "bg-slate-50 text-slate-600"}`}>
              <p className="font-semibold">2 · Verified claim</p><p>{approved ? "Reporter approved" : "Waiting for owner approval"}</p>
            </div>
            <div className={`rounded-xl p-3 text-sm ${item.status === "resolved" ? "bg-emerald-50 text-emerald-900" : "bg-slate-50 text-slate-600"}`}>
              <p className="font-semibold">3 · Returned</p><p>{item.status === "resolved" ? "Handover complete" : "Not yet returned"}</p>
            </div>
          </div>
          {isOwner ? <div className="space-y-4">
            {item.type === "found" ? <section className="rounded-2xl border border-slate-200 p-4"><h2 className="font-semibold">Incoming claims</h2>
              {(claims ?? []).length === 0 ? <p className="mt-2 text-sm text-slate-600">No one has claimed this item yet.</p> : <div className="mt-3 space-y-3">{claims?.map((claim) => <ClaimDecision key={claim.id} claimId={claim.id} answer={claim.answer} correctAnswer={secret?.answer ?? "Not set"} status={claim.status} />)}</div>}
            </section> : null}
            <OwnerActions itemId={item.id} status={item.status} canReturn={approved} />
          </div> : item.status === "open" && item.type === "found" && item.verification_question ? (
            ownClaim ? <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">Your claim is <strong className="capitalize">{ownClaim.status}</strong>. Handover details appear after approval.</p> : <ClaimForm itemId={id} question={item.verification_question} />
          ) : null}
          {approved ? <ClaimContact itemId={id} /> : <p className="text-sm text-slate-500">Contact information stays private until a claim is approved.</p>}
          <ReportItemButton itemId={id} />
        </div>
      </div>
    </div>
  );
}
