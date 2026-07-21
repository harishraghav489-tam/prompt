"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { supabase } from "@/lib/supabase/client";

const ALLOWED_DOMAIN = "@bitsathy.ac.in";
const ADMIN_EMAIL = "admin@promptbench.dev";

function isCollegeEmail(email: string): boolean {
  const lower = email.toLowerCase();
  return lower === ADMIN_EMAIL || lower.endsWith(ALLOWED_DOMAIN);
}

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const finishSignIn = async () => {
      if (!supabase || typeof window === "undefined") {
        router.replace("/login");
        return;
      }

      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const email = data.session.user?.email ?? "";

        // Domain gate: reject non-college emails immediately
        if (!isCollegeEmail(email)) {
          await supabase.auth.signOut();
          window.localStorage.removeItem("promptwar_token");
          window.localStorage.removeItem("promptwar_user");
          router.replace(
            "/login?error=Only college emails ending with @bitsathy.ac.in are allowed"
          );
          return;
        }

        window.localStorage.setItem(
          "promptwar_token",
          data.session.access_token
        );
        window.localStorage.setItem("promptwar_challenge_bypass", "1");
        router.replace("/dashboard");
        return;
      }

      router.replace("/login");
    };

    void finishSignIn();
  }, [router]);

  return <LoadingSpinner fullScreen label="Finishing Google sign-in..." />;
}
