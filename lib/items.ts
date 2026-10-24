import type { ItemWithReporter } from "@/types";
import { createClient } from "@/lib/supabase/server";

type ItemFilters = {
  q?: string;
  type?: string;
  category?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  includeResolved?: boolean;
  reportedBy?: string;
  limit?: number;
};

export async function fetchItems(filters: ItemFilters = {}): Promise<ItemWithReporter[]> {
  const supabase = await createClient();
  let query = supabase
    .from("items")
    .select(
      "id, type, title, category, description, location, item_date, image_url, status, verification_question, reported_by, created_at",
    )
    .order("created_at", { ascending: false });

  if (!filters.includeResolved) {
    query = query.eq("status", "open");
  }
  if (filters.type === "lost" || filters.type === "found") {
    query = query.eq("type", filters.type);
  }
  if (filters.category) {
    query = query.eq("category", filters.category);
  }
  if (filters.location) {
    query = query.eq("location", filters.location);
  }
  if (filters.dateFrom) query = query.gte("item_date", filters.dateFrom);
  if (filters.dateTo) query = query.lte("item_date", filters.dateTo);
  if (filters.reportedBy) {
    query = query.eq("reported_by", filters.reportedBy);
  }
  if (filters.q) {
    const safe = filters.q.replace(/[%_,()]/g, " ").trim();
    if (safe) {
      query = query.or(`title.ilike.%${safe}%,description.ilike.%${safe}%`);
    }
  }
  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({ ...row, reporter: null }) as ItemWithReporter);
}

export async function fetchItemById(id: string): Promise<ItemWithReporter | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("items")
    .select(
      "id, type, title, category, description, location, item_date, image_url, status, verification_question, reported_by, created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return { ...data, reporter: null } as ItemWithReporter;
}
