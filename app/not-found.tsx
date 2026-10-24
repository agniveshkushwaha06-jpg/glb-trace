import { EmptyState } from "@/components/EmptyState";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <EmptyState
        title="Page not found"
        description="That link does not match a listing or page in GLB Trace."
        actionHref="/items"
        actionLabel="Back to listings"
      />
    </div>
  );
}
