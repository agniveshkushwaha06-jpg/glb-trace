import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        aria-hidden
        viewBox="0 0 64 64"
        className="h-8 w-8 shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="64" height="64" rx="16" fill="#0f766e" />
        <circle cx="28" cy="28" r="12" stroke="#ecfdf5" strokeWidth="4" />
        <path d="M37 37L48 48" stroke="#ecfdf5" strokeWidth="4" strokeLinecap="round" />
        <circle cx="28" cy="28" r="3" fill="#99f6e4" />
      </svg>
      <span className="text-lg font-semibold tracking-tight text-foreground">
        GLB Trace
      </span>
    </span>
  );
}
