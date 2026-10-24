export function SetupNotice() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p className="font-medium">Supabase is not connected yet.</p>
      <p className="mt-1">
        Put your project URL and anon key in <code className="rounded bg-white px-1">.env.local</code>,
        run <code className="rounded bg-white px-1">supabase/schema.sql</code> in the SQL editor, then
        restart <code className="rounded bg-white px-1">npm run dev</code>.
      </p>
    </div>
  );
}
