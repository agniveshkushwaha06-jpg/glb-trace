"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { YEARS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { SetupNotice } from "@/components/SetupNotice";

const fieldClass =
  "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(isSupabaseConfigured());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [admissionNo, setAdmissionNo] = useState("");
  const [year, setYear] = useState<string>(YEARS[0]);
  const [section, setSection] = useState("");
  const [phone, setPhone] = useState("+91");

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    (async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        router.replace("/login?next=/profile");
        return;
      }
      setUserId(user.id);
      setEmail(user.email ?? "");
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (data) {
        setName(data.name ?? "");
        setRollNo(data.roll_no ?? "");
        setAdmissionNo(data.admission_no ?? "");
        setYear(data.year ?? YEARS[0]);
        setSection(data.section ?? "");
        setPhone(data.phone ?? "+91");
      } else if (user.user_metadata?.full_name) {
        setName(user.user_metadata.full_name);
      }
      setLoading(false);
    })();
  }, [router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!userId) return;
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      setError("Enter a phone number with country code for WhatsApp.");
      return;
    }
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const payload = {
      id: userId,
      name: name.trim(),
      roll_no: rollNo.trim() || null,
      admission_no: admissionNo.trim() || null,
      year,
      section: section.trim() || null,
      phone: phone.trim(),
      email,
    };
    const { error: saveError } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
    setSaving(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    router.push("/items");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-10 animate-pulse rounded-xl bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Your profile</h1>
        <div className="mt-6">
          <SetupNotice />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Your profile</h1>
      <p className="mt-2 text-sm text-slate-600">
        This is shown when someone contacts you about a report.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium">
          Name
          <input required value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} />
        </label>
        <label className="block text-sm font-medium">
          Roll no
          <input value={rollNo} onChange={(event) => setRollNo(event.target.value)} className={fieldClass} />
        </label>
        <label className="block text-sm font-medium">
          Admission no
          <input value={admissionNo} onChange={(event) => setAdmissionNo(event.target.value)} className={fieldClass} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Year
            <select value={year} onChange={(event) => setYear(event.target.value)} className={fieldClass}>
              {YEARS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Section
            <input
              value={section}
              onChange={(event) => setSection(event.target.value)}
              placeholder="A"
              className={fieldClass}
            />
          </label>
        </div>
        <label className="block text-sm font-medium">
          Phone (with country code)
          <input
            required
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+91 98765 43210"
            className={fieldClass}
          />
          <span className="mt-1 block text-xs font-normal text-slate-500">
            Used for the WhatsApp contact button.
          </span>
        </label>
        <label className="block text-sm font-medium">
          Email
          <input value={email} readOnly className={`${fieldClass} bg-slate-50 text-slate-500`} />
        </label>
        {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-full bg-accent py-2.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save profile"}
        </button>
      </form>
    </div>
  );
}
