"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Crown, Shield, Users, Eye, EyeOff, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError(authError.message || "Invalid credentials. Please try again.");
        setLoading(false);
        return;
      }

      const role = data.user?.user_metadata?.role;

      if (!role) {
        setError("Your account has no role assigned. Contact the administrator.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // If there's a specific redirect and it matches the user's role, use it
      if (redirectTo) {
        const targetRole = redirectTo.startsWith("/admin") ? "admin" : redirectTo.startsWith("/staff") ? "staff" : null;
        if (targetRole === role) {
          router.push(redirectTo);
          return;
        }
      }

      // Route based on role
      if (role === "admin") {
        router.push("/admin");
      } else if (role === "staff") {
        router.push("/staff");
      } else {
        setError("Unrecognized role. Contact the administrator.");
        await supabase.auth.signOut();
        setLoading(false);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow effects */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(ellipse, #C9A84C 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(ellipse, #E05C1A 0%, transparent 70%)" }}
      />

      {/* Brand header */}
      <Link href="/" className="flex items-center gap-2 group mb-8">
        <div className="bg-gradient-to-br from-luxury-gold to-luxury-orange p-2 rounded-xl border border-luxury-gold shadow-lg shadow-luxury-orange/20 group-hover:scale-105 transition-all">
          <Crown className="w-6 h-6 text-luxury-black font-bold" />
        </div>
        <span className="font-display font-semibold text-2xl tracking-wider text-white select-none">
          FIRE <span className="text-luxury-gold group-hover:text-luxury-orange transition-colors">BUN</span>
        </span>
      </Link>

      {/* Glass login card */}
      <div className="w-full max-w-md relative">
        <div
          className="rounded-2xl border border-luxury-gold/25 p-8 shadow-2xl shadow-black/60"
          style={{
            background: "linear-gradient(135deg, rgba(26,26,26,0.95) 0%, rgba(18,18,18,0.98) 100%)",
            backdropFilter: "blur(24px)",
          }}
        >
          {/* Card header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-luxury-gold/30" />
              <Shield className="w-5 h-5 text-luxury-gold" />
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-luxury-gold/30" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white mb-1">
              Staff Portal
            </h1>
            <p className="text-xs text-gray-400 tracking-wide">
              Authorized personnel only — Enter your credentials
            </p>
          </div>

          {/* Role hint badges */}
          <div className="grid grid-cols-2 gap-3 mb-7">
            <div className="flex items-center gap-2 bg-luxury-gold/5 border border-luxury-gold/15 rounded-xl p-3">
              <div className="bg-luxury-gold/15 p-1.5 rounded-lg">
                <Shield className="w-3.5 h-3.5 text-luxury-gold" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-luxury-gold uppercase tracking-wider">Admin</p>
                <p className="text-[10px] text-gray-500">Full access</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-luxury-orange/5 border border-luxury-orange/15 rounded-xl p-3">
              <div className="bg-luxury-orange/15 p-1.5 rounded-lg">
                <Users className="w-3.5 h-3.5 text-luxury-orange" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-luxury-orange uppercase tracking-wider">Staff</p>
                <p className="text-[10px] text-gray-500">POS access</p>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-2 bg-red-950/40 border border-red-500/30 rounded-xl p-3 mb-5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1.5">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-luxury-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-luxury-gold/50 focus:ring-1 focus:ring-luxury-gold/20 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-luxury-black border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-luxury-gold/50 focus:ring-1 focus:ring-luxury-gold/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest text-white transition-all duration-300 mt-2 relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              style={{
                background: loading
                  ? "rgba(201,168,76,0.3)"
                  : "linear-gradient(135deg, #C9A84C 0%, #E05C1A 100%)",
                boxShadow: loading ? "none" : "0 4px 20px rgba(201,168,76,0.25)",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                  Authenticating...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-white/5 text-center">
            <Link
              href="/"
              className="text-xs text-gray-500 hover:text-luxury-gold transition-colors"
            >
              ← Back to Customer Menu
            </Link>
          </div>
        </div>

        {/* Decorative border glow */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(201,168,76,0.08) 0%, transparent 60%)",
          }}
        />
      </div>

      <p className="mt-6 text-[10px] text-gray-600 tracking-widest uppercase">
        Fire Bun — Secure Staff Access System
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-luxury-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-luxury-gold/30 border-t-luxury-gold rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
