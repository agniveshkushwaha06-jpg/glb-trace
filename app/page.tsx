import Link from "next/link";
import { Suspense } from "react";
import { SearchBar } from "@/components/SearchBar";
import { ItemGrid, ItemGridSkeleton } from "@/components/ItemGrid";
import { EmptyState } from "@/components/EmptyState";
import { fetchItems } from "@/lib/items";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { SetupNotice } from "@/components/SetupNotice";

async function LatestItems() {
  if (!isSupabaseConfigured()) {
    return <SetupNotice />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <EmptyState
        title="Sign in to see listings"
        description="Listings are available to signed-in students so contact details stay on campus."
        actionHref="/login"
        actionLabel="Continue with Google"
      />
    );
  }

  let items;
  try {
    items = await fetchItems({ limit: 6 });
  } catch (error) {
    return (
      <EmptyState
        title="Could not load listings"
        description={error instanceof Error ? error.message : "Check your Supabase project and try again."}
      />
    );
  }
  if (items.length === 0) {
    return (
      <EmptyState
        title="No reports yet"
        description="Be the first to report a lost or found item."
        actionHref="/report"
        actionLabel="Report an item"
      />
    );
  }

  return <ItemGrid items={items} />;
}

export default function HomePage() {
  return (
    <div>
      <section className="border-b border-teal-100 bg-gradient-to-b from-teal-50 to-transparent">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
            Campus Lost & Found
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Lost it on campus. Trace it here.
          </h1>
          <p className="mt-4 max-w-xl text-base text-slate-600 sm:text-lg">
            Report lost or found ID cards, wallets, books and more. Search campus listings,
            prove your claim, and arrange a trusted handover.
          </p>
          <div className="mt-8 max-w-xl">
            <Suspense>
              <SearchBar />
            </Suspense>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/report"
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
            >
              Report lost / found
            </Link>
            <Link
              href="/items"
              className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Browse listings
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Latest items</h2>
            <p className="text-sm text-slate-600">Newest open reports on campus.</p>
          </div>
          <Link href="/items" className="text-sm font-medium text-accent hover:underline">
            View all
          </Link>
        </div>
        <Suspense fallback={<ItemGridSkeleton />}>
          <LatestItems />
        </Suspense>
      </section>
    </div>
  );
}
