"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  FiChevronLeft,
  FiLock,
  FiShoppingBag,
  FiCheckCircle,
  FiShield,
  FiArrowRight,
  FiTruck
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useSiteConfig } from "../context/ConfigContext";

const toAmount = (value) => {
  const match = String(value).replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return match ? parseFloat(match[0]) : 0;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items: cartItems, clear } = useCart();
  const { config } = useSiteConfig();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    pincode: "",
    address: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(null);

  const brand = config?.brand || {};
  const contact = config?.contact || {};
  const currency = brand.currency || "₹";

  const itemTotal = cartItems.reduce((sum, i) => sum + toAmount(i.price) * i.qty, 0);
  const grandTotal = itemTotal;

  const formatPrice = (amount) => {
    return currency + amount.toLocaleString("en-IN");
  };

  const updateField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert("Your shopping bag is empty.");
      return;
    }
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim() || !form.pincode.trim()) {
      alert("Please fill in all required delivery details.");
      return;
    }

    setIsSubmitting(true);
    const orderId = `VJC-${Date.now().toString().slice(-6)}`;

    const orderData = {
      id: orderId,
      customer: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      pincode: form.pincode.trim(),
      notes: form.notes.trim(),
      total: formatPrice(grandTotal),
      subtotal: formatPrice(itemTotal),
      status: "Pending",
      placedAt: new Date().toISOString(),
      items: cartItems.map((i) => ({
        slug: i.slug,
        title: i.title,
        qty: i.qty,
        price: i.price,
        image: i.image || "",
      })),
    };

    try {
      // 1. Save order to backend server
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) {
        throw new Error("Failed to save order on server");
      }

      setOrderComplete(orderData);
      clear();

      // 2. Prepare WhatsApp message for customer
      const whatsappNum = (contact.whatsapp || "917319064254").replace(/[^0-9]/g, "");
      let message = `*Vijay Jewellery Order: ${orderId}*\n\n`;
      message += `*Customer:* ${form.name.trim()} (${form.phone.trim()})\n`;
      if (form.email) message += `*Email:* ${form.email.trim()}\n`;
      message += `*Delivery Address:* ${form.address.trim()}, PIN: ${form.pincode.trim()}\n\n`;
      message += `*Pieces Ordered:*\n`;
      cartItems.forEach((item) => {
        message += `• ${item.title} (Qty: ${item.qty}) - ${item.price}\n`;
      });
      message += `\n*Total Order Value:* ${formatPrice(grandTotal)}\n`;
      message += `*Transit Method:* Armored Insured Courier\n\n`;
      message += `Please confirm my order and share banking/invoice details.`;

      const whatsappUrl = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(message)}`;

      setTimeout(() => {
        window.open(whatsappUrl, "_blank");
      }, 500);
    } catch (err) {
      console.error("Order submission error:", err);
      alert("There was an issue processing your order. Please contact our concierge directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If order complete, show luxury confirmation screen
  if (orderComplete) {
    const whatsappNum = (contact.whatsapp || "917319064254").replace(/[^0-9]/g, "");
    const orderWhatsappUrl = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(
      `Hello Vijay Jewellery Collection Concierge, I placed Order #${orderComplete.id} for ${orderComplete.total}. Please confirm shipment.`
    )}`;

    return (
      <div className="min-h-screen bg-[#fdfbf9] text-[#1a160d] font-body flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-[#ede7dc] rounded-2xl p-6 md:p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#b8860b]/10 border border-[#b8860b]/30 flex items-center justify-center mx-auto mb-4 text-[#b8860b]">
            <FiCheckCircle className="text-3xl" />
          </div>

          <span className="text-[10px] font-semibold text-[#b8860b] uppercase tracking-[0.25em] block mb-1">
            Order Acquired
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#1a160d] mb-2">
            Order #{orderComplete.id}
          </h1>
          <p className="text-xs text-[#5c5446] mb-6 leading-relaxed">
            Thank you, {orderComplete.customer}. Your acquisition request has been lodged in our private registry. Our concierge team is preparing your insured armored dispatch.
          </p>

          <div className="p-4 bg-[#fbf9f5] rounded-xl border border-[#ede7dc] mb-6 text-left space-y-2 text-xs">
            <div className="flex justify-between text-[#78716c]">
              <span>Status:</span>
              <span className="text-[#b8860b] font-semibold">Under Atelier Review</span>
            </div>
            <div className="flex justify-between text-[#78716c]">
              <span>Total Value:</span>
              <span className="text-[#1a160d] font-bold">{orderComplete.total}</span>
            </div>
            <div className="flex justify-between text-[#78716c]">
              <span>Destination:</span>
              <span className="text-[#1a160d] truncate max-w-[200px]">{orderComplete.address}</span>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href={orderWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#d4af37] text-[#1a160d] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm hover:opacity-95 cursor-pointer transition-all"
            >
              <FaWhatsapp className="text-base text-[#128C7E]" />
              <span>Connect on WhatsApp</span>
            </a>

            <Link
              href="/"
              className="w-full py-3 px-4 rounded-xl bg-white border border-[#ede7dc] text-[#1a160d] hover:text-[#b8860b] hover:bg-[#fbf9f5] font-semibold text-xs uppercase tracking-wider block transition-colors"
            >
              Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf9] text-[#1a160d] font-body pb-24 md:pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#ede7dc] px-4 md:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[#5c5446] hover:text-[#b8860b] transition-colors text-xs font-semibold uppercase tracking-wider"
        >
          <FiChevronLeft className="text-base" /> Storefront
        </Link>

        <Link
          href="/"
          className="font-serif text-base md:text-lg tracking-widest gold-gradient-text font-bold uppercase"
        >
          {brand.name || "VIJAY JEWELLERY"}
        </Link>

        <div className="flex items-center gap-1 text-[#b8860b] text-xs font-semibold uppercase tracking-wider">
          <FiLock className="text-sm" /> Secure
        </div>
      </header>

      {/* Main Checkout Container */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 pt-8 md:pt-12">
        <div className="text-center max-w-lg mx-auto mb-8">
          <p className="text-[10px] font-semibold text-[#b8860b] uppercase tracking-[0.25em] mb-1">
            Bespoke Acquisition
          </p>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#1a160d]">
            Armored Delivery Checkout
          </h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#ede7dc] shadow-sm p-8 max-w-md mx-auto">
            <span className="material-symbols-outlined text-4xl text-[#b8860b] mb-2">shopping_bag</span>
            <h3 className="font-serif text-lg font-bold text-[#1a160d] mb-2">Your Bag is Empty</h3>
            <p className="text-xs text-[#5c5446] mb-6">
              Please select your jewelry pieces before proceeding to delivery details.
            </p>
            <Link
              href="/"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-[#d4af37] to-[#f2ca50] text-[#1a160d] font-bold text-xs uppercase tracking-wider shadow-sm hover:opacity-95"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Left: Customer & Delivery Details */}
            <div className="md:col-span-3 space-y-4">
              <div className="bg-white border border-[#ede7dc] rounded-2xl p-5 md:p-6 space-y-4 shadow-sm">
                <h2 className="font-serif text-base font-bold text-[#1a160d] uppercase tracking-wider border-b border-[#ede7dc] pb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-[#b8860b]">badge</span>
                  <span>Recipient &amp; Delivery Details</span>
                </h2>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5c5446] uppercase tracking-wider mb-1">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikramaditya Roy"
                      value={form.name}
                      onChange={updateField("name")}
                      className="w-full bg-[#fbf9f5] border border-[#d8cfbe] rounded-xl px-4 py-3 text-base md:text-sm text-[#1a160d] placeholder-[#8c8273] focus:outline-none focus:border-[#b8860b] focus:bg-white transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#5c5446] uppercase tracking-wider mb-1">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={form.phone}
                        onChange={updateField("phone")}
                        className="w-full bg-[#fbf9f5] border border-[#d8cfbe] rounded-xl px-4 py-3 text-base md:text-sm text-[#1a160d] placeholder-[#8c8273] focus:outline-none focus:border-[#b8860b] focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#5c5446] uppercase tracking-wider mb-1">
                        Postal PIN Code *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="700016"
                        value={form.pincode}
                        onChange={updateField("pincode")}
                        className="w-full bg-[#fbf9f5] border border-[#d8cfbe] rounded-xl px-4 py-3 text-base md:text-sm text-[#1a160d] placeholder-[#8c8273] focus:outline-none focus:border-[#b8860b] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#5c5446] uppercase tracking-wider mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="concierge@collector.com"
                      value={form.email}
                      onChange={updateField("email")}
                      className="w-full bg-[#fbf9f5] border border-[#d8cfbe] rounded-xl px-4 py-3 text-base md:text-sm text-[#1a160d] placeholder-[#8c8273] focus:outline-none focus:border-[#b8860b] focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#5c5446] uppercase tracking-wider mb-1">
                      Complete Shipping Address *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="House/Apartment number, Street, Landmark, City, State"
                      value={form.address}
                      onChange={updateField("address")}
                      className="w-full bg-[#fbf9f5] border border-[#d8cfbe] rounded-xl px-4 py-3 text-base md:text-sm text-[#1a160d] placeholder-[#8c8273] focus:outline-none focus:border-[#b8860b] focus:bg-white resize-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#5c5446] uppercase tracking-wider mb-1">
                      Bespoke Notes / Ring Sizing (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ring size 14, gift wrap with personalized card"
                      value={form.notes}
                      onChange={updateField("notes")}
                      className="w-full bg-[#fbf9f5] border border-[#d8cfbe] rounded-xl px-4 py-3 text-base md:text-sm text-[#1a160d] placeholder-[#8c8273] focus:outline-none focus:border-[#b8860b] focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs text-[#5c5446]">
                <div className="p-3 bg-white border border-[#ede7dc] rounded-xl shadow-sm">
                  <FiShield className="text-[#b8860b] mx-auto mb-1 text-base" />
                  <span className="text-[10px] uppercase font-bold text-[#1a160d] block">100% Certified</span>
                </div>
                <div className="p-3 bg-white border border-[#ede7dc] rounded-xl shadow-sm">
                  <FiTruck className="text-[#b8860b] mx-auto mb-1 text-base" />
                  <span className="text-[10px] uppercase font-bold text-[#1a160d] block">Armored Courier</span>
                </div>
                <div className="p-3 bg-white border border-[#ede7dc] rounded-xl shadow-sm">
                  <FiLock className="text-[#b8860b] mx-auto mb-1 text-base" />
                  <span className="text-[10px] uppercase font-bold text-[#1a160d] block">Direct Concierge</span>
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white border border-[#ede7dc] rounded-2xl p-5 md:p-6 space-y-4 shadow-sm">
                <h2 className="font-serif text-base font-bold text-[#1a160d] uppercase tracking-wider border-b border-[#ede7dc] pb-3">
                  Summary ({cartItems.reduce((s, i) => s + i.qty, 0)})
                </h2>

                <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar">
                  {cartItems.map((item) => (
                    <div key={`${item.slug}-${item.variant || "base"}`} className="flex gap-3 items-center">
                      <div
                        className="w-12 h-12 rounded-lg bg-[#fbf9f5] bg-cover bg-center border border-[#ede7dc] shrink-0"
                        style={item.image ? { backgroundImage: `url(${item.image})` } : {}}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#1a160d] truncate">{item.title}</p>
                        <p className="text-[11px] text-[#78716c]">Qty: {item.qty}</p>
                      </div>
                      <span className="font-serif text-xs font-bold text-[#b8860b] shrink-0">
                        {item.price}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#ede7dc] space-y-2 text-xs">
                  <div className="flex justify-between text-[#78716c]">
                    <span>Subtotal</span>
                    <span className="text-[#1a160d] font-medium">{formatPrice(itemTotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#78716c]">
                    <span>Armored Courier &amp; Insurance</span>
                    <span className="text-[#b8860b] font-semibold">FREE</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-serif font-bold text-[#1a160d] pt-2 border-t border-[#ede7dc]">
                    <span>Total Order Value</span>
                    <span className="text-base text-[#b8860b]">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#d4af37] text-[#1a160d] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Registering Order...</span>
                  ) : (
                    <>
                      <span>Submit Acquisition Request</span>
                      <FiArrowRight />
                    </>
                  )}
                </button>

                <p className="text-[10px] text-[#78716c] text-center leading-relaxed">
                  Upon submission, you will be connected with our private concierge via WhatsApp to verify ring size, delivery schedule, and billing.
                </p>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
