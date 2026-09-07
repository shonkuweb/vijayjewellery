"use client";

import Link from "next/link";
import { useEffect, useState, useMemo, useRef } from "react";
import { useCart } from "./context/CartContext";
import { useSiteConfig } from "./context/ConfigContext";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBudget, setSelectedBudget] = useState("all");
  const [drawerCollectionOpen, setDrawerCollectionOpen] = useState(true);
  const [drawerCategoryOpen, setDrawerCategoryOpen] = useState(true);
  const [drawerBudgetOpen, setDrawerBudgetOpen] = useState(false);
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [addedProductId, setAddedProductId] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  // Budget range tiers for navigation and filtering
  const budgetRanges = [
    { id: "under-150k", name: "Under ₹1,50,000", min: 0, max: 150000 },
    { id: "150k-250k", name: "₹1,50,000 – ₹2,50,000", min: 150000, max: 250000 },
    { id: "250k-500k", name: "₹2,50,000 – ₹5,00,000", min: 250000, max: 500000 },
    { id: "above-500k", name: "Above ₹5,00,000", min: 500000, max: Infinity },
  ];

  const collectionRef = useRef(null);

  const scrollCollection = (direction) => {
    if (collectionRef.current) {
      const scrollDistance = collectionRef.current.clientWidth * 0.75;
      collectionRef.current.scrollBy({
        left: direction === "left" ? -scrollDistance : scrollDistance,
        behavior: "smooth",
      });
    }
  };

  const { addItem, items: cartItems, products, productsLoading, categories: dbCategories, setIsSidebarOpen } = useCart();
  const { config } = useSiteConfig();

  const brand = config?.brand || {};
  const hero = config?.hero || {};
  const contact = config?.contact || {};
  const craftsmanship = config?.craftsmanship || {};
  const footer = config?.footer || {};

  const totalCartCount = (cartItems || []).reduce((sum, item) => sum + (Number(item?.qty) || 1), 0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Handle newsletter subscription
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setEmailSubscribed(true);
      setEmailInput("");
      setTimeout(() => setEmailSubscribed(false), 7000);
    }
  };

  // Helper to format currency
  const formatPrice = (val) => {
    if (!val) return "₹0";
    const num = Number(String(val).replace(/[^0-9.-]+/g, ""));
    if (isNaN(num)) return val;
    return "₹" + num.toLocaleString("en-IN");
  };

  // Filter products by category, budget & search
  const filteredProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    return products.filter((p) => {
      let matchCat = false;
      const cat = String(selectedCategory).toLowerCase();

      if (cat === "all") {
        matchCat = true;
      } else {
        matchCat =
          String(p.categoryId).toLowerCase() === cat ||
          p.category?.slug?.toLowerCase() === cat ||
          p.category?.name?.toLowerCase() === cat ||
          p.categoryName?.toLowerCase() === cat ||
          p.slug?.toLowerCase().includes(cat);
      }

      // Budget filter matching
      let matchBudget = true;
      if (selectedBudget !== "all") {
        const rawPrice = Number(String(p.price).replace(/[^0-9.-]+/g, ""));
        const currentRange = budgetRanges.find((b) => b.id === selectedBudget);
        if (currentRange) {
          matchBudget = rawPrice >= currentRange.min && rawPrice <= currentRange.max;
        }
      }

      const matchSearch =
        !searchQuery.trim() ||
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.collectionTag?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCat && matchBudget && matchSearch;
    });
  }, [products, selectedCategory, selectedBudget, searchQuery]);

  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    const currency = brand.currency || "₹";
    addItem(product.slug || product.id, 1, null, {
      title: product.title,
      price: product.price?.startsWith("₹") ? product.price : `${currency}${product.price}`,
      image: product.image || "",
    });
    setAddedProductId(product.id || product.slug);
    setTimeout(() => setAddedProductId(null), 2000);
    setIsSidebarOpen(true);
  };

  const whatsappNum = (contact.whatsapp || "917319064254").replace(/[^0-9]/g, "");
  const generalWhatsappUrl = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(
    "Hello Vijay Jewellery Collection Concierge, I would like to schedule a private bridal / diamond consultation."
  )}`;

  const getProductWhatsappUrl = (product) => {
    const text = `Hello Vijay Jewellery Collection Concierge,\n\nI am inquiring about the "${product.title}" (${formatPrice(
      product.price
    )}).\n\nCould you please share the GIA/IGI certificate dossier, customization options, and viewing availability at your Kolkata atelier?`;
    return `https://wa.me/${whatsappNum}?text=${encodeURIComponent(text)}`;
  };

  // Categories dynamically loaded from database (0 by default if none added from admin)
  const collectionCategories = useMemo(() => {
    if (!dbCategories || !Array.isArray(dbCategories)) return [];
    return dbCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      image: cat.image || "",
      icon: cat.icon || "diamond",
    }));
  }, [dbCategories]);

  const categories = useMemo(() => {
    const list = [
      { id: "all", name: "The Collection", icon: "sparkles", count: (products || []).length },
    ];
    if (dbCategories && Array.isArray(dbCategories)) {
      dbCategories.forEach((cat) => {
        list.push({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon || "diamond",
          count: (products || []).filter((p) => p.categoryId === cat.id).length,
        });
      });
    }
    return list;
  }, [dbCategories, products]);

  // Customer Reviews matching user reference pill style
  const customerReviewsRow1 = [
    {
      id: "rev-1",
      name: "Aditi R. D.",
      avatar: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=200&q=80",
      rating: 5,
      comment: "Elegant and sophisticated design with quality.",
    },
    {
      id: "rev-2",
      name: "Pooja Mukherjee",
      avatar: "/categories/lahari.jpg",
      rating: 5,
      comment: "Breathtaking 22K gold craftsmanship. The velvet presentation box was stunning.",
    },
    {
      id: "rev-3",
      name: "Meera V. Kapoor",
      avatar: "/categories/earrings.jpg",
      rating: 5,
      comment: "Traditional jhumkas with authentic BIS 916 hallmarking. Unmatched finish.",
    },
    {
      id: "rev-4",
      name: "Ananya Singhania",
      avatar: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=200&q=80",
      rating: 5,
      comment: "Ordered our complete bridal necklace set. Outstanding concierge service.",
    },
  ];

  const customerReviewsRow2 = [
    {
      id: "rev-5",
      name: "Ashish B.",
      avatar: "https://images.unsplash.com/photo-1611591475883-999318991206?auto=format&fit=crop&w=200&q=80",
      rating: 5,
      comment: "Amazing product value and flawless finishing on the royal kada.",
    },
    {
      id: "rev-6",
      name: "Dr. Rajesh Sen",
      avatar: "/categories/rings.jpg",
      rating: 5,
      comment: "Anniversary solitaire ring was D-Flawless certified. Armored transit on time.",
    },
    {
      id: "rev-7",
      name: "Tanvi Deshmukh",
      avatar: "/categories/pendants.jpg",
      rating: 5,
      comment: "The peacock meenakari pendant is pure art. Got so many compliments!",
    },
    {
      id: "rev-8",
      name: "Vikramaditya S.",
      avatar: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=200&q=80",
      rating: 5,
      comment: "Atelier Vijay has been our family jeweler for two generations. Pure trust.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fdfbf9] text-[#1a160d] font-body selection:bg-[#f6d172]/50 selection:text-[#1a160d]">
      {/* Jewellery Khazana Inspired Warm Gold Announcement Marquee */}
      <div className="bg-[#f6d172] text-[#000000] border-b border-[#e2ba4f] py-2 px-4 overflow-hidden relative z-10">
        <div className="marquee-track flex items-center gap-12 whitespace-nowrap text-[11px] sm:text-xs font-semibold tracking-wider uppercase">
          <span className="inline-flex items-center gap-2">
            <span>📢</span>
            <span>Vijay Jewellery Collection Park Street Salon is Open</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span>📍</span>
            <span>Park Street &bull; Kolkata</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span>💛</span>
            <span>100% BIS 916 Hallmarked Gold &amp; Certified Solitaires</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span>🛡️</span>
            <span>Complimentary Insured Armored Courier Across India</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span>✨</span>
            <span>30 Years of Royal Goldsmithing &bull; Est. 1994</span>
          </span>
          {/* Duplicated track for continuous seamless scroll */}
          <span className="inline-flex items-center gap-2" aria-hidden="true">
            <span>📢</span>
            <span>Vijay Jewellery Collection Park Street Salon is Open</span>
          </span>
          <span className="inline-flex items-center gap-2" aria-hidden="true">
            <span>📍</span>
            <span>Park Street &bull; Kolkata</span>
          </span>
          <span className="inline-flex items-center gap-2" aria-hidden="true">
            <span>💛</span>
            <span>100% BIS 916 Hallmarked Gold &amp; Certified Solitaires</span>
          </span>
          <span className="inline-flex items-center gap-2" aria-hidden="true">
            <span>🛡️</span>
            <span>Complimentary Insured Armored Courier Across India</span>
          </span>
          <span className="inline-flex items-center gap-2" aria-hidden="true">
            <span>✨</span>
            <span>30 Years of Royal Goldsmithing &bull; Est. 1994</span>
          </span>
        </div>
      </div>

      {/* Top Luxury Navigation Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl border-b border-[#ede7dc] shadow-sm py-1"
            : "bg-white/90 backdrop-blur-md border-b border-[#ede7dc]/80 py-2"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16 md:h-18">
          {/* Mobile Menu Trigger */}
          <button
            aria-label="Open Atelier Menu"
            onClick={() => setMenuOpen(true)}
            className="text-[#1a160d] hover:text-[#b8860b] p-2 -ml-2 rounded-full cursor-pointer transition-transform active:scale-95 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
            <span className="hidden sm:inline text-[10px] uppercase tracking-widest font-semibold text-[#78716c]">
              Menu
            </span>
          </button>

          {/* Centered Brand Monogram & Crest */}
          <Link href="/" className="flex flex-col items-center text-center group">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-[#b8860b]">diamond</span>
              <span className="font-serif text-lg sm:text-xl md:text-2xl font-bold tracking-[0.22em] text-[#1a160d] uppercase transition-transform group-hover:scale-[1.01]">
                {brand.name || "VIJAY JEWELLERY COLLECTION"}
              </span>
            </div>
            <span className="text-[9px] md:text-[10px] tracking-[0.3em] text-[#78716c] uppercase -mt-0.5">
              Atelier Vijay &bull; Est. 1994 &bull; Kolkata
            </span>
          </Link>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1 -mr-2">
            {/* Search Trigger */}
            <button
              aria-label="Search Collection"
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-[#1a160d] hover:text-[#b8860b] p-2 rounded-full cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">
                {searchOpen ? "close" : "search"}
              </span>
            </button>

            {/* Staff / Admin Portal Link */}
            <Link
              href="/admin"
              aria-label="Staff Portal"
              title="Staff / Admin Portal"
              className="text-[#78716c] hover:text-[#b8860b] p-2 rounded-full transition-colors hidden sm:flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
            </Link>

            {/* Shopping Bag with Golden Counter */}
            <button
              aria-label="Shopping Bag"
              onClick={() => setIsSidebarOpen(true)}
              className="text-[#1a160d] hover:text-[#b8860b] p-2 rounded-full cursor-pointer transition-colors relative"
            >
              <span className="material-symbols-outlined text-[24px]">shopping_bag</span>
              {totalCartCount > 0 && (
                <span className="absolute top-1 right-1 bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#ffe088] text-[#1a160d] text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-sm">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Luxury Search Drawer */}
        {searchOpen && (
          <div className="px-4 pb-3 max-w-xl mx-auto animate-fadeIn">
            <div className="relative">
              <input
                type="text"
                placeholder="Search solitaires, syndicate polki, certified emeralds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-[#fbf9f5] border border-[#ede7dc] text-[#1a160d] placeholder-[#8c8273] text-sm rounded-full py-2.5 pl-10 pr-10 focus:outline-none focus:border-[#b8860b] focus:ring-1 focus:ring-[#b8860b] shadow-inner"
              />
              <span className="material-symbols-outlined text-[20px] text-[#78716c] absolute left-3.5 top-3">
                search
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-2.5 text-[#78716c] hover:text-[#1a160d]"
                >
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Page Body */}
      <main>
        {/* Flagship Hero Banner Section (Clean Image Banner) */}
        <section className="relative w-full overflow-hidden bg-[#fdfbf9]">
          <a
            href="#catalog-section"
            className="block w-full relative aspect-square sm:aspect-[21/7] md:aspect-[3/1] max-h-[540px] bg-[#f7f2ea] overflow-hidden cursor-pointer"
          >
            <picture className="w-full h-full block">
              {/* Mobile Banner (Square 1:1 Aspect Ratio) */}
              <source
                media="(max-width: 639px)"
                srcSet={hero.mobileBannerImage || "https://pub-ce8688bc6c654bcfb99716f7c9373bcd.r2.dev/vj-jewellery/hero-banner-mobile-1788783667118.jpg"}
              />
              {/* Desktop / Tablet Banner (Wide 3:1 Aspect Ratio) */}
              <source
                media="(min-width: 640px)"
                srcSet={hero.bannerImage || hero.backgroundImage || "https://pub-ce8688bc6c654bcfb99716f7c9373bcd.r2.dev/vj-jewellery/hero-banner-1788783087695.png"}
              />
              <img
                src={hero.bannerImage || hero.backgroundImage || "https://pub-ce8688bc6c654bcfb99716f7c9373bcd.r2.dev/vj-jewellery/hero-banner-1788783087695.png"}
                alt={brand.name || "Vijay Jewellery Collection Banner"}
                className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-[1.01]"
                loading="eager"
              />
            </picture>
          </a>
        </section>

        {/* OUR COLLECTION - Mobile-First Interactive Horizontal Slider */}
        {collectionCategories.length > 0 && (
          <section id="collections-section" className="pt-4 pb-10 md:pt-6 md:pb-14 px-4 md:px-8 max-w-7xl mx-auto">
            {/* Centered Header matching user reference */}
            <div className="text-center max-w-xl mx-auto mb-6 md:mb-8">
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-widest text-[#1a160d] uppercase">
                OUR COLLECTION
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-[#78716c] font-normal tracking-wide mt-1.5">
                Where Every Piece Tells a Story
              </p>
            </div>

            {/* Carousel Slider with Floating Circular Arrow Buttons */}
            <div className="relative px-1 sm:px-4">
              {/* Left Circular Navigation Arrow */}
              <button
                type="button"
                onClick={() => scrollCollection("left")}
                aria-label="Previous Category"
                className="absolute left-0 sm:left-1 md:left-2 top-[38%] -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white text-[#1a160d] shadow-[0_4px_16px_rgba(0,0,0,0.18)] flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer border border-[#ede7dc] focus:outline-none"
              >
                <span className="material-symbols-outlined text-lg sm:text-2xl font-bold select-none">
                  chevron_left
                </span>
              </button>

              {/* Right Circular Navigation Arrow */}
              <button
                type="button"
                onClick={() => scrollCollection("right")}
                aria-label="Next Category"
                className="absolute right-0 sm:right-1 md:right-2 top-[38%] -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white text-[#1a160d] shadow-[0_4px_16px_rgba(0,0,0,0.18)] flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer border border-[#ede7dc] focus:outline-none"
              >
                <span className="material-symbols-outlined text-lg sm:text-2xl font-bold select-none">
                  chevron_right
                </span>
              </button>

              {/* Horizontal Scroll Track (Mobile Swipe & Snap) */}
              <div
                ref={collectionRef}
                className="flex items-start gap-4 sm:gap-6 md:gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar px-3 sm:px-6 py-2"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {collectionCategories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(isSelected ? "all" : cat.id);
                        const el = document.getElementById("catalog-section");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="flex flex-col items-center shrink-0 snap-center w-[135px] sm:w-[175px] md:w-[215px] lg:w-[250px] cursor-pointer group select-none"
                    >
                      {/* Rounded Image Card matching reference */}
                      <div
                        className={`relative w-full aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-white border-2 transition-all duration-300 shadow-sm ${
                          isSelected
                            ? "border-[#d4af37] ring-4 ring-[#d4af37]/25 shadow-[0_6px_20px_rgba(212,175,55,0.25)] scale-[1.02]"
                            : "border-[#ede7dc] group-hover:border-[#d4af37]/70 group-hover:shadow-md"
                        }`}
                      >
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                          loading="lazy"
                        />
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-gradient-to-r from-[#d4af37] to-[#f6d172] text-[#1a160d] w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shadow-md">
                            <span className="material-symbols-outlined text-[13px] sm:text-[15px] font-bold">check</span>
                          </div>
                        )}
                      </div>

                      {/* Centered Category Title Below Card */}
                      <p
                        className={`mt-2.5 sm:mt-3.5 text-center text-xs sm:text-sm md:text-base transition-colors ${
                          isSelected
                            ? "text-[#8c6b12] font-bold tracking-wide"
                            : "text-[#1a160d] font-medium group-hover:text-[#b8860b]"
                        }`}
                      >
                        {cat.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Flagship Catalog Grid - Our Best Sellers */}
        <section id="catalog-section" className="pt-6 pb-16 md:pt-10 md:pb-24 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b border-[#ede7dc] pb-4">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-wider text-[#1a160d] uppercase">
                {selectedCategory !== "all"
                  ? `OUR BEST SELLERS — ${String(selectedCategory).toUpperCase()}`
                  : selectedBudget !== "all"
                  ? `OUR BEST SELLERS — ${budgetRanges.find((b) => b.id === selectedBudget)?.name.toUpperCase() || "BY BUDGET"}`
                  : "OUR BEST SELLERS"}
              </h2>
              <p className="text-xs sm:text-sm text-[#78716c] mt-1 font-normal">
                Most Coveted Heirlooms &amp; Time-Honored Masterpieces
              </p>
            </div>
            {(selectedCategory !== "all" || selectedBudget !== "all" || searchQuery) && (
              <div className="flex flex-wrap items-center gap-2">
                {selectedCategory !== "all" && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("all")}
                    className="px-3 py-1.5 rounded-full bg-[#f6d172]/30 border border-[#b8860b]/40 text-[#8c6b12] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#f6d172]/50 transition-colors cursor-pointer"
                  >
                    <span>Category: {selectedCategory}</span>
                    <span className="material-symbols-outlined text-[13px]">close</span>
                  </button>
                )}
                {selectedBudget !== "all" && (
                  <button
                    type="button"
                    onClick={() => setSelectedBudget("all")}
                    className="px-3 py-1.5 rounded-full bg-[#f6d172]/30 border border-[#b8860b]/40 text-[#8c6b12] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#f6d172]/50 transition-colors cursor-pointer"
                  >
                    <span>Budget: {budgetRanges.find((b) => b.id === selectedBudget)?.name}</span>
                    <span className="material-symbols-outlined text-[13px]">close</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedBudget("all");
                    setSearchQuery("");
                  }}
                  className="px-3 py-1.5 rounded-full bg-[#ede7dc] text-[#5c5446] text-xs font-semibold hover:bg-[#e2d9cb] transition-colors cursor-pointer"
                >
                  Reset All
                </button>
              </div>
            )}
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-[#f8f5ee] rounded-xl h-80 border border-[#ede7dc]" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            products.length === 0 ? (
              <div className="text-center py-20 bg-[#fbf9f5] rounded-2xl border border-[#ede7dc] p-8 max-w-lg mx-auto">
                <span className="material-symbols-outlined text-5xl text-[#d4af37] mb-3 inline-block">diamond</span>
                <h3 className="font-serif text-xl font-bold text-[#1a160d] mb-2">The Collection Under Curation</h3>
                <p className="text-sm text-[#78716c] mb-6 leading-relaxed">
                  There are currently no pieces in the catalog. Pieces added from the staff admin portal will immediately be showcased here.
                </p>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#d4af37] to-[#f6d172] text-[#1a160d] font-bold text-xs uppercase tracking-wider shadow-sm hover:brightness-105"
                >
                  <span className="material-symbols-outlined text-base">tune</span> Open Staff Portal
                </Link>
              </div>
            ) : (
              <div className="text-center py-20 bg-[#fbf9f5] rounded-2xl border border-[#ede7dc] p-8">
                <span className="material-symbols-outlined text-5xl text-[#b8860b] mb-3">search_off</span>
                <h3 className="font-serif text-xl font-bold text-[#1a160d] mb-2">No Pieces Found</h3>
                <p className="text-sm text-[#78716c] mb-6">
                  We couldn&apos;t find any pieces matching your current criteria.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedBudget("all");
                    setSearchQuery("");
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#1a160d] text-white hover:bg-[#b8860b] font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {filteredProducts.map((product) => {
                const isJustAdded = addedProductId === (product.id || product.slug);
                return (
                  <div
                    key={product.id || product.slug}
                    className="group flex flex-col bg-white rounded-xl overflow-hidden border border-[#ede7dc] hover:border-[#d4af37] transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_25px_rgba(212,175,55,0.15)]"
                  >
                    {/* Image Area with Link */}
                    <div className="relative aspect-[4/4] sm:aspect-[4/4.5] overflow-hidden bg-[#fbf9f6]">
                      <Link
                        href={`/product/${product.slug || product.id}`}
                        className="block w-full h-full"
                      >
                        <img
                          src={
                            product.image ||
                            "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80"
                          }
                          alt={product.title}
                          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      </Link>

                      {/* Collection & Purity Tag */}
                      <span className="absolute top-2 left-2 pointer-events-none text-[9px] font-bold uppercase tracking-wider bg-white/95 backdrop-blur-md text-[#8c6b12] px-2 py-0.5 rounded border border-[#ede7dc] shadow-sm">
                        {product.collectionTag || "BIS Certified"}
                      </span>

                      {/* 1-Click WhatsApp Inquiry Floating Icon */}
                      <a
                        href={getProductWhatsappUrl(product)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Inquire via WhatsApp"
                        className="absolute bottom-2 right-2 z-10 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md border border-[#ede7dc] text-[#25D366] hover:text-[#128C7E] flex items-center justify-center shadow-md transition-all active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[16px]">chat</span>
                      </a>
                    </div>

                    {/* Product Metadata & Specifications */}
                    <div className="p-3 md:p-4 flex flex-col flex-grow justify-between">
                      <div>
                        {/* Gemological Specs Summary Badge */}
                        {product.specs?.gemstone && (
                          <span className="text-[10px] text-[#78716c] block truncate mb-1">
                            {product.specs.gemstone}
                          </span>
                        )}

                        <Link href={`/product/${product.slug || product.id}`}>
                          <h3 className="font-serif text-sm md:text-base font-semibold text-[#1a160d] group-hover:text-[#b8860b] transition-colors line-clamp-2 mb-1.5 leading-snug">
                            {product.title}
                          </h3>
                        </Link>
                      </div>

                      {/* Pricing & Add to Cart */}
                      <div className="pt-2 border-t border-[#ede7dc] mt-2">
                        <div className="flex items-baseline gap-2 mb-2.5 flex-wrap">
                          <span className="font-serif font-bold text-sm md:text-base text-[#b8860b]">
                            {formatPrice(product.price)}
                          </span>
                          {product.oldPrice && (
                            <span className="text-[11px] text-[#a8a29e] line-through">
                              {formatPrice(product.oldPrice)}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          className={`w-full py-2 px-3 rounded-lg text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
                            isJustAdded
                              ? "bg-emerald-600 text-white"
                              : "bg-gradient-to-r from-[#d4af37] to-[#f6d172] text-[#1a160d] hover:from-[#c59e2b] hover:to-[#e8be48] border border-[#d4af37]/30 shadow-sm"
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {isJustAdded ? "check" : "shopping_bag"}
                          </span>
                          <span>{isJustAdded ? "Added to Bag" : "Add to Bag"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Master Karigar Heritage & 30-Year Goldsmithing Chronicle */}
        <section id="about-section" className="py-20 md:py-28 bg-[#f7f2ea] border-y border-[#ede7dc] px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <span className="material-symbols-outlined text-4xl text-[#b8860b] mb-3">
              workspace_premium
            </span>
            <p className="text-xs font-semibold tracking-[0.25em] text-[#8c6b12] uppercase mb-3">
              {craftsmanship.badge || "Three Decades of Living Heritage"}
            </p>
            <h2 className="font-serif text-2xl md:text-4xl lg:text-5xl font-bold text-[#1a160d] mb-6">
              {craftsmanship.title || "The Soul of Bengali Goldsmithing"}
            </h2>
            <blockquote className="font-serif italic text-base md:text-xl text-[#4a4336] leading-relaxed mb-12 max-w-3xl mx-auto font-light">
              &ldquo;{craftsmanship.quote ||
                "True luxury is not manufactured; it is sculpted with reverence. For thirty years, our atelier karigars have preserved ancestral goldsmithing secrets—uniting unyielding diamond brilliance with timeless hallmarked gold."}&rdquo;
            </blockquote>

            {/* 4 Pillars of Craftsmanship */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 pt-8 border-t border-[#ede7dc]">
              <div className="p-4 bg-white rounded-xl border border-[#ede7dc] shadow-sm">
                <span className="material-symbols-outlined text-2xl text-[#b8860b] mb-2">history</span>
                <h4 className="text-xs font-bold text-[#1a160d] uppercase tracking-wider mb-1">
                  Est. 1994
                </h4>
                <p className="text-[11px] text-[#78716c]">30 Years of Unbroken Trust</p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-[#ede7dc] shadow-sm">
                <span className="material-symbols-outlined text-2xl text-[#b8860b] mb-2">verified</span>
                <h4 className="text-xs font-bold text-[#1a160d] uppercase tracking-wider mb-1">
                  100% Certified
                </h4>
                <p className="text-[11px] text-[#78716c]">IGI / GIA Laboratory Dossiers</p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-[#ede7dc] shadow-sm">
                <span className="material-symbols-outlined text-2xl text-[#b8860b] mb-2">handyman</span>
                <h4 className="text-xs font-bold text-[#1a160d] uppercase tracking-wider mb-1">
                  Master Karigars
                </h4>
                <p className="text-[11px] text-[#78716c]">Hand-sculpted in Kolkata</p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-[#ede7dc] shadow-sm">
                <span className="material-symbols-outlined text-2xl text-[#b8860b] mb-2">lock</span>
                <h4 className="text-xs font-bold text-[#1a160d] uppercase tracking-wider mb-1">
                  Armored Transit
                </h4>
                <p className="text-[11px] text-[#78716c]">Fully Insured Across India</p>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Reviews Section matching user reference screenshot */}
        <section className="py-16 md:py-24 overflow-hidden bg-[#fdfbf9] border-t border-[#ede7dc]/60">
          <div className="max-w-7xl mx-auto px-4 md:px-8 mb-8 md:mb-12 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a160d] tracking-tight">
              Our customers love us
            </h2>
            <p className="text-xs sm:text-sm md:text-base font-semibold text-[#4a4336] mt-2">
              4.8 star Based on All Customer Reviews
            </p>
          </div>

          {/* Dual Marquee Ticker of Review Pills */}
          <div className="space-y-4 sm:space-y-5">
            {/* Row 1 - Marquee Left */}
            <div className="relative w-full overflow-hidden">
              <div className="review-marquee-track flex gap-4 sm:gap-6 py-1">
                {[...customerReviewsRow1, ...customerReviewsRow1].map((rev, idx) => (
                  <div
                    key={`r1-${idx}`}
                    className="flex items-center gap-3 sm:gap-4 bg-white rounded-full p-2 sm:p-2.5 pr-6 sm:pr-8 border border-[#ede7dc] shadow-[0_4px_16px_rgba(0,0,0,0.05)] hover:shadow-md transition-all hover:scale-[1.02] shrink-0 max-w-[340px] sm:max-w-md select-none"
                  >
                    <img
                      src={rev.avatar}
                      alt={rev.name}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover shrink-0 border border-[#ede7dc]"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-xs sm:text-sm text-[#1a160d] truncate">
                          {rev.name}
                        </span>
                        <div className="flex text-[#f59e0b] text-[12px] sm:text-sm tracking-tighter shrink-0" aria-label="5 stars">
                          ★ ★ ★ ★ ★
                        </div>
                      </div>
                      <p className="text-[11px] sm:text-xs text-[#5c5446] leading-snug line-clamp-1 sm:line-clamp-2">
                        {rev.comment}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 2 - Marquee Right (Staggered Offset) */}
            <div className="relative w-full overflow-hidden">
              <div className="review-marquee-track-reverse flex gap-4 sm:gap-6 py-1">
                {[...customerReviewsRow2, ...customerReviewsRow2].map((rev, idx) => (
                  <div
                    key={`r2-${idx}`}
                    className="flex items-center gap-3 sm:gap-4 bg-white rounded-full p-2 sm:p-2.5 pr-6 sm:pr-8 border border-[#ede7dc] shadow-[0_4px_16px_rgba(0,0,0,0.05)] hover:shadow-md transition-all hover:scale-[1.02] shrink-0 max-w-[340px] sm:max-w-md select-none"
                  >
                    <img
                      src={rev.avatar}
                      alt={rev.name}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover shrink-0 border border-[#ede7dc]"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-xs sm:text-sm text-[#1a160d] truncate">
                          {rev.name}
                        </span>
                        <div className="flex text-[#f59e0b] text-[12px] sm:text-sm tracking-tighter shrink-0" aria-label="5 stars">
                          ★ ★ ★ ★ ★
                        </div>
                      </div>
                      <p className="text-[11px] sm:text-xs text-[#5c5446] leading-snug line-clamp-1 sm:line-clamp-2">
                        {rev.comment}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Private Salon Invitation & VIP Register */}
        <section className="py-20 px-4 md:px-8 bg-gradient-to-b from-[#faf6ee] to-[#f2ebd9] border-t border-[#ede7dc]">
          <div className="max-w-xl mx-auto text-center">
            <p className="text-[10px] font-semibold tracking-[0.25em] text-[#8c6b12] uppercase mb-2">
              By Private Invitation
            </p>
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-[#1a160d] mb-3">
              Join the Collector&apos;s Salon
            </h3>
            <p className="text-xs md:text-sm text-[#5c5446] mb-6 leading-relaxed">
              Gain confidential previews of newly acquired investment solitaires, antique polki acquisitions, and priority bridal appointments at our Park Street salon.
            </p>

            {emailSubscribed ? (
              <div className="p-4 rounded-xl bg-white border border-[#b8860b] text-[#8c6b12] text-xs font-medium flex items-center justify-center gap-2 shadow-sm">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>Thank you. You have been entered into our private salon register.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="email"
                  required
                  placeholder="Enter your confidential email..."
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="flex-grow bg-white border border-[#d8cfbe] text-[#1a160d] placeholder-[#8c8273] text-xs rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#b8860b] shadow-sm"
                />
                <button
                  type="submit"
                  className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#d4af37] text-[#1a160d] text-xs font-bold uppercase tracking-wider hover:opacity-95 transition-opacity shadow-sm"
                >
                  Register
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* Haute Joaillerie Luxury Footer */}
      <footer id="contact-section" className="bg-[#f4efe6] border-t border-[#ede7dc] text-[#5c5446] text-xs pt-14 pb-24 md:pb-14 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <h4 className="font-serif text-lg font-bold text-[#1a160d] tracking-wider uppercase mb-2">
              {brand.name || "VIJAY JEWELLERY COLLECTION"}
            </h4>
            <p className="text-xs text-[#665e52] max-w-md leading-relaxed mb-4">
              {footer.aboutText ||
                "Custodians of royal Indian jewelry art since 1994. Every gemstone is ethically sourced, certified by premier gemological institutes, and set by master goldsmiths in our Kolkata atelier."}
            </p>
            <div className="space-y-1 text-xs text-[#5c5446]">
              <p>📍 Park Street Atelier: {contact.address || "Kolkata, West Bengal, India"}</p>
              <p>📞 Concierge Desk: {contact.phone || "+91 73190 64254"}</p>
              <p>✉️ Direct: {contact.email || "concierge@vijayjewellery.com"}</p>
            </div>
          </div>

          {/* Collections Links */}
          <div>
            <h5 className="text-xs font-semibold text-[#1a160d] uppercase tracking-wider mb-3">
              The Collection
            </h5>
            <ul className="space-y-2">
              {categories.slice(1).length > 0 ? (
                categories.slice(1).map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => {
                        setSelectedCategory(c.id);
                        const el = document.getElementById("catalog-section");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="hover:text-[#b8860b] transition-colors"
                    >
                      {c.name}
                    </button>
                  </li>
                ))
              ) : (
                <li className="text-[11px] text-[#78716c] italic">No categories added</li>
              )}
            </ul>
          </div>

          {/* Client Privileges */}
          <div>
            <h5 className="text-xs font-semibold text-[#1a160d] uppercase tracking-wider mb-3">
              Client Privileges
            </h5>
            <ul className="space-y-2">
              <li>
                <a href={generalWhatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#b8860b] transition-colors">
                  VIP WhatsApp Concierge
                </a>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-[#b8860b] transition-colors">
                  Armored Delivery Checkout
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#b8860b] transition-colors">
                  Staff Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-[#e2d9cb] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>&copy; {new Date().getFullYear()} {brand.name || "VIJAY JEWELLERY COLLECTION"}. {footer.copyright || "ALL RIGHTS RESERVED."}</p>
          <p className="text-[#78716c]">Three Decades of Living Heritage &bull; Est. 1994</p>
        </div>
      </footer>

      {/* Slide-over Mobile Navigation Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Menu */}
          <div className="relative w-5/6 max-w-sm bg-white border-r border-[#ede7dc] p-6 flex flex-col justify-start h-full z-10 overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#ede7dc] mb-5">
              <div>
                <h3 className="font-serif text-base font-bold text-[#1a160d] tracking-wider uppercase">
                  {brand.name || "VIJAY JEWELLERY"}
                </h3>
                <span className="text-[10px] text-[#78716c] tracking-widest uppercase">
                  Est. {brand.established || "1994"} &bull; Haute Joaillerie
                </span>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="p-1.5 rounded-full text-[#78716c] hover:text-[#1a160d] hover:bg-[#f7f2ea] transition-colors"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {/* Navigation Links - Strictly 4 Options Requested */}
            <nav className="space-y-4">
              {/* 1. Our Collection (Expandable with Submenus) */}
              <div className="border-b border-[#ede7dc]/80 pb-3">
                <button
                  type="button"
                  onClick={() => setDrawerCollectionOpen(!drawerCollectionOpen)}
                  className="w-full text-left font-serif text-base sm:text-lg font-semibold text-[#1a160d] hover:text-[#b8860b] flex items-center justify-between py-1.5 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-[#b8860b]">diamond</span>
                    <span>1. Our Collection</span>
                  </span>
                  <span
                    className="material-symbols-outlined text-base text-[#78716c] transition-transform duration-200"
                    style={{ transform: drawerCollectionOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  >
                    expand_more
                  </span>
                </button>

                {drawerCollectionOpen && (
                  <div className="mt-2.5 pl-3 space-y-3.5 border-l-2 border-[#d4af37]/35 ml-2.5">
                    {/* 1.1 Shop by Category */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setDrawerCategoryOpen(!drawerCategoryOpen)}
                        className="w-full text-left text-xs sm:text-sm font-semibold text-[#1a160d] hover:text-[#b8860b] flex items-center justify-between py-1 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm text-[#8c6b12]">category</span>
                          <span>Shop by Category</span>
                        </span>
                        <span className="material-symbols-outlined text-sm text-[#78716c]">
                          {drawerCategoryOpen ? "expand_less" : "expand_more"}
                        </span>
                      </button>

                      {drawerCategoryOpen && (
                        <div className="mt-1.5 pl-3 space-y-1">
                          {collectionCategories.length > 0 ? (
                            collectionCategories.map((cat) => {
                              const isActive = selectedCategory === cat.id;
                              return (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCategory(cat.id);
                                    setSelectedBudget("all");
                                    setMenuOpen(false);
                                    const el = document.getElementById("catalog-section");
                                    if (el) el.scrollIntoView({ behavior: "smooth" });
                                  }}
                                  className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                                    isActive
                                      ? "bg-[#f6d172]/30 text-[#8c6b12] font-bold"
                                      : "text-[#5c5446] hover:bg-[#faf6f0] hover:text-[#1a160d]"
                                  }`}
                                >
                                  <span>{cat.name}</span>
                                  {isActive && (
                                    <span className="material-symbols-outlined text-xs text-[#8c6b12]">check</span>
                                  )}
                                </button>
                              );
                            })
                          ) : (
                            <p className="text-xs text-[#78716c] italic py-1 pl-2">No categories added</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 1.2 Shop by Budget */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setDrawerBudgetOpen(!drawerBudgetOpen)}
                        className="w-full text-left text-xs sm:text-sm font-semibold text-[#1a160d] hover:text-[#b8860b] flex items-center justify-between py-1 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm text-[#8c6b12]">payments</span>
                          <span>Shop by Budget</span>
                        </span>
                        <span className="material-symbols-outlined text-sm text-[#78716c]">
                          {drawerBudgetOpen ? "expand_less" : "expand_more"}
                        </span>
                      </button>

                      {drawerBudgetOpen && (
                        <div className="mt-1.5 pl-3 space-y-1">
                          {budgetRanges.map((b) => {
                            const isActive = selectedBudget === b.id;
                            return (
                              <button
                                key={b.id}
                                type="button"
                                onClick={() => {
                                  setSelectedBudget(b.id);
                                  setSelectedCategory("all");
                                  setMenuOpen(false);
                                  const el = document.getElementById("catalog-section");
                                  if (el) el.scrollIntoView({ behavior: "smooth" });
                                }}
                                className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                                  isActive
                                    ? "bg-[#f6d172]/30 text-[#8c6b12] font-bold"
                                    : "text-[#5c5446] hover:bg-[#faf6f0] hover:text-[#1a160d]"
                                }`}
                              >
                                <span>{b.name}</span>
                                {isActive && (
                                  <span className="material-symbols-outlined text-xs text-[#8c6b12]">check</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. All Products */}
              <div className="border-b border-[#ede7dc]/80 pb-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedBudget("all");
                    setSearchQuery("");
                    setMenuOpen(false);
                    const el = document.getElementById("catalog-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full text-left font-serif text-base sm:text-lg font-semibold text-[#1a160d] hover:text-[#b8860b] flex items-center justify-between py-1.5 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-[#b8860b]">auto_awesome</span>
                    <span>2. All Products</span>
                  </span>
                  <span className="material-symbols-outlined text-sm text-[#78716c]">arrow_forward</span>
                </button>
              </div>

              {/* 3. About Us */}
              <div className="border-b border-[#ede7dc]/80 pb-3">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    const el = document.getElementById("about-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full text-left font-serif text-base sm:text-lg font-semibold text-[#1a160d] hover:text-[#b8860b] flex items-center justify-between py-1.5 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-[#b8860b]">history_edu</span>
                    <span>3. About Us</span>
                  </span>
                  <span className="material-symbols-outlined text-sm text-[#78716c]">arrow_forward</span>
                </button>
              </div>

              {/* 4. Contact Us */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    const el = document.getElementById("contact-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full text-left font-serif text-base sm:text-lg font-semibold text-[#1a160d] hover:text-[#b8860b] flex items-center justify-between py-1.5 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-[#b8860b]">support_agent</span>
                    <span>4. Contact Us</span>
                  </span>
                  <span className="material-symbols-outlined text-sm text-[#78716c]">arrow_forward</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
