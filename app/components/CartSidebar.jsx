"use client";

import Link from "next/link";
import { FiX, FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiArrowRight, FiShield, FiPackage } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useSiteConfig } from "../context/ConfigContext";

export default function CartSidebar() {
  const { items: cartItems, updateQty, removeItem, isSidebarOpen, setIsSidebarOpen } = useCart();
  const { config } = useSiteConfig();

  const brand = config?.brand || {};
  const contact = config?.contact || {};
  const currency = brand.currency || "₹";

  const toAmount = (value) => {
    const match = String(value).replace(/,/g, "").match(/\d+(?:\.\d+)?/);
    return match ? parseFloat(match[0]) : 0;
  };

  const itemCount = (cartItems || []).reduce((sum, i) => sum + (Number(i?.qty) || 1), 0);
  const subtotal = (cartItems || []).reduce((sum, i) => sum + toAmount(i?.price) * (Number(i?.qty) || 1), 0);

  const formatPrice = (amount) => {
    return currency + amount.toLocaleString("en-IN");
  };

  const whatsappNum = (contact.whatsapp || "917319064254").replace(/[^0-9]/g, "");
  const orderListText = cartItems
    .map((item) => `- ${item.title} (Qty: ${item.qty}) @ ${item.price}`)
    .join("\n");
  const whatsappCartUrl = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(
    `Hello Vijay Jewellery Collection Concierge,\n\nI would like to acquire the following pieces from my bag:\n\n${orderListText}\n\nTotal Order Value: ${formatPrice(subtotal)}\n\nPlease assist me with armored delivery, hallmarking documentation, and invoice registration.`
  )}`;

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
          aria-label="Close cart overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed top-0 right-0 bottom-0 w-full sm:w-[420px] z-50 bg-white shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out border-l border-[#ede7dc] ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Shopping Bag"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#ede7dc] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#b8860b] text-2xl">diamond</span>
            <div>
              <h2 className="font-serif text-base font-bold tracking-wider text-[#1a160d] uppercase">
                Shopping Bag ({itemCount})
              </h2>
              <span className="text-[10px] text-[#78716c] uppercase tracking-widest">
                Atelier Vijay &bull; Est. 1994
              </span>
            </div>
          </div>
          <button
            className="text-[#78716c] hover:text-[#1a160d] p-1.5 rounded-full transition-colors cursor-pointer"
            aria-label="Close cart"
            onClick={() => setIsSidebarOpen(false)}
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Complimentary Insured Delivery Badge */}
        <div className="bg-[#fdf8ed] border-b border-[#f0dfb3] px-4 py-2.5 flex items-center gap-2 text-center justify-center">
          <span className="material-symbols-outlined text-[#b8860b] text-base">verified</span>
          <span className="text-[11px] font-semibold tracking-wider text-[#8c6b12] uppercase">
            Armored Courier &amp; Full Insurance Included Across India
          </span>
        </div>

        {/* Bag Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 no-scrollbar">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <div className="w-16 h-16 rounded-full bg-[#fbf9f5] border border-[#ede7dc] flex items-center justify-center mb-4 text-[#b8860b]">
                <span className="material-symbols-outlined text-3xl">shopping_bag</span>
              </div>
              <h3 className="font-serif text-lg text-[#1a160d] font-bold mb-1">Your Bag is Empty</h3>
              <p className="text-xs text-[#78716c] mb-6 max-w-[240px] leading-relaxed">
                Discover our certified solitaire rings, bridal necklaces, and bespoke atelier creations.
              </p>
              <button
                className="bg-gradient-to-r from-[#d4af37] to-[#f6d172] text-[#1a160d] font-bold text-xs px-6 py-3 rounded-full uppercase tracking-wider shadow-sm hover:opacity-95 transition-all cursor-pointer"
                onClick={() => setIsSidebarOpen(false)}
              >
                Explore The Collection
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <article
                  key={`${item.slug}-${item.variant || "base"}`}
                  className="flex gap-3 p-3 bg-[#fbf9f5] rounded-xl border border-[#ede7dc] hover:border-[#d4af37]/50 transition-all"
                >
                  <div
                    className="w-20 h-20 bg-white shrink-0 rounded-lg bg-cover bg-center overflow-hidden border border-[#ede7dc]"
                    style={
                      item.image
                        ? { backgroundImage: `url(${item.image})` }
                        : {}
                    }
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="font-serif text-xs sm:text-sm font-semibold text-[#1a160d] line-clamp-1">
                          {item.title}
                        </p>
                        {item.variant && (
                          <span className="text-[10px] text-[#b8860b] block mt-0.5">
                            {item.variant}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        className="text-[#78716c] hover:text-rose-500 transition-colors p-1 cursor-pointer"
                        aria-label="Remove item"
                        onClick={() => removeItem(item.slug, item.variant)}
                      >
                        <FiTrash2 className="text-xs" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="font-serif text-xs sm:text-sm font-bold text-[#b8860b]">
                        {item.price}
                      </span>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-2 bg-white border border-[#d8cfbe] rounded-lg px-2 py-0.5">
                        <button
                          type="button"
                          className="text-[#78716c] hover:text-[#1a160d] p-0.5 cursor-pointer"
                          onClick={() => updateQty(item.slug, item.variant, Math.max(1, item.qty - 1))}
                        >
                          <FiMinus className="text-[10px]" />
                        </button>
                        <span className="text-xs font-bold text-[#1a160d] min-w-[16px] text-center">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          className="text-[#78716c] hover:text-[#1a160d] p-0.5 cursor-pointer"
                          onClick={() => updateQty(item.slug, item.variant, item.qty + 1)}
                        >
                          <FiPlus className="text-[10px]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}

              {/* Complimentary Velvet Packaging Box */}
              <div className="p-3 bg-[#f8f5ee] rounded-xl border border-[#ede7dc] flex items-center gap-2.5 text-xs">
                <FiPackage className="text-[#b8860b] text-base shrink-0" />
                <span className="text-[#5c5446] text-[11px] leading-tight">
                  Handcrafted velvet heirloom casket with wax seal &amp; dossier certificate included complimentary.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {cartItems.length > 0 && (
          <div className="p-5 bg-[#fbf9f5] border-t border-[#ede7dc] space-y-3">
            {/* Price Breakdown */}
            <div className="space-y-1.5 pb-3 border-b border-[#ede7dc]">
              <div className="flex justify-between items-center text-xs text-[#78716c]">
                <span>Subtotal</span>
                <span className="text-[#1a160d] font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-[#78716c]">
                <span>Armored Courier &amp; Transit Insurance</span>
                <span className="text-[#b8860b] font-semibold">COMPLIMENTARY</span>
              </div>
              <div className="flex justify-between items-center text-sm font-serif font-bold text-[#1a160d] pt-1">
                <span>Total Acquisition Value</span>
                <span className="text-base text-[#b8860b]">{formatPrice(subtotal)}</span>
              </div>
            </div>

            {/* Primary Checkout Button */}
            <Link
              href="/checkout"
              onClick={() => setIsSidebarOpen(false)}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#d4af37] text-[#1a160d] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition-all cursor-pointer"
            >
              <span>Proceed to Armored Checkout</span>
              <FiArrowRight className="text-sm" />
            </Link>

            {/* Direct WhatsApp Order Link */}
            <a
              href={whatsappCartUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl border border-[#25D366] text-[#128C7E] hover:bg-[#25D366]/10 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <FaWhatsapp className="text-sm" />
              <span>Acquire Directly via Concierge</span>
            </a>
          </div>
        )}
      </aside>
    </>
  );
}
