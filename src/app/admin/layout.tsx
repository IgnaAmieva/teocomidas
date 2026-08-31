"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null | "loading">("loading");

  useEffect(() => {
    if (!supabase) {
      setSession(null);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session === "loading") return;

    const isLoginPage = pathname === "/admin/login";

    if (!session && !isLoginPage) {
      router.replace("/admin/login");
    } else if (session && isLoginPage) {
      router.replace("/admin");
    }
  }, [session, pathname, router]);

  // Loading state
  if (session === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900" />
      </div>
    );
  }

  // Not logged in and not on login page — show nothing while redirecting
  if (!session && pathname !== "/admin/login") {
    return null;
  }

  return <>{children}</>;
}
