"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingBag, Plus, Minus, Trash2, Check, HelpCircle, UtensilsCrossed, AlertCircle, ChevronRight } from "lucide-react";

export default function CustomerMenu() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState(["All"]);

  // Size selections per item: { [itemId]: sizeStr }
  const [selectedSizes, setSelectedSizes] = useState({});

  // Cart State
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("Takeaway");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");

  // Fetch Menu from API
  useEffect(() => {
    async function loadMenu() {
      try {
        const res = await fetch("/api/menu");
        if (!res.ok) throw new Error("Failed to load menu");
        const data = await res.ok ? await res.json() : [];
        setMenu(data);
        
        // Extract unique categories
        const cats = ["All", ...new Set(data.map(item => item.category))];
        setCategories(cats);

        // Set default sizes (first size available for each item)
        const sizes = {};
        data.forEach(item => {
          sizes[item.id] = item.sizes[0];
        });
        setSelectedSizes(sizes);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, []);

  // Load cart from LocalStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("firebun-cart");
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } catch (e) {
      console.error("Failed to parse cart");
    }
  }, []);

  // Sync cart to local storage and dispatch update event for navbar
  const syncCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem("firebun-cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("firebun-cart-updated"));
  };

  const handleSizeChange = (itemId, size) => {
    setSelectedSizes(prev => ({
      ...prev,
      [itemId]: size
    }));
  };

  const addToCart = (item) => {
    const size = selectedSizes[item.id] || item.sizes[0];
    const price = item.prices[size];

    const existingIndex = cart.findIndex(
      cartItem => cartItem.id === item.id && cartItem.size === size
    );

    let newCart = [...cart];
    if (existingIndex !== -1) {
      newCart[existingIndex].quantity += 1;
    } else {
      newCart.push({
        id: item.id,
        name: item.name,
        category: item.category,
        size: size,
        price: price,
        quantity: 1
      });
    }
    
    syncCart(newCart);
    
    // Smooth scroll open cart for premium user feedback
    setCartOpen(true);
  };

  const updateQuantity = (index, delta) => {
    let newCart = [...cart];
    newCart[index].quantity += delta;
    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1);
    }
    syncCart(newCart);
  };

  const removeFromCart = (index) => {
    let newCart = [...cart];
    newCart.splice(index, 1);
    syncCart(newCart);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert("Please enter a name for the order.");
      return;
    }
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    try {
      const orderPayload = {
        customerName: customerName,
        tableNumber: tableNumber,
        items: cart,
        totalAmount: cartTotal
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });

      if (!res.ok) throw new Error("Failed to submit order");
      
      const responseData = await res.json();
      
      setPlacedOrderId(responseData.order.id);
      setOrderPlaced(true);
      
      // Clear Cart
      syncCart([]);
      setCustomerName("");
      setTableNumber("Takeaway");

      // Auto close success modal after 5 seconds
      setTimeout(() => {
        setOrderPlaced(false);
      }, 7000);

    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Filter menu items
  const filteredMenu = menu.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 flex flex-col relative bg-luxury-black pb-16">
      
      {/* Luxury Hero Banner */}
      <div className="relative py-12 px-6 text-center bg-gradient-to-b from-luxury-dark/40 to-luxury-black border-b border-luxury-gold/10 overflow-hidden">
        {/* Background micro-grids */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-widest text-luxury-gold font-semibold bg-luxury-gold/10 px-3 py-1 rounded-full border border-luxury-gold/25 inline-block">
            ★ Haute Cuisine & Fire Grill ★
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            The Royal Menu
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto font-light leading-relaxed">
            Indulge in our exquisite fire-grilled recipes, golden paratha rolls, gourmet pizzas, and fresh chilled nectars. Crafted for the discerning palate.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 flex flex-col gap-6 flex-1">
        
        {/* Menu Listings (Full Width Section) */}
        <div className="space-y-6">
          
          {/* Controls: Search and Categories */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-luxury-dark/50 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search gold-crisp zingers, loaded fries..."
                className="w-full pl-10 pr-4 py-2.5 bg-luxury-black/60 border border-white/10 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-luxury-gold transition-all"
              />
            </div>

            {/* Scrollable Category Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-luxury-gold text-luxury-black font-semibold shadow-md shadow-luxury-gold/15 border border-luxury-gold"
                      : "bg-luxury-black text-gray-400 border border-white/5 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Messages */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="bg-luxury-dark/40 border border-white/5 rounded-2xl p-5 space-y-4 animate-pulse">
                  <div className="h-4 bg-white/10 rounded w-2/3"></div>
                  <div className="h-16 bg-white/5 rounded"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-5 bg-white/10 rounded w-1/4"></div>
                    <div className="h-8 bg-white/10 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="glass-panel p-8 rounded-2xl border border-red-500/20 text-center max-w-md mx-auto space-y-3">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <h3 className="font-semibold text-lg text-white">Failed to connect</h3>
              <p className="text-sm text-gray-400">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-xl text-xs font-semibold premium-btn inline-block"
              >
                Retry Request
              </button>
            </div>
          )}

          {/* Menu Items Grid */}
          {!loading && !error && (
            <>
              {filteredMenu.length === 0 ? (
                <div className="text-center py-16 bg-luxury-dark/20 rounded-2xl border border-white/5 space-y-3">
                  <UtensilsCrossed className="w-12 h-12 text-gray-600 mx-auto" />
                  <p className="text-gray-400 font-light text-sm">No culinary masterpieces match your criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredMenu.map((item) => {
                    const activeSize = selectedSizes[item.id] || item.sizes[0];
                    const activePrice = item.prices[activeSize];
                    const hasMultipleSizes = item.sizes.length > 1 && item.sizes[0] !== "Standard";

                    return (
                      <div
                        key={item.id}
                        className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between group overflow-hidden relative"
                      >
                        {/* Premium Gradient Top-Border Hover */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-luxury-gold to-luxury-orange scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></div>

                        {/* Title and Category */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-[10px] tracking-wider uppercase font-semibold text-luxury-gold/80 bg-luxury-gold/5 px-2 py-0.5 rounded border border-luxury-gold/10">
                              {item.category}
                            </span>
                          </div>
                          <h3 className="font-display font-bold text-lg text-white group-hover:text-luxury-gold transition-colors">
                            {item.name}
                          </h3>
                          <p className="text-xs text-gray-400 font-light line-clamp-3 leading-relaxed">
                            {item.description || "Freshly cooked to order with signature spices and luxury ingredients."}
                          </p>
                        </div>

                        {/* Sizes selector and pricing */}
                        <div className="mt-5 space-y-4 pt-3 border-t border-white/5">
                          {hasMultipleSizes && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] uppercase text-gray-500 font-medium mr-1">Size:</span>
                              <div className="flex items-center gap-1">
                                {item.sizes.map((sz) => (
                                  <button
                                    key={sz}
                                    onClick={() => handleSizeChange(item.id, sz)}
                                    className={`w-7 h-7 rounded-full text-[10px] font-bold border transition-all flex items-center justify-center ${
                                      activeSize === sz
                                        ? "bg-luxury-gold/15 text-luxury-gold border-luxury-gold"
                                        : "bg-luxury-black text-gray-500 border-white/5 hover:text-white"
                                    }`}
                                  >
                                    {sz}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Price & Add to Cart button */}
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex flex-col">
                              {hasMultipleSizes && (
                                <span className="text-[9px] uppercase tracking-wider text-gray-500">Size {activeSize}</span>
                              )}
                              <span className="font-display font-semibold text-lg text-luxury-gold">
                                Rs. {activePrice}
                              </span>
                            </div>

                            <button
                              onClick={() => addToCart(item)}
                              className="px-4 py-2 rounded-xl text-xs font-semibold orange-btn shadow-md hover:scale-102 flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Order
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Sticky Bottom Cart Bar */}
        {cart.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 animate-scaleUp">
            <div className="bg-luxury-dark/95 border border-luxury-gold/30 rounded-2xl p-4 flex items-center justify-between shadow-2xl shadow-luxury-orange/10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="bg-luxury-gold/10 text-luxury-gold p-2.5 rounded-xl border border-luxury-gold/20">
                  <ShoppingBag className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold">Plate Selection</span>
                  <span className="font-display text-sm font-bold text-luxury-gold font-mono">
                    Rs. {cartTotal.toLocaleString()} ({cart.reduce((sum, item) => sum + item.quantity, 0)} Items)
                  </span>
                </div>
              </div>
              <Link
                href="/cart"
                className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white orange-btn flex items-center gap-1.5 cursor-pointer hover:scale-102 transition-transform"
              >
                Complete Order
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
