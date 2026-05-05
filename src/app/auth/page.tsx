"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Mode = "login" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("error")) setError("Authentication failed. Please try again.");
  }, [searchParams]);

  async function handleEmailAuth() {
    setError(null);
    setSuccess(null);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        setSuccess("Check your email to confirm your account, then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      setError(msg.includes("Invalid login credentials") ? "Invalid email or password." : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError("Google sign-in failed."); setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row">

      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 xl:p-16"
        style={{ background: "#101010", borderRight: "1px solid rgba(225,224,204,0.06)" }}
      >
        <div className="flex flex-col h-full">
          <p className="text-primary/50 text-sm uppercase tracking-widest mb-8">GoViral</p>
          <h2 className="text-4xl xl:text-5xl font-medium leading-tight mb-4" style={{ color: "#E1E0CC" }}>
            Know before you post.
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed max-w-sm font-light mb-8">
            Upload your content and get a precise AI virality score with actionable feedback before you hit publish.
          </p>
          
          {/* Hero Image - Larger */}
          <div className="relative w-full flex-1 rounded-2xl overflow-hidden min-h-[300px]">
            <img 
              src="/auth-hero.png" 
              alt="GoViral content analysis preview" 
              className="w-full h-full object-cover"
              style={{ border: "1px solid rgba(225,224,204,0.08)" }}
            />
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(225,224,204,0.06)" }} className="pt-8 mt-8">
          <p className="text-gray-400 text-lg leading-relaxed font-light mb-4">
            &ldquo;GoViral helped me understand exactly why my videos were not getting traction. The hook analysis alone changed how I approach every video.&rdquo;
          </p>
          <p className="text-primary/50 text-sm uppercase tracking-wider">Creator with 2.1M followers</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-16 sm:py-20 lg:py-0">
        <div className="w-full max-w-sm">

          {/* Mobile heading */}
          <div className="lg:hidden mb-8 sm:mb-10">
            <p className="text-primary/50 text-sm uppercase tracking-widest mb-3">GoViral</p>
            <h1 className="text-2xl sm:text-3xl font-medium" style={{ color: "#E1E0CC" }}>
              {mode === "login" ? "Welcome back." : "Join the lab."}
            </h1>
            <p className="text-gray-500 text-base mt-2 font-light">
              {mode === "login" ? "Sign in to your account." : "Start analyzing for free."}
            </p>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block mb-8">
            <h1 className="text-3xl font-medium" style={{ color: "#E1E0CC" }}>
              {mode === "login" ? "Welcome back." : "Join the lab."}
            </h1>
            <p className="text-gray-500 text-base mt-2 font-light">
              {mode === "login" ? "Sign in to your GoViral account." : "Start analyzing your content for free."}
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl p-6 sm:p-7" style={{ background: "#101010" }}>

            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl text-base text-red-400 bg-red-500/10 border border-red-500/20" role="alert">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-5 px-4 py-3 rounded-xl text-base text-green-400 bg-green-500/10 border border-green-500/20" role="status">
                {success}
              </div>
            )}

            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              className={cn(
                "w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-sm transition-all duration-200 mb-5",
                loading && "opacity-50 cursor-not-allowed"
              )}
              style={{ background: "#212121", color: "rgba(225,224,204,0.8)", border: "1px solid rgba(225,224,204,0.08)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px" style={{ background: "rgba(225,224,204,0.08)" }} />
              <span className="text-gray-600 text-base">or continue with email</span>
              <div className="flex-1 h-px" style={{ background: "rgba(225,224,204,0.08)" }} />
            </div>

            <div className="space-y-3 mb-5">
              <div>
                <label htmlFor="email" className="block text-base text-gray-500 mb-1.5">Email address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                  style={{ background: "#212121", border: "1px solid rgba(225,224,204,0.08)", color: "#E1E0CC" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(222,219,200,0.3)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(225,224,204,0.08)")}
                  autoComplete="email"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-base text-gray-500 mb-1.5">
                  Password {mode === "signup" && <span className="text-gray-700">(min 8 characters)</span>}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-10 rounded-xl text-sm outline-none transition-all duration-200"
                    style={{ background: "#212121", border: "1px solid rgba(225,224,204,0.08)", color: "#E1E0CC" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(222,219,200,0.3)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(225,224,204,0.08)")}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleEmailAuth}
              disabled={loading}
              className={cn(
                "group w-full flex items-center justify-between bg-primary rounded-full pl-5 pr-1.5 py-1.5 transition-all duration-300",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              <span className="text-black font-medium text-sm">
                {loading
                  ? (mode === "login" ? "Signing in..." : "Creating account...")
                  : (mode === "login" ? "Sign in" : "Create account")}
              </span>
              <span className="bg-black rounded-full w-9 h-9 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <ArrowRight className="w-4 h-4 text-primary" />
              </span>
            </button>
          </div>

          <p className="text-center text-gray-600 text-base mt-5 sm:mt-6">
            {mode === "login" ? "No account? " : "Already have one? "}
            <button
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); setSuccess(null); }}
              className="text-primary/70 hover:text-primary transition-colors duration-200"
            >
              {mode === "login" ? "Sign up free" : "Sign in"}
            </button>
          </p>

          <div className="flex items-center justify-center gap-4 sm:gap-6 mt-6 sm:mt-8">
            {["Free forever", "No credit card", "Cancel anytime"].map((t) => (
              <span key={t} className="text-gray-700 text-sm sm:text-base">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
