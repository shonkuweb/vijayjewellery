"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  FiChevronLeft,
  FiShoppingBag,
  FiShield,
  FiTruck,
  FiLock,
  FiMinus,
  FiPlus,
  FiArrowRight,
  FiCheck,
  FiVideo,
  FiAward
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { useSiteConfig } from "../../context/ConfigContext";

export default function ProductPage() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [selectedMetal, setSelectedMetal] = useState("18K Yellow Gold");
  const [selectedSize, setSelectedSize] = useState("14");
  const [activeAccordion, setActiveAccordion] = useState(0);
  const [isAdded, setIsAdded] = useState(false);

  const { addItem, items: cartItems, products, productsLoading, setIsSidebarOpen } = useCart();
  const { config } = useSiteConfig();

  const brand = config?.brand || {};
  const contact = config?.contact || {};
  const currency = brand.currency || "₹";

  const totalCartCount = (cartItems || []).reduce((sum, item) => sum + item.qty, 0);

  const [directProduct, setDirectProduct] = useState(null);
  const [fetchingDirect, setFetchingDirect] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const found = (products || []).find((item) => item.slug === slug || item.id === slug);
    if (!found && !productsLoading) {
      setFetchingDirect(true);
      fetch(`/api/products/${slug}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && !data.error) setDirectProduct(data);
        })
        .catch((err) => console.error("Error fetching single product:", err))
        .finally(() => setFetchingDirect(false));
    }
  }, [slug, products, productsLoading]);

  const product = (products || []).find((item) => item.slug === slug || item.id === slug) || directProduct;

  // Helper to format currency
  const formatPrice = (val) => {
    if (!val) return "₹0";
    const num = Number(String(val).replace(/[^0-9.-]+/g, ""));
    if (isNaN(num)) return val;
    return "₹" + num.toLocaleString("en-IN");
  };

  if (productsLoading || fetchingDirect) {
    return (
      <div className="min-h-screen bg-[#fdfbf9] text-[#1a160d] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-[#b8860b] animate-spin">
            progress_activity
          </span>
          <span className="text-xs uppercase tracking-widest text-[#78716c]">
            Retrieving Collection Masterpiece...
          </span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#fdfbf9] text-[#1a160d] flex flex-col items-center justify-center p-8 text-center">
        <span className="material-symbols-outlined text-5xl text-[#b8860b]/40 mb-3">diamond</span>
        <h1 className="font-serif text-2xl font-bold mb-2">Private Collection Item</h1>
        <p className="text-sm text-[#78716c] mb-6 max-w-sm leading-relaxed">
          The requested piece is currently undergoing appraisal or has been acquired by a private collector.
        </p>
        <Link
          href="/"
          className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#d4af37] to-[#f6d172] text-[#1a160d] font-bold text-xs uppercase tracking-wider shadow-sm"
        >
          Return to The Collection
        </Link>
      </div>
    );
  }

  const isRing = product.categoryId === 1 || product.title.toLowerCase().includes("ring");

  const handleAddToCart = () => {
    const variantDesc = isRing ? `${selectedMetal} • Size ${selectedSize}` : selectedMetal;
    addItem(product.slug || product.id, qty, variantDesc, {
      title: `${product.title} (${variantDesc})`,
      price: product.price?.startsWith("₹") ? product.price : `${currency}${product.price}`,
      image: product.image || "",
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
    setIsSidebarOpen(true);
  };

  const handleBuyNow = () => {
    const variantDesc = isRing ? `${selectedMetal} • Size ${selectedSize}` : selectedMetal;
    addItem(product.slug || product.id, qty, variantDesc, {
      title: `${product.title} (${variantDesc})`,
      price: product.price?.startsWith("₹") ? product.price : `${currency}${product.price}`,
      image: product.image || "",
    });
    router.push("/checkout");
  };

  const whatsappNum = (contact.whatsapp || "917319064254").replace(/[^0-9]/g, "");
  const productWhatsappUrl = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(
    `Hello Vijay Jewellery Collection Concierge,\n\nI am inquiring about the "${product.title}" (${formatPrice(
      product.price
    )}).\n\nSpecifications: ${selectedMetal}${isRing ? `, Size ${selectedSize}` : ""}\n\nPlease share high-definition close-up video, certification dossier, and delivery schedule.`
  )}`;

  const videoWhatsappUrl = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(
    `Hello Vijay Jewellery Concierge, I would like to schedule a Live Video Consultation to view the "${product.title}" (${formatPrice(
      product.price
    )}).`
  )}`;

  const accordionItems = [
    {
      title: "Gemological Dossier & Certificate of Origin",
      content:
        product.specs?.certificate
          ? `Accompanied by official ${product.specs.certificate}. Every diamond is laser inscribed on the girdle with a unique registration number, verifiable through central laboratory databases worldwide.`
          : "Accompanied by official laboratory diamond dossiers and BIS 916 hallmarking certificate. Laser inscribed on the girdle.",
    },
    {
      title: "Armored Transit & White-Glove Handover",
      content:
        "Dispatched via specialized armored courier services in tamper-proof seal packaging with 100% full transit insurance coverage until delivered into your hands.",
    },
    {
      title: "Custodial Privilege & 30-Year Lifetime Guarantee",
      content:
        "Includes complimentary lifetime ultrasonic cleaning, claw inspection, prong tightening, and one complimentary resize within 12 months of acquisition.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fdfbf9] text-[#1a160d] font-body pb-28 md:pb-16">
      {/* Top Heritage Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#ede7dc] px-4 md:px-8 h-16 flex items-center justify-between shadow-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[#78716c] hover:text-[#b8860b] transition-colors text-xs font-semibold uppercase tracking-wider"
        >
          <FiChevronLeft className="text-base" /> The Collection
        </Link>

        <Link
          href="/"
          className="font-serif text-base md:text-lg tracking-widest text-[#1a160d] font-bold uppercase"
        >
          {brand.name || "VIJAY JEWELLERY"}
        </Link>

        <button
          onClick={() => setIsSidebarOpen(true)}
          className="text-[#1a160d] hover:text-[#b8860b] p-2 rounded-full transition-colors relative cursor-pointer"
        >
          <FiShoppingBag className="text-xl" />
          {totalCartCount > 0 && (
            <span className="absolute top-1 right-1 bg-gradient-to-r from-[#d4af37] to-[#f6d172] text-[#1a160d] text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-sm">
              {totalCartCount}
            </span>
          )}
        </button>
      </header>

      {/* Main Product Stage */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 pt-6 md:pt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-start">
          {/* Left Column: Image Showcase */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-[#fbf9f6] rounded-2xl border border-[#ede7dc] overflow-hidden shadow-sm flex items-center justify-center p-4">
              <img
                src={
                  product.image ||
                  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80"
                }
                alt={product.title}
                className="w-full h-full object-cover rounded-xl transition-transform duration-700 hover:scale-105"
              />

              {/* Floating Certification Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                <span className="bg-white/95 backdrop-blur-md text-[#8c6b12] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded border border-[#ede7dc] shadow-sm flex items-center gap-1">
                  <FiAward className="text-xs" />
                  <span>{product.collectionTag || "Atelier Masterwork"}</span>
                </span>
                <span className="bg-white/95 backdrop-blur-md text-[#1a160d] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded border border-[#ede7dc] shadow-sm">
                  BIS 916 Certified
                </span>
              </div>
            </div>

            {/* Video Consultation Callout */}
            <div className="p-4 rounded-xl bg-[#fbf9f5] border border-[#ede7dc] flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#fdf8ed] border border-[#f0dfb3] flex items-center justify-center text-[#b8860b]">
                  <FiVideo className="text-lg" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1a160d] uppercase tracking-wider">
                    Virtual Salon Viewing
                  </h4>
                  <p className="text-[11px] text-[#78716c]">
                    Experience this piece live with our master gemologist.
                  </p>
                </div>
              </div>
              <a
                href={videoWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-lg border border-[#d4af37] text-[#8c6b12] hover:bg-[#faf5eb] text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 shadow-sm"
              >
                Book Call
              </a>
            </div>

            {/* Trust Badges Bar */}
            <div className="grid grid-cols-3 gap-2 text-center py-2">
              <div className="p-2.5 rounded-lg bg-[#fbf9f5] border border-[#ede7dc]">
                <FiShield className="text-[#b8860b] text-base mx-auto mb-1" />
                <span className="text-[10px] uppercase font-bold text-[#1a160d] block">Certified Dossier</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#fbf9f5] border border-[#ede7dc]">
                <FiTruck className="text-[#b8860b] text-base mx-auto mb-1" />
                <span className="text-[10px] uppercase font-bold text-[#1a160d] block">Armored Courier</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#fbf9f5] border border-[#ede7dc]">
                <FiLock className="text-[#b8860b] text-base mx-auto mb-1" />
                <span className="text-[10px] uppercase font-bold text-[#1a160d] block">Buyback Charter</span>
              </div>
            </div>
          </div>

          {/* Right Column: Gemological Specs & Purchase */}
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-semibold text-[#b8860b] uppercase tracking-[0.25em] block mb-2">
                Atelier Vijay &bull; 30-Year Heritage
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a160d] leading-tight mb-3">
                {product.title}
              </h1>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="font-serif text-2xl sm:text-3xl font-bold text-[#b8860b]">
                  {formatPrice(product.price)}
                </span>
                {product.oldPrice && (
                  <span className="text-sm text-[#a8a29e] line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase tracking-wider">
                  Insured Armored Delivery Included
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#5c5446] leading-relaxed font-light">
              {product.description ||
                "A rare masterpiece handcrafted by master Bengali goldsmiths, celebrating timeless royalty with certified diamonds and pure hallmarked gold."}
            </p>

            {/* Gemological Specification Dossier Grid */}
            {product.specs && (
              <div className="p-4 bg-[#fbf9f5] rounded-xl border border-[#ede7dc] space-y-2 shadow-sm">
                <h4 className="text-[11px] font-bold text-[#b8860b] uppercase tracking-[0.2em] border-b border-[#ede7dc] pb-2">
                  Gemological Dossier
                </h4>
                <div className="grid grid-cols-2 gap-2.5 text-xs pt-1">
                  <div>
                    <span className="text-[#78716c] block text-[10px] uppercase">Metal Purity</span>
                    <span className="text-[#1a160d] font-medium">{product.specs.metal}</span>
                  </div>
                  <div>
                    <span className="text-[#78716c] block text-[10px] uppercase">Main Gemstone</span>
                    <span className="text-[#1a160d] font-medium">{product.specs.gemstone}</span>
                  </div>
                  <div>
                    <span className="text-[#78716c] block text-[10px] uppercase">Diamond Clarity / Color</span>
                    <span className="text-[#1a160d] font-medium">{product.specs.clarity}</span>
                  </div>
                  <div>
                    <span className="text-[#78716c] block text-[10px] uppercase">Certification Bureau</span>
                    <span className="text-[#1a160d] font-medium">{product.specs.certificate}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Metal Preference Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#78716c] uppercase tracking-wider block">
                Selected Metal Setting: <span className="text-[#1a160d] font-bold">{selectedMetal}</span>
              </label>
              <div className="flex gap-2">
                {["18K Yellow Gold", "18K Rose Gold", "Platinum 950"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMetal(m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      selectedMetal === m
                        ? "border-[#b8860b] bg-[#fdf8ed] text-[#8c6b12] font-semibold"
                        : "border-[#ede7dc] bg-white text-[#78716c] hover:text-[#1a160d]"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Ring Sizing (If applicable) */}
            {isRing && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#78716c] uppercase tracking-wider">
                    Indian Standard Ring Size: <span className="text-[#1a160d] font-bold">{selectedSize}</span>
                  </span>
                  <a
                    href={productWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#b8860b] hover:underline text-[11px] font-medium"
                  >
                    Need Complimentary Sizer?
                  </a>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {["10", "12", "14", "16", "18", "20", "22"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={`w-9 h-9 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        selectedSize === s
                          ? "border-[#b8860b] bg-gradient-to-r from-[#d4af37] to-[#f6d172] text-[#1a160d] shadow-sm"
                          : "border-[#ede7dc] bg-white text-[#78716c] hover:text-[#1a160d]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Stepper */}
            <div className="flex items-center gap-4 py-2 border-y border-[#ede7dc]">
              <span className="text-xs font-semibold text-[#78716c] uppercase tracking-wider">
                Pieces:
              </span>
              <div className="flex items-center bg-white border border-[#d8cfbe] rounded-lg">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-3 py-1.5 text-[#78716c] hover:text-[#1a160d] transition-colors cursor-pointer"
                >
                  <FiMinus />
                </button>
                <span className="px-3 text-xs font-bold text-[#1a160d]">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(qty + 1)}
                  className="px-3 py-1.5 text-[#78716c] hover:text-[#1a160d] transition-colors cursor-pointer"
                >
                  <FiPlus />
                </button>
              </div>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden md:flex flex-col gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#d4af37] text-[#1a160d] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_18px_rgba(212,175,55,0.3)] hover:opacity-95 transition-all cursor-pointer"
              >
                {isAdded ? <FiCheck className="text-base" /> : <FiShoppingBag className="text-base" />}
                <span>{isAdded ? "Secured in Bag" : "Add to Bag"}</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="py-3.5 px-4 rounded-xl bg-[#1a160d] hover:bg-[#b8860b] text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <span>Instant Armored Checkout</span>
                  <FiArrowRight />
                </button>

                <a
                  href={productWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3.5 px-4 rounded-xl border border-[#25D366] text-[#128C7E] hover:bg-[#25D366]/10 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <FaWhatsapp className="text-base" />
                  <span>Concierge Inquiry</span>
                </a>
              </div>
            </div>

            {/* Accordions */}
            <div className="space-y-2 pt-2">
              {accordionItems.map((item, idx) => (
                <div
                  key={idx}
                  className="border border-[#ede7dc] rounded-xl overflow-hidden bg-white shadow-sm"
                >
                  <button
                    onClick={() => setActiveAccordion(activeAccordion === idx ? null : idx)}
                    className="w-full p-4 text-left flex justify-between items-center text-xs font-semibold text-[#1a160d] uppercase tracking-wider cursor-pointer"
                  >
                    <span>{item.title}</span>
                    <span className="text-[#b8860b] text-base font-bold">
                      {activeAccordion === idx ? "−" : "+"}
                    </span>
                  </button>
                  {activeAccordion === idx && (
                    <div className="p-4 pt-0 text-xs text-[#5c5446] leading-relaxed border-t border-[#ede7dc]">
                      {item.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Action Bar for Mobile Devices */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#ede7dc] p-3 px-4 flex items-center gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <a
          href={productWhatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp Inquiry"
          className="w-12 h-12 shrink-0 rounded-xl bg-white border border-[#ede7dc] text-[#25D366] flex items-center justify-center shadow-sm"
        >
          <FaWhatsapp className="text-xl" />
        </a>

        <button
          type="button"
          onClick={handleAddToCart}
          className="flex-1 h-12 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#d4af37] text-[#1a160d] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all cursor-pointer"
        >
          {isAdded ? <FiCheck className="text-base" /> : <FiShoppingBag className="text-base" />}
          <span>{isAdded ? "Secured in Bag" : "Add to Bag"}</span>
        </button>
      </div>
    </div>
  );
}
