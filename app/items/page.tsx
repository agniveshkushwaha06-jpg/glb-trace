import { Suspense } from "react";
import { EmptyState } from "@/components/EmptyState";
import { FilterBar } from "@/components/FilterBar";
import { ItemGrid, ItemGridSkeleton } from "@/components/ItemGrid";
import { SearchBar } from "@/components/SearchBar";
import { fetchItems } from "@/lib/items";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { SetupNotice } from "@/components/SetupNotice";

async function ItemsResults({
  q,
  type,
  category,
  location,
  dateFrom,
  dateTo,
  resolved,
}: {
  q?: string;
  type?: string;
  category?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  resolved?: string;
}) {
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
        title="Sign in to browse listings"
        description="Campus listings are visible after you sign in with Google."
        actionHref="/login?next=/items"
        actionLabel="Continue with Google"
      />
    );
  }

  let items;
  try {
    items = await fetchItems({
      q,
      type,
      category: category && category !== "all" ? category : undefined,
      location: location && location !== "all" ? location : undefined,
      dateFrom,
      dateTo,
      includeResolved: resolved === "1",
    });

  } catch (error) {
    return (
      <EmptyState
        title="Could not load listings"
        description={error instanceof Error ? error.message : "Please try again."}
      />
    );
  }
  if (items.length === 0) {
    return <EmptyState
      title="No matching items"
      description="Try a different search or filter, or report something you lost or found."
      actionHref="/report"
      actionLabel="Report an item"
    />;
  }
  return <ItemGrid items={items} />;
}

export default async function ItemsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    type?: string;
    category?: string;
    location?: string;
    dateFrom?: string;
    dateTo?: string;
    resolved?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Listings</h1>
      <p className="mt-1 text-sm text-slate-600">Search and filter open lost and found reports.</p>
      <div className="mt-6 space-y-4">
        <Suspense>
          <SearchBar />
          <FilterBar />
        </Suspense>
        <Suspense fallback={<ItemGridSkeleton />}>
          <ItemsResults
            q={params.q}
            type={params.type}
            category={params.category}
            location={params.location}
            dateFrom={params.dateFrom}
            dateTo={params.dateTo}
            resolved={params.resolved}
          />
        </Suspense>
      </div>
    </div>
  );
}
