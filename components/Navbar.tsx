"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Logo } from "./Logo";

const links = [
  { href: "/items", label: "Listings" },
  { href: "/report", label: "Report" },
  { href: "/my-items", label: "My Items" },
  { href: "/activity", label: "Activity" },
  { href: "/profile", label: "Profile" },
  { href: "/admin", label: "Admin" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null)).catch(() => setEmail(null));
  }, [pathname]);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setEmail(null);
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" onClick={() => setOpen(false)}>
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium ${
                pathname === link.href ? "text-accent" : "text-slate-600 hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {email ? (
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Log out
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-dark"
            >
              Sign in
            </Link>
          )}
        </nav>
        <button
          type="button"
          className="rounded-lg p-2 text-slate-700 md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-slate-700"
              >
                {link.label}
              </Link>
            ))}
            {email ? (
              <button
                type="button"
                onClick={logout}
                className="text-left text-sm font-medium text-slate-700"
              >
                Log out
              </button>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)} className="text-sm font-medium text-accent">
                Sign in
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
