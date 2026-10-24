"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Logo } from "@/components/Logo";
import { SetupNotice } from "@/components/SetupNotice";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.6-5.1 3.6-3.1 0-5.6-2.6-5.6-5.7s2.5-5.7 5.6-5.7c1.8 0 3 .7 3.7 1.4l2.5-2.4C16.7 3.4 14.6 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 11.9S6.8 21.3 12 21.3c5.2 0 8.6-3.6 8.6-8.7 0-.6 0-1-.1-1.4H12z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "domain"
      ? "Please use your college email."
      : searchParams.get("error") === "auth"
        ? "Sign in failed. Please try again."
        : null,
  );
  const [loading, setLoading] = useState(false);
  const configured = isSupabaseConfigured();

  async function signIn() {
    setError(null);
    setLoading(true);
    if (!configured) {
      setLoading(false);
      setError("Add your Supabase URL and anon key to .env.local, then restart the dev server.");
      return;
    }
    try {
      const supabase = createClient();
      const next = searchParams.get("next") ?? "/items";
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Could not start Google sign-in.");
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-16">
      <div className="w-full rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
        <Logo />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in with Google to report items and contact other students.
        </p>
        {configured ? null : <div className="mt-4"><SetupNotice /></div>}
        {error ? (
          <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : null}
        <button
          type="button"
          onClick={signIn}
          disabled={loading || !configured}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-60"
        >
          <GoogleIcon />
          {loading ? "Redirecting..." : "Continue with Google"}
        </button>
      </div>
    </div>
  );
}
