"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "../context/CartContext";
import { useSiteConfig } from "../context/ConfigContext";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { items, setIsSidebarOpen } = useCart();
  const { config } = useSiteConfig();

  // Don't show bottom nav inside admin panel to keep admin workspace clean
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const totalCartCount = (items || []).reduce((sum, item) => sum + (Number(item?.qty) || 1), 0);
  const whatsappNum = (config?.contact?.whatsapp || "917319064254").replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(
    "Hello Vijay Jewellery Collection Concierge, I would like to inquire about scheduling a private consultation."
  )}`;

  const isHome = pathname === "/";
  const isCheckout = pathname === "/checkout";

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-[#ede7dc] pb-safe transition-all duration-300 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {/* Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isHome ? "text-[#b8860b]" : "text-[#78716c] hover:text-[#1a160d]"
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">
            {isHome ? "home" : "home"}
          </span>
          <span className="text-[10px] font-medium tracking-wider uppercase mt-1">Salon</span>
        </Link>

        {/* The Collection / Catalog */}
        <button
          type="button"
          onClick={() => {
            if (isHome) {
              const el = document.getElementById("catalog-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            } else {
              window.location.href = "/#catalog-section";
            }
          }}
          className="flex flex-col items-center justify-center flex-1 py-1 text-[#78716c] hover:text-[#1a160d] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[22px]">diamond</span>
          <span className="text-[10px] font-medium tracking-wider uppercase mt-1">The Collection</span>
        </button>

        {/* WhatsApp VIP Concierge Center Floating Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center -mt-6 relative group"
        >
          <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#d4af37] via-[#f2ca50] to-[#ffe088] text-[#1a160d] flex items-center justify-center shadow-[0_4px_16px_rgba(212,175,55,0.35)] transition-transform active:scale-95 border-2 border-white">
            <span className="material-symbols-outlined text-[26px]">support_agent</span>
          </div>
          <span className="text-[9px] font-bold tracking-widest text-[#8c6b12] mt-1 uppercase">
            Concierge
          </span>
        </a>

        {/* Shopping Bag */}
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="flex flex-col items-center justify-center flex-1 py-1 text-[#78716c] hover:text-[#1a160d] transition-colors relative cursor-pointer"
        >
          <div className="relative">
            <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-gradient-to-r from-[#d4af37] to-[#f6d172] text-[#1a160d] text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-sm">
                {totalCartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium tracking-wider uppercase mt-1">Bag</span>
        </button>

        {/* Checkout */}
        <Link
          href="/checkout"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isCheckout ? "text-[#b8860b]" : "text-[#78716c] hover:text-[#1a160d]"
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">lock</span>
          <span className="text-[10px] font-medium tracking-wider uppercase mt-1">Checkout</span>
        </Link>
      </div>
    </nav>
  );
}
