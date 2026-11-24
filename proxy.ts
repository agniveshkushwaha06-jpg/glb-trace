import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Only protected pages need session refresh. Avoid a network auth call on
  // public pages, static assets, the login page, and the OAuth callback.
  matcher: ["/report/:path*", "/my-items/:path*", "/profile/:path*", "/activity/:path*", "/admin/:path*"],
};
