import { redirect } from "next/navigation";
import { SetupNotice } from "@/components/SetupNotice";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type StudentItem = {
  id: string;
  title: string;
  type: string;
  category: string;
  description: string | null;
  location: string;
  item_date: string;
  status: string;
  created_at: string;
  reports: number;
  claims: number;
};
type StudentSummary = {
  name: string;
  email: string;
  roll_no: string | null;
  admission_no: string | null;
  year: string | null;
  section: string | null;
  phone: string | null;
  joined_at: string;
  total_posts: number;
  returned_posts: number;
  items: StudentItem[];
};

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  if (!isSupabaseConfigured()) return <div className="mx-auto max-w-5xl px-4 py-10"><SetupNotice /></div>;
  const { email: rawEmail } = await searchParams;
  const email = rawEmail?.trim().toLowerCase() ?? "";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: summary, error } = email
    ? await supabase.rpc("admin_user_summary", { p_email: email })
    : { data: null, error: null };
  const student = summary as StudentSummary | null;

  return <div className="mx-auto max-w-5xl px-4 py-10">
    <p className="text-sm font-semibold uppercase tracking-widest text-accent">Staff tools</p>
    <h1 className="mt-2 text-3xl font-semibold">Student activity</h1>
    <p className="mt-2 text-slate-600">Search one student by their exact email. Only that student’s information appears below.</p>
    <form action="/admin" method="get" className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row">
      <label htmlFor="student-email" className="sr-only">Student email</label>
      <input id="student-email" name="email" type="email" required defaultValue={email} placeholder="student@college.edu" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3" />
      <button className="rounded-full bg-accent px-5 py-3 font-semibold text-white">Search student</button>
    </form>
    {error ? <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{error.message}. Please run the latest Supabase setup script from <code>supabase/schema.sql</code>.</p> : null}
    {email && !error && !student ? <p className="mt-4 rounded-xl bg-slate-100 p-4 text-slate-700">No student found for that email.</p> : null}
    {student ? <section className="mt-8 space-y-5">
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">{student.name}</h2>
        <p className="mt-1 text-slate-600">{student.email}</p>
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div><dt className="text-slate-500">Roll number</dt><dd className="font-medium">{student.roll_no || "Not provided"}</dd></div>
          <div><dt className="text-slate-500">Admission number</dt><dd className="font-medium">{student.admission_no || "Not provided"}</dd></div>
          <div><dt className="text-slate-500">Year / section</dt><dd className="font-medium">{[student.year, student.section].filter(Boolean).join(" / ") || "Not provided"}</dd></div>
          <div><dt className="text-slate-500">Phone</dt><dd className="font-medium">{student.phone || "Not provided"}</dd></div>
          <div><dt className="text-slate-500">Joined</dt><dd className="font-medium">{new Date(student.joined_at).toLocaleDateString("en-IN")}</dd></div>
        </dl>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[["Posts", student.total_posts], ["Returned", student.returned_posts], ["Still open", student.total_posts - student.returned_posts]].map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>)}
      </div>
      <div><h2 className="text-xl font-semibold">Posts by {student.name}</h2><div className="mt-3 space-y-3">{student.items.length ? student.items.map((item) => <article key={item.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"><a href={`/items/${item.id}`} className="font-semibold hover:text-accent">{item.title}</a><p className="mt-1 text-sm text-slate-600">{item.type} · {item.category} · {item.location} · {item.item_date}</p><p className="mt-2 text-sm text-slate-600">Status: {item.status === "resolved" ? "Returned" : "Open"} · {item.reports} report(s) · {item.claims} claim(s)</p>{item.description ? <p className="mt-2 text-sm">{item.description}</p> : null}</article>) : <p className="rounded-xl bg-slate-100 p-4 text-slate-700">This student has not posted any items.</p>}</div></div>
    </section> : null}
  </div>;
}
