import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { SetupNotice } from "@/components/SetupNotice";

type ActivityClaim = { id: string; item_id: string; answer: string; status: string; created_at: string; items: { title: string } | null };

export default async function ActivityPage() {
  if (!isSupabaseConfigured()) return <div className="mx-auto max-w-3xl px-4 py-10"><SetupNotice /></div>;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/activity");
  const [{ data: reports }, { data: claims }, { data: incoming }] = await Promise.all([
    supabase.from("items").select("id,title,status,type").eq("reported_by", user.id).order("created_at", { ascending: false }),
    supabase.from("claims").select("id,item_id,answer,status,created_at,items(title)").eq("claimant_id", user.id).order("created_at", { ascending: false }),
    supabase.from("claims").select("id,item_id,answer,status,created_at,items!inner(title,reported_by)").eq("items.reported_by", user.id).order("created_at", { ascending: false }),
  ]);
  const myClaims = (claims ?? []) as unknown as ActivityClaim[];
  const incomingClaims = (incoming ?? []) as unknown as ActivityClaim[];
  const section = (title: string, entries: ActivityClaim[]) => <section className="mt-7"><h2 className="text-lg font-semibold">{title}<span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs">{entries.filter((entry) => entry.status === "pending").length} pending</span></h2>{entries.length ? <div className="mt-3 space-y-2">{entries.map((entry) => <Link key={entry.id} href={`/items/${entry.item_id}`} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4"><span><span className="block font-medium">{entry.items?.title ?? "Campus item"}</span><span className="text-sm text-slate-500">Your answer: {entry.answer}</span></span><span className="text-sm capitalize text-slate-600">{entry.status} →</span></Link>)}</div> : <p className="mt-3 rounded-xl bg-white p-4 text-sm text-slate-500">Nothing here yet.</p>}</section>;
  return <div className="mx-auto max-w-3xl px-4 py-10"><h1 className="text-3xl font-semibold">Your activity</h1><p className="mt-1 text-sm text-slate-600">See your posts, claims, and requests from other students.</p>
    <section className="mt-7"><h2 className="text-lg font-semibold">My reports</h2>{reports?.length ? <div className="mt-3 space-y-2">{reports.map((item) => <Link key={item.id} href={`/items/${item.id}`} className="flex justify-between rounded-xl border border-slate-100 bg-white p-4"><span className="font-medium">{item.title}</span><span className="text-sm capitalize text-slate-500">{item.status === "resolved" ? "returned" : item.type}</span></Link>)}</div> : <p className="mt-3 rounded-xl bg-white p-4 text-sm text-slate-500">You have not posted anything yet.</p>}</section>
    {section("Claims I sent", myClaims)}{section("Claims on my found items", incomingClaims)}
  </div>;
}
