"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Shield, Users, ShoppingBag, Menu, X, Crown, Coffee } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Determine active role from pathname
  let activeRole = "customer";
  if (pathname.startsWith("/admin")) {
    activeRole = "admin";
  } else if (pathname.startsWith("/staff")) {
    activeRole = "staff";
  }

  // Effect to listen to cart changes (using storage event and custom events)
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

    // Listen for custom events when cart updates on the same page
    window.addEventListener("firebun-cart-updated", updateCartCount);
    // Listen for localStorage changes from other tabs
    window.addEventListener("storage", updateCartCount);

    return () => {
      window.removeEventListener("firebun-cart-updated", updateCartCount);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  const handleRoleChange = (role) => {
    setMobileMenuOpen(false);
    if (role === "admin") {
      router.push("/admin");
    } else if (role === "staff") {
      router.push("/staff");
    } else {
      router.push("/");
    }
  };

  return (
    <nav className="bg-luxury-dark border-b border-luxury-gold/25 sticky top-0 z-50 px-4 sm:px-8 py-3 w-full shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-gradient-to-br from-luxury-gold to-luxury-orange p-1.5 rounded-lg border border-luxury-gold shadow-md shadow-luxury-orange/10 group-hover:scale-105 transition-all">
            <Crown className="w-5 h-5 text-luxury-black font-bold" />
          </div>
          <span className="font-display font-semibold text-xl tracking-wider text-white select-none">
            FIRE <span className="text-luxury-gold group-hover:text-luxury-orange transition-colors">BUN</span>
          </span>
        </Link>

        {/* Desktop Links & Role Switcher */}
        <div className="hidden md:flex items-center gap-6">
          {/* Navigation Links */}
          <div className="flex items-center gap-4 mr-2">
            <Link
              href="/"
              className={`text-sm tracking-wide font-medium transition-colors ${
                pathname === "/" || pathname === "/customer"
                  ? "text-luxury-gold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Menu
            </Link>
            <Link
              href="/staff"
              className={`text-sm tracking-wide font-medium transition-colors ${
                pathname.startsWith("/staff")
                  ? "text-luxury-gold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Staff POS
            </Link>
            <Link
              href="/admin"
              className={`text-sm tracking-wide font-medium transition-colors ${
                pathname.startsWith("/admin")
                  ? "text-luxury-gold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Admin Panel
            </Link>
          </div>

          {/* Cart Status Indicator (only for Customer view) */}
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

          {/* Premium RBAC Role Switcher */}
          <div className="bg-luxury-black border border-luxury-gold/30 rounded-full p-1 flex items-center shadow-inner">
            <button
              onClick={() => handleRoleChange("customer")}
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
              onClick={() => handleRoleChange("staff")}
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
              onClick={() => handleRoleChange("admin")}
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
        </div>

        {/* Mobile Menu Buttons */}
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
              className={`py-1 text-sm ${
                pathname === "/" || pathname === "/customer" ? "text-luxury-gold font-medium" : "text-gray-300"
              }`}
            >
              Menu (Customer View)
            </Link>
            <Link
              href="/staff"
              onClick={() => setMobileMenuOpen(false)}
              className={`py-1 text-sm ${
                pathname.startsWith("/staff") ? "text-luxury-gold font-medium" : "text-gray-300"
              }`}
            >
              Staff POS Dashboard
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className={`py-1 text-sm ${
                pathname.startsWith("/admin") ? "text-luxury-gold font-medium" : "text-gray-300"
              }`}
            >
              Admin Dashboard
            </Link>
          </div>

          {/* Mobile Role Swapper Panel */}
          <div className="bg-luxury-gray border border-luxury-gold/20 rounded-xl p-3 flex flex-col gap-2">
            <div className="text-xs font-semibold text-luxury-gold uppercase tracking-wider mb-1">
              Quick Role Switcher:
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleRoleChange("customer")}
                className={`py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeRole === "customer"
                    ? "bg-luxury-orange text-white"
                    : "bg-luxury-black text-gray-400 border border-white/5"
                }`}
              >
                Customer
              </button>
              <button
                onClick={() => handleRoleChange("staff")}
                className={`py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeRole === "staff"
                    ? "bg-luxury-gold text-luxury-black font-bold"
                    : "bg-luxury-black text-gray-400 border border-white/5"
                }`}
              >
                Staff
              </button>
              <button
                onClick={() => handleRoleChange("admin")}
                className={`py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeRole === "admin"
                    ? "bg-red-900 text-white"
                    : "bg-luxury-black text-gray-400 border border-white/5"
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
