import { redirect } from "next/navigation";
import { ReportForm } from "@/components/ReportForm";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { SetupNotice } from "@/components/SetupNotice";

export default async function ReportPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Report an item</h1>
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
  if (!user) redirect("/login?next=/report");

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
  if (!profile) redirect("/profile");

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Report an item</h1>
      <p className="mt-2 text-sm text-slate-600">
        Add as much detail as you can. A photo makes it much easier to match.
      </p>
      <div className="mt-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <ReportForm />
      </div>
    </div>
  );
}
