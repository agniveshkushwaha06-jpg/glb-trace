"use client";

import { EmptyState } from "@/components/EmptyState";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <EmptyState
        title="Something went wrong"
        description={error.message || "Please try again."}
      />
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={reset}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
