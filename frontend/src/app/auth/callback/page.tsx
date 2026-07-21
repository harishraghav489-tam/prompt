"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { supabase } from "@/lib/supabase/client";

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
