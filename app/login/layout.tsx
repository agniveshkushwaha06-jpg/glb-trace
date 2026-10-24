import { Suspense } from "react";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading...</div>}>{children}</Suspense>;
}
