"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShoppingBag, Plus, Minus, Trash2, Check, 
  ArrowLeft, Utensils, CreditCard, ChevronRight 
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("Takeaway");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");

  // Load cart from LocalStorage
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("firebun-cart");
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } catch (e) {
      console.error("Failed to load cart");
    }
  }, []);

  // Sync cart to local storage & navbar count badge
  const syncCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem("firebun-cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("firebun-cart-updated"));
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
      alert("Please enter guest name.");
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
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="flex-1 bg-luxury-black max-w-5xl mx-auto w-full p-4 sm:p-8 flex flex-col gap-6">
      
      {/* Back Button Link */}
      <div>
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-luxury-gold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Royal Menu
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-luxury-gold/10 pb-4">
        <h1 className="font-display text-3xl font-extrabold text-white flex items-center gap-3">
          <ShoppingBag className="text-luxury-gold w-8 h-8" />
          Gourmet Order Plate
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Review your selection and configure table instructions below.
        </p>
      </div>

      {cart.length === 0 && !orderPlaced ? (
        /* Empty Cart State */
        <div className="text-center py-20 bg-luxury-dark/40 border border-white/5 rounded-2xl p-8 max-w-md mx-auto space-y-6">
          <div className="w-16 h-16 bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/25 rounded-full flex items-center justify-center mx-auto opacity-75">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-semibold text-lg text-white">Your plate is currently empty</h3>
            <p className="text-xs text-gray-400">
              Browse our royal selection of gold-crisped zingers, standard wraps, pizzas, and fresh nectars.
            </p>
          </div>
          <Link
            href="/"
            className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-luxury-black bg-luxury-gold hover:bg-luxury-gold-light transition-all flex items-center justify-center gap-1.5"
          >
            Explore Menu
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : orderPlaced ? (
        /* Success State */
        <div className="text-center py-16 bg-luxury-dark border border-luxury-gold rounded-2xl p-8 max-w-md mx-auto space-y-5 shadow-2xl animate-scaleUp">
          <div className="w-16 h-16 bg-green-950 border border-green-500 rounded-full flex items-center justify-center mx-auto text-green-400 shadow-md">
            <Check className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display font-bold text-2xl text-white">Order Placed!</h3>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              Your order has been transmitted directly to the kitchen POS dashboard.
            </p>
            <div className="bg-luxury-black/60 border border-white/5 py-2 px-4 rounded-xl text-xs font-mono text-luxury-gold inline-block mt-3">
              Order Reference ID: {placedOrderId}
            </div>
          </div>
          <p className="text-[10px] text-gray-500">
            Staff will finalize your printed invoice receipt once prepared.
          </p>
          <div className="pt-4 flex flex-col gap-2">
            <button
              onClick={() => router.push("/")}
              className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white orange-btn"
            >
              Order Something Else
            </button>
            <button
              onClick={() => router.push("/staff")}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-luxury-gray text-gray-300 hover:text-white border border-white/10"
            >
              Go to POS Dashboard
            </button>
          </div>
        </div>
      ) : (
        /* Active Cart Table & Form Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Items Table (7 of 12) */}
          <div className="lg:col-span-7 bg-luxury-dark/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md space-y-4">
            <h3 className="text-xs uppercase tracking-widest font-semibold text-luxury-gold border-b border-white/10 pb-2">
              Items Selected
            </h3>

            <div className="divide-y divide-white/5">
              {cart.map((cartItem, idx) => (
                <div key={idx} className="py-4 flex justify-between items-center gap-4 group">
                  {/* Name and Description info */}
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-sm">{cartItem.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Category: {cartItem.category}
                      {cartItem.size && cartItem.size !== "Standard" ? ` · Size: ${cartItem.size}` : ""}
                    </p>
                    <div className="text-xs font-bold text-luxury-gold mt-1 font-mono">
                      Rs. {cartItem.price} each
                    </div>
                  </div>

                  {/* Quantity controls & Line Total */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 bg-luxury-black border border-white/10 rounded-xl p-0.5 shadow-inner">
                      <button
                        onClick={() => updateQuantity(idx, -1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-semibold w-5 text-center text-gray-200 font-mono">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(idx, 1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="w-20 text-right font-mono font-extrabold text-sm text-luxury-gold">
                      Rs.{cartItem.price * cartItem.quantity}
                    </div>

                    <button
                      onClick={() => removeFromCart(idx)}
                      className="text-gray-500 hover:text-red-400 transition-colors p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout Form Sidebar (5 of 12) */}
          <div className="lg:col-span-5 bg-luxury-dark border border-luxury-gold/25 rounded-2xl p-6 shadow-xl space-y-6">
            <h3 className="font-display font-bold text-lg text-white border-b border-white/10 pb-3">
              Order Validation
            </h3>

            <form onSubmit={placeOrder} className="space-y-4">
              
              {/* Pricing Math */}
              <div className="space-y-2 text-xs font-mono text-gray-400">
                <div className="flex justify-between">
                  <span>Items Subtotal:</span>
                  <span className="text-white">Rs. {cartTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST Taxes:</span>
                  <span className="text-green-500 font-bold uppercase text-[9px] tracking-wider">Free (Rs. 0)</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-sm text-white">
                  <span>Grand Total:</span>
                  <span className="text-luxury-gold text-base">Rs. {cartTotal}</span>
                </div>
              </div>

              {/* Guest Details */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">
                    Guest Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Hanzla, Sophia"
                    className="w-full bg-luxury-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-luxury-gold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">
                    Table / Counter Location *
                  </label>
                  <select
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full bg-luxury-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-luxury-gold"
                  >
                    <option value="Takeaway">Takeaway (Pick-up Counter)</option>
                    <option value="Table 1">Table 1</option>
                    <option value="Table 2">Table 2</option>
                    <option value="Table 3">Table 3</option>
                    <option value="Table 4">Table 4</option>
                    <option value="Table 5">Table 5</option>
                    <option value="Table 6">Table 6</option>
                    <option value="VIP Lounge">VIP Lounge</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white orange-btn mt-6 flex items-center justify-center gap-2"
              >
                <Utensils className="w-4 h-4" />
                Dispatch Order to POS Suite
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
