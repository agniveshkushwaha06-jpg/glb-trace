import { redirect } from "next/navigation";
import { SetupNotice } from "@/components/SetupNotice";
import { AdminRemoveButton } from "@/components/AdminRemoveButton";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type AdminItem = { id: string; title: string; item_type: string; category: string; location: string; status: string; reports: number; created_at: string };

export default async function AdminPage() {
  if (!isSupabaseConfigured()) return <div className="mx-auto max-w-5xl px-4 py-10"><SetupNotice /></div>;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");
  const [{ data: stats, error: statsError }, { data: itemRows, error: itemsError }] = await Promise.all([
    supabase.rpc("admin_stats"), supabase.rpc("admin_list_items"),
  ]);
  const overview = Array.isArray(stats) ? stats[0] : stats;
  if (statsError || itemsError) return <div className="mx-auto max-w-5xl px-4 py-10"><h1 className="text-2xl font-semibold">Admin dashboard</h1><p className="mt-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{statsError?.message ?? itemsError?.message ?? "Could not load dashboard."}<br />Add your email to the <code>admin_emails</code> list in Supabase to open this page.</p></div>;
  const items = (itemRows ?? []) as AdminItem[];
  return <div className="mx-auto max-w-5xl px-4 py-10">
    <p className="text-sm font-semibold uppercase tracking-widest text-accent">Staff tools</p><h1 className="mt-2 text-3xl font-semibold">Admin dashboard</h1>
    <div className="mt-6 grid gap-3 sm:grid-cols-4">{[
      ["All items", overview?.total_items ?? 0], ["Returned", overview?.returned_items ?? 0], ["Students", overview?.total_users ?? 0], ["Post reports", overview?.reported_posts ?? 0],
    ].map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>)}</div>
    <section className="mt-8"><h2 className="text-xl font-semibold">Campus posts</h2><div className="mt-3 space-y-3">{items.map((item) => <article key={item.id} className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 sm:flex-row sm:items-center"><div><a href={`/items/${item.id}`} className="font-semibold hover:text-accent">{item.title}</a><p className="mt-1 text-sm text-slate-600">{item.item_type} · {item.category} · {item.location} · {item.reports} report(s)</p></div><AdminRemoveButton itemId={item.id} /></article>)}</div></section>
  </div>;
}
