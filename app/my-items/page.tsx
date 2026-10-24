import { redirect } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { OwnerActions } from "@/components/OwnerActions";
import { StatusBadge } from "@/components/StatusBadge";
import { fetchItems } from "@/lib/items";
import { formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { SetupNotice } from "@/components/SetupNotice";
import Link from "next/link";

export default async function MyItemsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">My items</h1>
        <div className="mt-6">
          <SetupNotice />
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/my-items");

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
  if (!profile) redirect("/profile");

  const items = await fetchItems({ reportedBy: user.id, includeResolved: true });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">My items</h1>
      <p className="mt-1 text-sm text-slate-600">Reports you posted. Mark them resolved when they are done.</p>
      <div className="mt-6 space-y-4">
        {items.length === 0 ? (
          <EmptyState
            title="You have not reported anything yet"
            description="Lost a bottle or found a set of keys? Add it so other students can find you."
            actionHref="/report"
            actionLabel="Report an item"
            icon={<ClipboardList className="h-6 w-6" />}
          />
        ) : (
          items.map((item) => (
            <article
              key={item.id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row"
            >
              <Link href={`/items/${item.id}`} className="h-28 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:w-36">
                {item.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-slate-400">No photo</div>
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge type={item.type} status={item.status} />
                  <span className="text-xs text-slate-500">{formatDate(item.item_date)}</span>
                </div>
                <Link href={`/items/${item.id}`} className="mt-1 block truncate text-lg font-semibold hover:text-accent">
                  {item.title}
                </Link>
                <p className="text-sm text-slate-600">
                  {item.category} · {item.location}
                </p>
                <div className="mt-3">
                  <OwnerActions itemId={item.id} status={item.status} />
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
