"use client";

import { Eye, LogIn } from "lucide-react";
import { FormEvent, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth/auth-context";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const { login } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (errorParam) {
      setLoginError(errorParam);
    }
  }, [errorParam]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoginError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password.trim()) {
      toast({
        title: "Email and password required",
        description: "Enter both your email and password to sign in.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: trimmedEmail, password: password.trim() });
      if (typeof window !== "undefined") {
        window.localStorage.setItem("promptwar_challenge_bypass", "1");
      }
      toast({
        title: "Welcome!",
        description: "You have signed in with your college account.",
        variant: "success",
      });
      router.push("/challenge");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unable to sign in right now.";
      setLoginError(msg);
      toast({
        title: "Sign-in failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoginError(null);
    if (!supabase || !isSupabaseConfigured) {
      toast({
        title: "Supabase is not configured",
        description:
          "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel or .env.local.",
        variant: "destructive",
      });
      return;
    }

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : undefined;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          hd: "bitsathy.ac.in",
          prompt: "select_account",
        },
      },
    });

    if (error) {
      setLoginError(error.message);
      toast({
        title: "Google sign-in failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="promptwar-panel w-full max-w-md px-7 py-9">
        <div className="text-center">
          <h1 className="text-2xl font-black">PROMPT WAR</h1>
          <p className="mt-5 text-xl font-bold">Welcome Back!</p>
          <p className="mt-2 text-sm font-medium text-slate-600">Login to continue</p>
          {loginError && (
            <div className="mt-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold rounded-lg text-center animate-pulse">
              ⚠️ {loginError}
            </div>
          )}
        </div>

        <form onSubmit={(event) => void handleSubmit(event)} className="mt-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-bold">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="pr-10"
              />
              <Eye className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
            <div className="text-right">
              <a className="text-xs font-bold text-primary" href="#">
                Forgot Password?
              </a>
            </div>
          </div>

          <Button type="submit" className="w-full uppercase" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs font-bold text-slate-500">
          <span className="h-px flex-1 bg-border" />
          OR
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => void handleGoogleSignIn()}
        >
          <LogIn className="h-4 w-4" />
          Continue with Google
        </Button>

        <p className="mt-8 text-center text-sm text-slate-600">
          Need help? <span className="font-bold text-primary">Contact admin</span>
        </p>
      </div>
    </div>
  );
}
