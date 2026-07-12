"use client";

import { useState, useEffect } from "react";
import { 
  Users, ShoppingBag, Plus, Minus, Trash2, Printer, 
  Clock, DollarSign, CheckCircle, RefreshCw, X, HelpCircle, Utensils
} from "lucide-react";
import ReceiptModal from "@/components/ReceiptModal";

export default function StaffPOS() {
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [categories, setCategories] = useState(["All"]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // POS Billing Worksheet State
  const [billItems, setBillItems] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [importedOrderId, setImportedOrderId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [cashReceived, setCashReceived] = useState("");
  const [discount, setDiscount] = useState(""); // in Rs.
  const [taxRate, setTaxRate] = useState(0); // tax removed

  // Receipt Modal State
  const [showReceipt, setShowReceipt] = useState(false);
  const [generatedBill, setGeneratedBill] = useState(null);

  // Fetch Menu on mount
  useEffect(() => {
    async function loadMenu() {
      try {
        const res = await fetch("/api/menu");
        if (res.ok) {
          const data = await res.json();
          setMenu(data);
          const cats = ["All", ...new Set(data.map(item => item.category))];
          setCategories(cats);
        }
      } catch (err) {
        console.error("Failed to fetch menu:", err);
      }
    }
    loadMenu();
  }, []);

  // Fetch Orders and set up auto-polling
  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        // Sort orders so that "pending" is first, then "preparing", then timestamp order
        const sorted = data.sort((a, b) => {
          if (a.status === "pending" && b.status !== "pending") return -1;
          if (a.status !== "pending" && b.status === "pending") return 1;
          if (a.status === "preparing" && b.status === "completed") return -1;
          return new Date(b.timestamp) - new Date(a.timestamp);
        });
        setOrders(sorted);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000); // Poll every 3 seconds for live syncing
    return () => clearInterval(interval);
  }, []);

  // Add Item to POS Worksheet
  const addToPOS = (item, size) => {
    const price = item.prices[size];
    const existingIdx = billItems.findIndex(
      bi => bi.id === item.id && bi.size === size
    );

    let newItems = [...billItems];
    if (existingIdx !== -1) {
      newItems[existingIdx].quantity += 1;
    } else {
      newItems.push({
        id: item.id,
        name: item.name,
        size: size,
        price: price,
        quantity: 1
      });
    }
    setBillItems(newItems);
  };

  // Import dynamic customer order directly to POS
  const importOrder = (order) => {
    setBillItems(
      order.items.map(item => ({
        id: item.id,
        name: item.name,
        size: item.size,
        price: item.price,
        quantity: item.quantity
      }))
    );
    setCustomerName(order.customerName);
    setImportedOrderId(order.id);
  };

  // Clear Worksheet
  const clearPOS = () => {
    setBillItems([]);
    setCustomerName("");
    setImportedOrderId(null);
    setCashReceived("");
    setDiscount("");
  };

  // Adjust POS item quantities
  const updatePOSQuantity = (index, delta) => {
    let newItems = [...billItems];
    newItems[index].quantity += delta;
    if (newItems[index].quantity <= 0) {
      newItems.splice(index, 1);
    }
    setBillItems(newItems);
  };

  const removePOSItem = (index) => {
    let newItems = [...billItems];
    newItems.splice(index, 1);
    setBillItems(newItems);
  };

  // Update order status (Preparing, Complete, Cancelled)
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateStatus", id: orderId, status: newStatus })
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      alert("Failed to update order status");
    }
  };

  // Calculations
  const subtotal = billItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxAmount = 0;
  const parsedDiscount = Number(discount) || 0;
  const grandTotal = Math.max(0, subtotal - parsedDiscount);
  
  const parsedCash = Number(cashReceived) || 0;
  const changeGiven = parsedCash > grandTotal ? parsedCash - grandTotal : 0;

  // Submit Bill & Open Receipt
  const handleGenerateReceipt = async (e) => {
    e.preventDefault();
    if (billItems.length === 0) {
      alert("POS sheet has no items.");
      return;
    }
    if (!customerName.trim()) {
      alert("Please enter customer name.");
      return;
    }

    try {
      const billPayload = {
        customerName: customerName,
        orderId: importedOrderId,
        items: billItems,
        totalAmount: subtotal,
        tax: taxRate,
        discount: parsedDiscount,
        grandTotal: grandTotal,
        paymentMethod: paymentMethod,
        cashReceived: parsedCash,
        changeGiven: changeGiven
      };

      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(billPayload)
      });

      if (!res.ok) throw new Error("Failed to save bill");
      const responseData = await res.json();
      
      setGeneratedBill(responseData.bill);
      setShowReceipt(true);

      // Reset
      clearPOS();
      fetchOrders();
    } catch (err) {
      alert("Error generating bill: " + err.message);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-luxury-black max-w-7xl mx-auto w-full p-4 sm:p-6 gap-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-luxury-gold/10 pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="text-luxury-gold w-6 h-6" />
            POS Terminal & Live Suite
          </h1>
          <p className="text-xs text-gray-400">
            Workstation for counter billing, kitchen order processing, and receipt generation.
          </p>
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <button
            onClick={fetchOrders}
            className="flex items-center gap-1 bg-luxury-gray text-gray-300 hover:text-white px-3 py-1.5 rounded-lg text-xs border border-white/5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
        
        {/* Column 1: Live Customer Orders Feed (3 of 12) */}
        <div className="lg:col-span-3 space-y-4 max-h-[80vh] overflow-y-auto pr-1">
          <h3 className="text-xs uppercase tracking-widest font-semibold text-luxury-gold flex items-center gap-1.5 border-b border-white/10 pb-2">
            <Clock className="w-4 h-4" />
            Live Kitchen Orders
          </h3>

          {loadingOrders ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-luxury-dark/40 border border-white/5 rounded-xl p-3 h-28 animate-pulse"></div>
              ))}
            </div>
          ) : orders.filter(o => o.status !== "completed" && o.status !== "cancelled").length === 0 ? (
            <div className="text-center py-10 bg-luxury-dark/10 rounded-xl border border-white/5 text-gray-500 text-xs">
              No active customer orders.
            </div>
          ) : (
            <div className="space-y-3">
              {orders
                .filter(o => o.status !== "completed" && o.status !== "cancelled")
                .map((order) => {
                  const isPending = order.status === "pending";
                  const isPreparing = order.status === "preparing";

                  return (
                    <div 
                      key={order.id}
                      className={`glass-panel rounded-xl p-4 space-y-3 border transition-all ${
                        isPending 
                          ? "border-luxury-orange/40 bg-luxury-orange/5" 
                          : "border-luxury-gold/30 bg-luxury-gold/5"
                      }`}
                    >
                      {/* Meta info */}
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-mono font-bold text-luxury-gold">{order.id}</span>
                        <span className={`px-2 py-0.5 rounded uppercase font-semibold text-[8px] tracking-wider ${
                          isPending 
                            ? "bg-luxury-orange/20 text-luxury-orange" 
                            : "bg-luxury-gold/20 text-luxury-gold"
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      {/* Customer Details */}
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase">{order.customerName}</h4>
                        <p className="text-[10px] text-gray-400 font-mono">Location: {order.tableNumber}</p>
                      </div>

                      {/* Items ordered */}
                      <div className="text-[10px] space-y-1 border-t border-white/5 pt-2 font-mono">
                        {order.items.map((it, i) => (
                          <div key={i} className="flex justify-between text-gray-300">
                            <span>{it.quantity}x {it.name} ({it.size})</span>
                            <span>Rs.{it.price * it.quantity}</span>
                          </div>
                        ))}
                        <div className="flex justify-between font-bold text-white border-t border-white/5 pt-1 mt-1 text-xs">
                          <span>Total:</span>
                          <span className="text-luxury-gold">Rs.{order.totalAmount}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => importOrder(order)}
                          className="flex-1 py-1 rounded bg-luxury-gold text-luxury-black font-bold text-[9px] uppercase tracking-wider hover:bg-luxury-gold-light"
                        >
                          Import POS
                        </button>
                        
                        {isPending && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, "preparing")}
                            className="py-1 px-2 rounded bg-luxury-orange/20 border border-luxury-orange/40 text-luxury-orange font-bold text-[9px] uppercase tracking-wider hover:bg-luxury-orange/30"
                          >
                            Prepare
                          </button>
                        )}
                        
                        {isPreparing && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, "completed")}
                            className="py-1 px-2 rounded bg-green-950/80 border border-green-500/50 text-green-300 font-bold text-[9px] uppercase tracking-wider hover:bg-green-900"
                          >
                            Done
                          </button>
                        )}

                        <button
                          onClick={() => handleUpdateStatus(order.id, "cancelled")}
                          className="p-1 rounded bg-red-950/80 border border-red-500/30 text-red-400 hover:bg-red-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Column 2: POS Active Billing Worksheet (5 of 12) */}
        <div className="lg:col-span-5 bg-luxury-dark border border-luxury-gold/25 rounded-2xl p-5 shadow-lg flex flex-col justify-between max-h-[80vh] overflow-y-auto">
          <div>
            <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
              <h3 className="font-display font-bold text-lg text-white">
                Billing Worksheet
              </h3>
              <div className="flex items-center gap-2">
                {importedOrderId && (
                  <span className="text-[10px] font-mono text-luxury-orange bg-luxury-orange/15 px-2 py-0.5 rounded border border-luxury-orange/25">
                    Syncing: {importedOrderId}
                  </span>
                )}
                <button
                  onClick={clearPOS}
                  className="text-xs text-gray-500 hover:text-white transition-colors"
                >
                  Clear Sheet
                </button>
              </div>
            </div>

            {/* Input Details */}
            <div className="mb-4">
              <label className="block text-[9px] uppercase tracking-wider text-gray-500 font-semibold mb-1">
                Customer / Guest Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Guest name"
                className="w-full bg-luxury-black border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-luxury-gold"
              />
            </div>

            {/* Active Items Table */}
            {billItems.length === 0 ? (
              <div className="text-center py-20 text-gray-600 space-y-2 border border-dashed border-white/5 rounded-xl">
                <Utensils className="w-8 h-8 mx-auto opacity-30" />
                <p className="text-xs font-light">No billing items selected.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5 max-h-[30vh] overflow-y-auto pr-1">
                {billItems.map((bi, idx) => (
                  <div key={idx} className="py-2.5 flex justify-between items-center gap-3">
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-white leading-tight">{bi.name}</h4>
                      <p className="text-[10px] text-gray-400 font-mono">
                        {bi.size !== "Standard" ? `Size: ${bi.size} · ` : ""}
                        Rs.{bi.price}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 bg-luxury-black border border-white/10 rounded-lg p-0.5">
                        <button
                          onClick={() => updatePOSQuantity(idx, -1)}
                          className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-semibold w-4 text-center text-gray-300 font-mono">{bi.quantity}</span>
                        <button
                          onClick={() => updatePOSQuantity(idx, 1)}
                          className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="w-16 text-right font-mono font-bold text-xs text-luxury-gold">
                        Rs.{bi.price * bi.quantity}
                      </div>
                      <button
                        onClick={() => removePOSItem(idx)}
                        className="text-gray-500 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing Math, Cash Inputs & Checkout */}
          {billItems.length > 0 && (
            <form onSubmit={handleGenerateReceipt} className="pt-4 border-t border-white/15 space-y-4 bg-luxury-dark mt-4">
              
              {/* Calculations Block */}
              <div className="space-y-1.5 text-xs font-mono text-gray-400">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="text-white">Rs.{subtotal}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Discount (Rs.):</span>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="0"
                    className="w-20 bg-luxury-black border border-white/10 rounded px-1.5 py-0.5 text-right text-xs text-white focus:outline-none focus:border-luxury-gold font-mono"
                  />
                </div>
                <div className="border-t border-white/5 pt-1.5 flex justify-between font-bold text-sm text-white">
                  <span>Grand Total:</span>
                  <span className="text-luxury-gold text-base">Rs.{grandTotal}</span>
                </div>
              </div>

              {/* Payment Details Block */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-gray-500 font-semibold mb-1">
                    Pay Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-luxury-black border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="Cash">Cash Payment</option>
                    <option value="Card">Visa/Mastercard</option>
                    <option value="UPI/Mobile">Mobile Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-gray-500 font-semibold mb-1">
                    Cash Tendered
                  </label>
                  <input
                    type="number"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    placeholder="Rs. Cash"
                    disabled={paymentMethod !== "Cash"}
                    className="w-full bg-luxury-black border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              {paymentMethod === "Cash" && parsedCash > 0 && (
                <div className="flex justify-between items-center bg-luxury-black/60 border border-white/5 px-3 py-1.5 rounded-lg text-xs font-mono">
                  <span className="text-gray-400">Cash Return:</span>
                  <span className="text-green-400 font-bold text-sm">Rs.{changeGiven}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white orange-btn transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Generate & Lock Receipt
              </button>
            </form>
          )}
        </div>

        {/* Column 3: Quick Menu Selector Catalog (4 of 12) */}
        <div className="lg:col-span-4 space-y-4 max-h-[80vh] overflow-y-auto">
          <h3 className="text-xs uppercase tracking-widest font-semibold text-luxury-gold flex items-center gap-1.5 border-b border-white/10 pb-2">
            <Utensils className="w-4 h-4" />
            POS Quick Menu
          </h3>

          {/* Quick Categories Bar */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-3 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all border ${
                  activeTab === cat
                    ? "bg-luxury-gold text-luxury-black border-luxury-gold"
                    : "bg-luxury-black text-gray-400 border-white/5 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Catalog Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {menu
              .filter(item => activeTab === "All" || item.category === activeTab)
              .map((item) => (
                <div 
                  key={item.id}
                  className="bg-luxury-dark/80 border border-white/5 rounded-xl p-3 flex flex-col justify-between gap-3 text-xs"
                >
                  <div>
                    <h4 className="font-bold text-white leading-tight line-clamp-1">{item.name}</h4>
                    <span className="text-[9px] text-gray-500">{item.category}</span>
                  </div>

                  {/* Render Size Add Buttons */}
                  <div className="space-y-1.5 border-t border-white/5 pt-2 mt-auto">
                    {item.sizes.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => addToPOS(item, sz)}
                        className="w-full py-1 px-2 bg-luxury-black/80 hover:bg-luxury-gold hover:text-luxury-black border border-white/5 rounded text-[9px] font-semibold flex justify-between items-center text-gray-300 transition-colors"
                      >
                        <span>Size {sz}</span>
                        <span className="font-bold">Rs.{item.prices[sz]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {showReceipt && generatedBill && (
        <ReceiptModal
          isOpen={showReceipt}
          onClose={() => {
            setShowReceipt(false);
            setGeneratedBill(null);
          }}
          bill={generatedBill}
        />
      )}
    </div>
  );
}
