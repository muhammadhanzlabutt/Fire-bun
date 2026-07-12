"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Edit, Trash2, Shield, Search, TrendingUp, 
  ShoppingBag, Layers, Check, DollarSign, X, HelpCircle, UtensilsCrossed
} from "lucide-react";

export default function AdminDashboard() {
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [bills, setBills] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState(["All"]);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null means adding new

  // Form State
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formCustomCategory, setFormCustomCategory] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [activeSizes, setActiveSizes] = useState({
    Standard: true,
    S: false,
    M: false,
    L: false,
    XL: false
  });
  const [sizePrices, setSizePrices] = useState({
    Standard: "",
    S: "",
    M: "",
    L: "",
    XL: ""
  });

  // Load menu, orders, and bills
  const loadData = async () => {
    try {
      const [menuRes, ordersRes, billsRes] = await Promise.all([
        fetch("/api/menu"),
        fetch("/api/orders"),
        fetch("/api/bills")
      ]);

      if (menuRes.ok && ordersRes.ok && billsRes.ok) {
        const menuData = await menuRes.json();
        const ordersData = await ordersRes.json();
        const billsData = await billsRes.json();

        setMenu(menuData);
        setOrders(ordersData);
        setBills(billsData);

        const cats = ["All", ...new Set(menuData.map(item => item.category))];
        setCategories(cats);
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Open Modal for Add
  const openAddModal = () => {
    setEditingItem(null);
    setFormName("");
    setFormCategory(categories[1] || "Burgers"); // Default to first category if available
    setFormCustomCategory("");
    setFormDescription("");
    setActiveSizes({
      Standard: true,
      S: false,
      M: false,
      L: false,
      XL: false
    });
    setSizePrices({
      Standard: "",
      S: "",
      M: "",
      L: "",
      XL: ""
    });
    setModalOpen(true);
  };

  // Open Modal for Edit
  const openEditModal = (item) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormCustomCategory("");
    setFormDescription(item.description || "");

    const newActiveSizes = { Standard: false, S: false, M: false, L: false, XL: false };
    const newPrices = { Standard: "", S: "", M: "", L: "", XL: "" };

    item.sizes.forEach(sz => {
      newActiveSizes[sz] = true;
      newPrices[sz] = item.prices[sz] || "";
    });

    setActiveSizes(newActiveSizes);
    setSizePrices(newPrices);
    setModalOpen(true);
  };

  // Handle Form Submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const finalCategory = formCategory === "custom" ? formCustomCategory.trim() : formCategory;
    if (!formName.trim() || !finalCategory) {
      alert("Name and Category are required.");
      return;
    }

    // Build sizes and prices objects
    const selectedSizes = Object.keys(activeSizes).filter(sz => activeSizes[sz]);
    if (selectedSizes.length === 0) {
      alert("Please configure at least one active size and price.");
      return;
    }

    const prices = {};
    for (const size of selectedSizes) {
      const priceVal = Number(sizePrices[size]);
      if (isNaN(priceVal) || priceVal <= 0) {
        alert(`Please enter a valid price for size: ${size}`);
        return;
      }
      prices[size] = priceVal;
    }

    const itemPayload = {
      name: formName.trim(),
      category: finalCategory,
      description: formDescription.trim(),
      sizes: selectedSizes,
      prices: prices
    };

    try {
      const res = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: editingItem ? "edit" : "add",
          id: editingItem ? editingItem.id : undefined,
          item: itemPayload
        })
      });

      if (!res.ok) throw new Error("Failed to save item");
      
      setModalOpen(false);
      loadData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Delete Menu Item
  const handleDeleteItem = async (itemId) => {
    if (!confirm("Are you sure you want to remove this dish from the menu?")) return;

    try {
      const res = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id: itemId })
      });

      if (!res.ok) throw new Error("Failed to delete item");
      loadData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Toggle Size Checkbox
  const handleSizeToggle = (size) => {
    setActiveSizes(prev => ({
      ...prev,
      [size]: !prev[size]
    }));
  };

  // Handle Size Price change
  const handlePriceChange = (size, value) => {
    setSizePrices(prev => ({
      ...prev,
      [size]: value
    }));
  };

  // Calculations for Admin Analytics Cards
  const totalRevenue = bills.reduce((sum, b) => sum + b.grandTotal, 0);
  const totalOrders = orders.length;
  const menuCount = menu.length;

  // Filter menu items for search
  const filteredMenu = menu.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 flex flex-col bg-luxury-black max-w-7xl mx-auto w-full p-4 sm:p-6 gap-6">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-luxury-gold/10 pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="text-luxury-gold w-6 h-6" />
            Executive Admin Control
          </h1>
          <p className="text-xs text-gray-400">
            Secure panel for dish registration, size-specific price revisions, and live business analytics.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="mt-3 sm:mt-0 px-4 py-2 rounded-xl text-xs font-semibold orange-btn flex items-center gap-1.5 cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          Add New Dish
        </button>
      </div>

      {/* Analytics Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Revenue */}
        <div className="glass-panel rounded-2xl p-5 border border-luxury-gold/15 flex items-center gap-4 relative overflow-hidden">
          <div className="bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20 p-3 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Total Net Revenue</p>
            <h3 className="font-display text-xl sm:text-2xl font-extrabold text-white mt-0.5">
              Rs. {totalRevenue.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Card 2: Orders */}
        <div className="glass-panel rounded-2xl p-5 border border-luxury-gold/15 flex items-center gap-4 relative overflow-hidden">
          <div className="bg-luxury-orange/10 text-luxury-orange border border-luxury-orange/20 p-3 rounded-xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Customer Orders</p>
            <h3 className="font-display text-xl sm:text-2xl font-extrabold text-white mt-0.5">
              {totalOrders} Transactions
            </h3>
          </div>
        </div>

        {/* Card 3: Menu Catalog */}
        <div className="glass-panel rounded-2xl p-5 border border-luxury-gold/15 flex items-center gap-4 relative overflow-hidden">
          <div className="bg-white/5 text-gray-300 border border-white/10 p-3 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Catalog Dishes</p>
            <h3 className="font-display text-xl sm:text-2xl font-extrabold text-white mt-0.5">
              {menuCount} Active Recipes
            </h3>
          </div>
        </div>
      </div>

      {/* Catalog Table Area */}
      <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden flex flex-col">
        {/* Filters Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-luxury-dark/40 p-4 border-b border-white/5">
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dish by name..."
              className="w-full pl-9 pr-4 py-2 bg-luxury-black border border-white/10 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-[10px] font-semibold tracking-wide whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? "bg-luxury-gold text-luxury-black border-luxury-gold font-bold"
                    : "bg-luxury-black text-gray-400 border-white/5 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-20 text-gray-400 animate-pulse">
              Fetching catalog entries...
            </div>
          ) : filteredMenu.length === 0 ? (
            <div className="text-center py-20 space-y-2 text-gray-500">
              <UtensilsCrossed className="w-10 h-10 mx-auto opacity-30" />
              <p className="text-sm font-light">No registered dishes match your search.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-luxury-dark/60 text-gray-400 border-b border-white/10 uppercase tracking-wider text-[10px]">
                  <th className="p-4 font-semibold">Dish details</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Sizes & Pricing Structure</th>
                  <th className="p-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {filteredMenu.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 max-w-xs">
                      <div className="font-bold text-white text-sm">{item.name}</div>
                      <div className="text-[10px] text-gray-500 font-light mt-0.5 line-clamp-1">
                        {item.description || "No luxury description available."}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-luxury-gold/5 border border-luxury-gold/15 text-luxury-gold/90 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap items-center gap-1.5 font-mono">
                        {item.sizes.map((sz) => (
                          <span 
                            key={sz}
                            className="bg-luxury-black/60 border border-white/5 text-gray-300 px-2 py-0.5 rounded text-[10px] flex items-center gap-1"
                          >
                            <span className="text-[9px] uppercase text-gray-500 font-sans font-bold">{sz}:</span>
                            <span className="font-bold text-luxury-gold">Rs.{item.prices[sz]}</span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 text-gray-400 hover:text-luxury-gold hover:bg-white/5 rounded-lg transition-all"
                          title="Edit pricing & specs"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all"
                          title="Delete dish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit Modal Drawer */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-luxury-dark border border-luxury-gold/30 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
            {/* Modal Title */}
            <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-5">
              <h3 className="font-display font-semibold text-lg text-luxury-gold">
                {editingItem ? `Revise: ${editingItem.name}` : "Register New Culinary Dish"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* Dish Name */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">
                  Dish Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Malai Boti Special, Thunder Zinger"
                  className="w-full bg-luxury-black border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-luxury-gold"
                />
              </div>

              {/* Category Picker */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-luxury-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-luxury-gold"
                  >
                    {categories.filter(c => c !== "All").map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="custom">+ Create Custom Category</option>
                  </select>
                </div>

                {formCategory === "custom" && (
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">
                      New Category Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formCustomCategory}
                      onChange={(e) => setFormCustomCategory(e.target.value)}
                      placeholder="e.g. Desserts, Soup"
                      className="w-full bg-luxury-black border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-luxury-gold"
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">
                  Luxury Menu Description
                </label>
                <textarea
                  rows="2"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Rich mozzarella base, charcoal chicken, caramelized onions..."
                  className="w-full bg-luxury-black border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-luxury-gold"
                ></textarea>
              </div>

              {/* Size Configuration Panel */}
              <div className="border-t border-white/10 pt-4 space-y-3">
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                  Sizes & Price configuration (Rs.) *
                </label>
                
                <div className="space-y-2">
                  {Object.keys(activeSizes).map((sz) => {
                    const isActive = activeSizes[sz];
                    return (
                      <div key={sz} className="flex items-center gap-4 bg-luxury-black/40 border border-white/5 p-2 rounded-lg">
                        <label className="flex items-center gap-2 cursor-pointer w-24 select-none">
                          <input
                            type="checkbox"
                            checked={isActive}
                            onChange={() => handleSizeToggle(sz)}
                            className="rounded border-white/10 text-luxury-gold focus:ring-luxury-gold accent-luxury-gold"
                          />
                          <span className="text-xs font-semibold text-white uppercase">Size {sz}</span>
                        </label>
                        
                        {isActive && (
                          <div className="flex-1">
                            <input
                              type="number"
                              required={isActive}
                              value={sizePrices[sz]}
                              onChange={(e) => handlePriceChange(sz, e.target.value)}
                              placeholder={`Price for ${sz} in Rs.`}
                              className="w-full bg-luxury-black border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-luxury-gold"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/10 mt-6">
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white orange-btn transition-all duration-300"
                >
                  Save Dish Config
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="py-3.5 px-6 rounded-xl font-semibold text-xs transition-all bg-luxury-gray text-gray-300 hover:bg-white/5 border border-white/10"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
