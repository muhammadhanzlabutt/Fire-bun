"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Shield, Users, ShoppingBag, Menu, X, Crown, Coffee, LogOut, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Determine active role from pathname
  let activeRole = "customer";
  if (pathname.startsWith("/admin")) {
    activeRole = "admin";
  } else if (pathname.startsWith("/staff")) {
    activeRole = "staff";
  }

  // Fetch auth state on mount and listen for changes
  useEffect(() => {
    const supabase = createClient();

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setUserRole(user?.user_metadata?.role || null);
      setAuthLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setUserRole(session?.user?.user_metadata?.role || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Effect to listen to cart changes
  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("firebun-cart") || "[]");
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(totalItems);
      } catch (e) {
        setCartCount(0);
      }
    };

    updateCartCount();

    window.addEventListener("firebun-cart-updated", updateCartCount);
    window.addEventListener("storage", updateCartCount);

    return () => {
      window.removeEventListener("firebun-cart-updated", updateCartCount);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setUserRole(null);
    setMobileMenuOpen(false);
    router.push("/login");
  };

  const handleProtectedNav = (role) => {
    setMobileMenuOpen(false);
    if (role === "admin") {
      router.push("/admin");
    } else if (role === "staff") {
      router.push("/staff");
    } else {
      router.push("/");
    }
  };

  // Role switcher shown only when NOT logged in as staff/admin
  const isAuthenticated = !!user && !!userRole;

  return (
    <nav className="bg-luxury-dark border-b border-luxury-gold/25 sticky top-0 z-50 px-4 sm:px-8 py-3 w-full shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between relative">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-gradient-to-br from-luxury-gold to-luxury-orange p-1.5 rounded-lg border border-luxury-gold shadow-md shadow-luxury-orange/10 group-hover:scale-105 transition-all">
            <Crown className="w-5 h-5 text-luxury-black font-bold" />
          </div>
          <span className="font-display font-semibold text-xl tracking-wider text-white select-none">
            FIRE <span className="text-luxury-gold group-hover:text-luxury-orange transition-colors">BUN</span>
          </span>
        </Link>

        {/* Centered Desktop Menu */}
        <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link
            href="/"
            className={`inline-block py-1.5 text-center text-xs tracking-[10px] pl-[10px] font-bold uppercase transition-all duration-300 ${
              pathname === "/" || pathname === "/customer"
                ? "text-luxury-gold border-b-2 border-luxury-gold"
                : "text-gray-400 hover:text-white"
            }`}
          >
            MENU
          </Link>
        </div>

        {/* Desktop Links & Role Area */}
        <div className="hidden md:flex items-center gap-6">

          {/* Cart (customer only) */}
          {activeRole === "customer" && (
            <div className="relative mr-2">
              <Link href="/cart" className="p-2 text-gray-400 hover:text-luxury-gold transition-colors cursor-pointer relative block">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-luxury-orange text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-luxury-black animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          )}

          {/* Auth state area */}
          {!authLoading && (
            isAuthenticated ? (
              /* Logged in: show role badge + logout */
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                  userRole === "admin"
                    ? "bg-red-950/60 border-red-500/40 text-red-300"
                    : "bg-luxury-gold/10 border-luxury-gold/30 text-luxury-gold"
                }`}>
                  {userRole === "admin" ? (
                    <Shield className="w-3.5 h-3.5" />
                  ) : (
                    <Users className="w-3.5 h-3.5" />
                  )}
                  {userRole === "admin" ? "Admin" : "Staff"}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-400 hover:text-white border border-white/10 hover:border-red-500/40 hover:bg-red-950/20 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              /* Not logged in: show role switcher with login prompt for protected routes */
              <div className="bg-luxury-black border border-luxury-gold/30 rounded-full p-1 flex items-center shadow-inner">
                <button
                  onClick={() => handleProtectedNav("customer")}
                  className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 flex items-center gap-1.5 ${
                    activeRole === "customer"
                      ? "bg-gradient-to-r from-luxury-orange to-luxury-orange-dark text-white shadow-md"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Coffee className="w-3.5 h-3.5" />
                  Customer
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 flex items-center gap-1.5 ${
                    activeRole === "staff"
                      ? "bg-gradient-to-r from-luxury-gold-dark to-luxury-gold text-luxury-black shadow-md font-bold"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Staff
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 flex items-center gap-1.5 ${
                    activeRole === "admin"
                      ? "bg-red-950/80 border border-red-500/50 text-red-200 shadow-md shadow-red-950/20"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin
                </button>
              </div>
            )
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-3">
          {activeRole === "customer" && (
            <div className="relative">
              <Link href="/cart" className="p-2 text-gray-400 hover:text-luxury-gold relative block">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-luxury-orange text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-luxury-black">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-400 hover:text-white focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-luxury-gold/15 flex flex-col gap-4 animate-fadeIn">
          {/* Navigation Links */}
          <div className="flex flex-col gap-2 px-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`py-2 text-center text-sm font-bold tracking-[10px] pl-[10px] uppercase border border-luxury-gold/25 rounded-xl bg-luxury-gold/5 ${
                pathname === "/" || pathname === "/customer" ? "text-luxury-gold" : "text-gray-300"
              }`}
            >
              MENU
            </Link>
          </div>

          {/* Mobile Auth Section */}
          {!authLoading && (
            isAuthenticated ? (
              <div className="bg-luxury-gray border border-luxury-gold/20 rounded-xl p-3 flex items-center justify-between">
                <div className={`flex items-center gap-2 text-xs font-bold ${
                  userRole === "admin" ? "text-red-300" : "text-luxury-gold"
                }`}>
                  {userRole === "admin" ? <Shield className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                  Signed in as <span className="capitalize">{userRole}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 border border-red-500/20 hover:bg-red-950/20 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="bg-luxury-gray border border-luxury-gold/20 rounded-xl p-3 flex flex-col gap-2">
                <div className="text-xs font-semibold text-luxury-gold uppercase tracking-wider mb-1">
                  Quick Access:
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleProtectedNav("customer")}
                    className={`py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeRole === "customer"
                        ? "bg-luxury-orange text-white"
                        : "bg-luxury-black text-gray-400 border border-white/5"
                    }`}
                  >
                    Customer
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); router.push("/login"); }}
                    className="py-1.5 rounded-lg text-xs font-medium transition-all bg-luxury-black text-gray-400 border border-white/5 flex items-center justify-center gap-1"
                  >
                    <Lock className="w-3 h-3" />
                    Staff
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); router.push("/login"); }}
                    className="py-1.5 rounded-lg text-xs font-medium transition-all bg-luxury-black text-gray-400 border border-white/5 flex items-center justify-center gap-1"
                  >
                    <Lock className="w-3 h-3" />
                    Admin
                  </button>
                </div>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-1 text-center text-xs text-luxury-gold/70 hover:text-luxury-gold transition-colors"
                >
                  → Sign in to staff/admin portal
                </Link>
              </div>
            )
          )}
        </div>
      )}
    </nav>
  );
}
