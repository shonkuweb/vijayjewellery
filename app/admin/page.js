"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  FiGrid,
  FiShoppingBag,
  FiPackage,
  FiTag,
  FiSliders,
  FiSearch,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiLock,
  FiLogOut,
  FiClock,
  FiX,
  FiEye,
  FiEyeOff,
  FiExternalLink,
  FiRefreshCw,
  FiAlertCircle,
  FiSave,
  FiArrowLeft,
  FiCheck,
  FiPhone,
  FiMapPin
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import imageCompression from "browser-image-compression";
import { useSiteConfig } from "../context/ConfigContext";

const STATUS_CONFIG = {
  Pending: {
    bg: "bg-[#2e1e08]",
    text: "text-amber-400",
    border: "border-amber-500/40",
    dot: "bg-amber-400",
  },
  Processing: {
    bg: "bg-[#0c1f42]",
    text: "text-blue-400",
    border: "border-blue-500/40",
    dot: "bg-blue-400",
  },
  Shipped: {
    bg: "bg-[#250e3d]",
    text: "text-purple-400",
    border: "border-purple-500/40",
    dot: "bg-purple-400",
  },
  Delivered: {
    bg: "bg-[#08281a]",
    text: "text-emerald-400",
    border: "border-emerald-500/40",
    dot: "bg-emerald-400",
  },
  Cancelled: {
    bg: "bg-[#330d17]",
    text: "text-rose-400",
    border: "border-rose-500/40",
    dot: "bg-rose-400",
  },
};

const THEME_PRESETS = [
  { id: "gold", name: "Imperial Gold", primary: "#d4af37", container: "#f2ca50", colorHex: "#d4af37" },
  { id: "emerald", name: "Emerald Forest", primary: "#1b5e20", container: "#388e3c", colorHex: "#1b5e20" },
  { id: "navy", name: "Royal Sapphire", primary: "#0d47a1", container: "#1976d2", colorHex: "#0d47a1" },
  { id: "ruby", name: "Ruby Velvet", primary: "#880e4f", container: "#ad1457", colorHex: "#880e4f" },
  { id: "onyx", name: "Midnight Onyx", primary: "#212121", container: "#424242", colorHex: "#424242" },
];

export default function AdminPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active view: "dashboard" | "orders" | "products" | "categories" | "settings"
  const [activeTab, setActiveTab] = useState("dashboard");

  // Global Config Hook
  const { config, updateConfig, refreshConfig } = useSiteConfig();
  const [configForm, setConfigForm] = useState(config);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Data state
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Product Form state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formOldPrice, setFormOldPrice] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImage, setFormImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");

  // Order Details Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  // Category Form state
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [newCatImage, setNewCatImage] = useState("");
  const [newCatImageFile, setNewCatImageFile] = useState(null);
  const [newCatImagePreview, setNewCatImagePreview] = useState("");
  const [isAddingCat, setIsAddingCat] = useState(false);

  // Password reset state
  const [showResetModal, setShowResetModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = sessionStorage.getItem("admin_token");
      if (token) {
        setIsAuthenticated(true);
        fetchData();
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (config) {
      setConfigForm(config);
    }
  }, [config]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes, ordRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories"),
        fetch("/api/orders"),
      ]);

      const [prodData, catData, ordData] = await Promise.all([
        prodRes.json(),
        catRes.json(),
        ordRes.json(),
      ]);

      setProducts(Array.isArray(prodData) ? prodData : []);
      setCategories(Array.isArray(catData) ? catData : []);
      setOrders(Array.isArray(ordData) ? ordData : []);
      refreshConfig();
    } catch (err) {
      console.error("Error loading admin data:", err);
      showToast("Error loading data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginPassword) return;
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: loginPassword }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Invalid password");
      }

      sessionStorage.setItem("admin_token", data.token);
      setIsAuthenticated(true);
      setLoginPassword("");
      fetchData();
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_token");
    setIsAuthenticated(false);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setIsResetting(true);
    setResetError("");
    setResetSuccess("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Password update failed");
      }

      setResetSuccess("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      showToast("Password updated successfully");
      setTimeout(() => {
        setShowResetModal(false);
        setResetSuccess("");
      }, 1000);
    } catch (err) {
      setResetError(err.message);
    } finally {
      setIsResetting(false);
    }
  };

  // -------------------- STORE CONFIG ACTIONS --------------------
  const handleSaveStoreConfig = async (e) => {
    e.preventDefault();
    setIsSavingConfig(true);

    try {
      const result = await updateConfig(configForm);
      if (result.success) {
        showToast("Store settings saved");
      } else {
        showToast(result.error || "Failed to save settings", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error saving settings", "error");
    } finally {
      setIsSavingConfig(false);
    }
  };

  const applyPresetColor = (preset) => {
    setConfigForm((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        primaryColor: preset.primary,
        primaryContainer: preset.container,
        preset: preset.id,
      },
    }));
  };

  // -------------------- PRODUCTS ACTIONS --------------------
  const openNewProductModal = () => {
    setEditingProductId(null);
    setFormTitle("");
    setFormSlug("");
    setFormPrice("");
    setFormOldPrice("");
    setFormCategoryId(categories[0]?.id ? String(categories[0].id) : "");
    setFormDescription("");
    setFormImage("");
    setImageFile(null);
    setImagePreview("");
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product) => {
    setEditingProductId(product.id || product.slug);
    setFormTitle(product.title || "");
    setFormSlug(product.slug || "");
    setFormPrice(product.price || "");
    setFormOldPrice(product.oldPrice || "");
    setFormCategoryId(product.categoryId ? String(product.categoryId) : "");
    setFormDescription(product.description || "");
    setFormImage(product.image || "");
    setImageFile(null);
    setImagePreview(product.image || "");
    setIsProductModalOpen(true);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formTitle || !formPrice) {
      showToast("Title and price are required", "error");
      return;
    }

    setIsSavingProduct(true);

    try {
      let finalImageUrl = formImage;

      if (imageFile) {
        const options = {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1400,
          useWebWorker: true,
        };
        const compressed = await imageCompression(imageFile, options);

        const formData = new FormData();
        formData.append("file", new File([compressed], imageFile.name, { type: compressed.type }));

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();

        if (uploadRes.ok && uploadData.url) {
          finalImageUrl = uploadData.url;
        } else {
          throw new Error(uploadData.error || "Failed to upload image to Cloudflare R2");
        }
      }

      const generatedSlug = formSlug.trim()
        ? formSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")
        : formTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");

      const productPayload = {
        title: formTitle.trim(),
        slug: generatedSlug,
        price: formPrice.trim(),
        oldPrice: formOldPrice.trim() || null,
        categoryId: formCategoryId ? parseInt(formCategoryId) : null,
        description: formDescription.trim(),
        image: finalImageUrl,
      };

      if (editingProductId) {
        productPayload.id = editingProductId;
        const res = await fetch("/api/products", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productPayload),
        });
        if (!res.ok) throw new Error("Failed to update product");
        showToast("Piece updated");
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productPayload),
        });
        if (!res.ok) throw new Error("Failed to add product");
        showToast("Piece created");
      }

      setIsProductModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      showToast(err.message || "Error saving product", "error");
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (slug) => {
    if (!confirm("Are you sure you want to delete this piece?")) return;
    try {
      const res = await fetch(`/api/products?slug=${slug}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Piece deleted");
        fetchData();
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to delete", "error");
    }
  };

  // -------------------- ORDERS ACTIONS --------------------
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
        }
        showToast(`Order #${orderId} marked as ${newStatus}`);
      }
    } catch (err) {
      console.error(err);
      showToast("Error updating status", "error");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!confirm(`Delete order #${orderId}?`)) return;
    try {
      const res = await fetch(`/api/orders?id=${orderId}`, { method: "DELETE" });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        if (selectedOrder?.id === orderId) setSelectedOrder(null);
        showToast("Order removed");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to delete order", "error");
    }
  };

  const sendWhatsAppUpdate = (order) => {
    let msg = `*${config?.brand?.name || "VIJAY JEWELLERY"} - Order Update*\n\n`;
    msg += `Dear ${order.customer},\n`;
    msg += `Your order *#${order.id}* status is: *${order.status}*.\n\n`;
    msg += `*Order Summary:*\n`;
    (order.items || []).forEach((item) => {
      msg += `• ${item.title} (Qty: ${item.qty}) - ${item.price}\n`;
    });
    msg += `\n*Total:* ${order.total}\n\n`;
    msg += `Thank you for choosing ${config?.brand?.name || "us"}. Reach out anytime for assistance!`;

    const phone = order.phone?.replace(/[^0-9]/g, "");
    const cleanPhone = phone?.startsWith("91") ? phone : `91${phone}`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // -------------------- CATEGORIES ACTIONS --------------------
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName) return;
    setIsAddingCat(true);
    try {
      let finalImageUrl = newCatImage.trim();

      if (newCatImageFile) {
        const options = {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1400,
          useWebWorker: true,
        };
        const compressed = await imageCompression(newCatImageFile, options);
        const formData = new FormData();
        formData.append("file", new File([compressed], newCatImageFile.name, { type: compressed.type }));

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.url) {
          finalImageUrl = uploadData.url;
        } else {
          throw new Error(uploadData.error || "Failed to upload category image to Cloudflare R2");
        }
      }

      const slug = newCatSlug.trim()
        ? newCatSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")
        : newCatName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");

      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCatName.trim(),
          slug,
          image: finalImageUrl || null,
        }),
      });
      if (res.ok) {
        setNewCatName("");
        setNewCatSlug("");
        setNewCatImage("");
        setNewCatImageFile(null);
        setNewCatImagePreview("");
        showToast("Category added");
        fetchData();
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to add category");
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to add category", "error");
    } finally {
      setIsAddingCat(false);
    }
  };

  const handleDeleteCategory = async (catSlug) => {
    if (!confirm("Delete this category?")) return;
    try {
      const res = await fetch(`/api/categories?slug=${catSlug}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Category deleted");
        fetchData();
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to delete category", "error");
    }
  };

  // -------------------- COMPUTED STATS --------------------
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === "Pending").length;
    const processingOrders = orders.filter((o) => o.status === "Processing").length;
    const shippedOrders = orders.filter((o) => o.status === "Shipped").length;
    const deliveredOrders = orders.filter((o) => o.status === "Delivered").length;
    const cancelledOrders = orders.filter((o) => o.status === "Cancelled").length;

    const totalRevenue = orders.reduce((sum, o) => {
      const match = String(o.total || "").replace(/,/g, "").match(/\d+(?:\.\d+)?/);
      return sum + (match ? parseFloat(match[0]) : 0);
    }, 0);

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      totalProducts: products.length,
      totalCategories: categories.length,
    };
  }, [orders, products, categories]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.title?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.slug?.toLowerCase().includes(productSearch.toLowerCase());
      const matchesCat =
        productCategoryFilter === "all" ||
        String(p.categoryId) === String(productCategoryFilter);
      return matchesSearch && matchesCat;
    });
  }, [products, productSearch, productCategoryFilter]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.id?.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customer?.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.phone?.includes(orderSearch);
      const matchesStatus =
        orderStatusFilter === "all" || o.status === orderStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  const currencySymbol = config?.brand?.currency || "₹";

  // -------------------- LOGIN SCREEN --------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0e0d0b] text-[#f5efe6] flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-[#171511] border border-[#2b261d] p-6 sm:p-8 rounded-2xl shadow-2xl relative">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/25 text-[#d4af37] flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-2xl">lock</span>
            </div>
            <h1 className="font-serif text-xl tracking-wide text-[#d4af37] font-semibold">
              {config?.brand?.name || "VIJAY JEWELLERY"}
            </h1>
            <p className="text-[11px] uppercase tracking-widest text-[#9c9484] mt-0.5">
              Atelier Console
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-lg flex items-center gap-2">
              <FiAlertCircle className="shrink-0 text-sm" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-[#9c9484] font-medium block mb-1">
                Passcode
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  required
                  autoFocus
                  placeholder="Enter passcode"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-[#0e0d0b] border border-[#2b261d] rounded-xl p-3 text-[15px] sm:text-xs text-[#f5efe6] focus:outline-none focus:border-[#d4af37] pr-10 placeholder:text-[#9c9484]/40"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-3.5 text-[#9c9484] hover:text-[#f5efe6] p-1"
                >
                  {showLoginPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-[#d4af37] text-[#0e0d0b] font-semibold text-xs py-3.5 px-4 rounded-xl uppercase tracking-wider hover:bg-[#f2ca50] transition-colors shadow-sm disabled:opacity-50"
            >
              {isLoggingIn ? "Verifying..." : "Unlock Console"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#2b261d] text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#9c9484] hover:text-[#d4af37] transition-colors"
            >
              <FiArrowLeft className="text-sm" /> Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------- AUTHENTICATED ADMIN DASHBOARD --------------------
  return (
    <div className="min-h-screen bg-[#0e0d0b] text-[#f5efe6] flex flex-col md:flex-row pb-20 md:pb-0">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-50 py-2.5 px-4 rounded-xl text-xs font-medium border shadow-2xl flex items-center justify-between sm:justify-start gap-2 transition-all animate-in fade-in slide-in-from-top-2 ${
            toast.type === "error"
              ? "bg-[#330d17] border-rose-500/50 text-rose-200"
              : "bg-[#171511] border-[#d4af37]/40 text-[#f5efe6]"
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === "error" ? (
              <FiAlertCircle className="text-sm shrink-0 text-rose-400" />
            ) : (
              <FiCheck className="text-sm shrink-0 text-[#d4af37]" />
            )}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-[#9c9484] hover:text-[#f5efe6] ml-2">
            <FiX className="text-xs" />
          </button>
        </div>
      )}

      {/* ----------------- MOBILE TOP APP BAR ----------------- */}
      <header className="md:hidden sticky top-0 z-30 bg-[#0e0d0b]/95 backdrop-blur-md border-b border-[#2b261d] px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-serif text-sm font-semibold tracking-wide text-[#d4af37] truncate max-w-[170px]">
            {config?.brand?.name || "VIJAY JEWELLERY"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={fetchData}
            title="Refresh"
            className="p-2 text-[#9c9484] hover:text-[#f5efe6] rounded-lg active:bg-[#171511]"
          >
            <FiRefreshCw className={`text-sm ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowResetModal(true)}
            title="Security"
            className="p-2 text-[#9c9484] hover:text-[#f5efe6] rounded-lg active:bg-[#171511]"
          >
            <FiLock className="text-sm" />
          </button>
          <Link
            href="/"
            target="_blank"
            className="text-[11px] font-medium text-[#d4af37] bg-[#171511] border border-[#2b261d] px-2.5 py-1.5 rounded-lg active:bg-[#221f19]"
          >
            Store ↗
          </Link>
        </div>
      </header>

      {/* ----------------- DESKTOP SIDEBAR NAVIGATION ----------------- */}
      <aside className="hidden md:flex w-60 bg-[#12100d] border-r border-[#2b261d] flex-col justify-between h-screen sticky top-0 shrink-0">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-[#2b261d]">
            <Link href="/" className="font-serif text-sm font-semibold tracking-wider text-[#d4af37] block">
              {config?.brand?.name || "VIJAY JEWELLERY"}
            </Link>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[10px] uppercase tracking-widest text-[#9c9484] font-medium">
                Atelier Admin
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "dashboard"
                  ? "bg-[#1f1c16] text-[#d4af37] border border-[#2b261d]"
                  : "text-[#9c9484] hover:text-[#f5efe6] hover:bg-[#171511]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FiGrid className="text-sm" />
                <span>Overview</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "orders"
                  ? "bg-[#1f1c16] text-[#d4af37] border border-[#2b261d]"
                  : "text-[#9c9484] hover:text-[#f5efe6] hover:bg-[#171511]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FiShoppingBag className="text-sm" />
                <span>Orders</span>
              </div>
              {stats.pendingOrders > 0 && (
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  {stats.pendingOrders}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "products"
                  ? "bg-[#1f1c16] text-[#d4af37] border border-[#2b261d]"
                  : "text-[#9c9484] hover:text-[#f5efe6] hover:bg-[#171511]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FiPackage className="text-sm" />
                <span>Products</span>
              </div>
              <span className="text-[11px] text-[#9c9484]">{products.length}</span>
            </button>

            <button
              onClick={() => setActiveTab("categories")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "categories"
                  ? "bg-[#1f1c16] text-[#d4af37] border border-[#2b261d]"
                  : "text-[#9c9484] hover:text-[#f5efe6] hover:bg-[#171511]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FiTag className="text-sm" />
                <span>Categories</span>
              </div>
              <span className="text-[11px] text-[#9c9484]">{categories.length}</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "settings"
                  ? "bg-[#1f1c16] text-[#d4af37] border border-[#2b261d]"
                  : "text-[#9c9484] hover:text-[#f5efe6] hover:bg-[#171511]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FiSliders className="text-sm" />
                <span>Settings</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Bottom Utility Actions */}
        <div className="p-3 border-t border-[#2b261d] space-y-1">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#9c9484] hover:text-[#f5efe6] hover:bg-[#171511] transition-colors"
          >
            <FiExternalLink className="text-sm" />
            <span>Storefront ↗</span>
          </Link>

          <button
            onClick={() => setShowResetModal(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#9c9484] hover:text-[#f5efe6] hover:bg-[#171511] transition-colors text-left"
          >
            <FiLock className="text-sm" />
            <span>Security</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
          >
            <FiLogOut className="text-sm" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* ----------------- MAIN VIEWPORT ----------------- */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full">
        {/* Desktop Top Header */}
        <div className="hidden md:flex items-center justify-between pb-5 mb-6 border-b border-[#2b261d]">
          <div>
            <h2 className="text-xl font-serif font-semibold text-[#f5efe6] capitalize">
              {activeTab === "dashboard" && "Overview"}
              {activeTab === "orders" && "Customer Orders"}
              {activeTab === "products" && "Product Catalog"}
              {activeTab === "categories" && "Categories"}
              {activeTab === "settings" && "Store Settings"}
            </h2>
            <p className="text-xs text-[#9c9484] mt-0.5">
              {activeTab === "dashboard" && "High-level metrics and recent storefront activity"}
              {activeTab === "orders" && "Fulfillment queue and instant customer communication"}
              {activeTab === "products" && "Pieces, pricing, and visual inventory"}
              {activeTab === "categories" && "Organize your atelier collections"}
              {activeTab === "settings" && "Store identity, WhatsApp concierge, and theme"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              title="Refresh Data"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-[#9c9484] bg-[#171511] border border-[#2b261d] hover:text-[#f5efe6] transition-colors"
            >
              <FiRefreshCw className={`text-xs ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            {activeTab === "products" && (
              <button
                onClick={openNewProductModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#d4af37] text-[#0e0d0b] hover:bg-[#f2ca50] transition-colors shadow-sm"
              >
                <FiPlus className="text-sm" /> Add Piece
              </button>
            )}
          </div>
        </div>

        {/* Mobile Section Title (Subtle) */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif font-semibold text-[#f5efe6] capitalize">
            {activeTab === "dashboard" && "Overview"}
            {activeTab === "orders" && "Orders"}
            {activeTab === "products" && "Catalog"}
            {activeTab === "categories" && "Categories"}
            {activeTab === "settings" && "Settings"}
          </h2>

          {activeTab === "products" && (
            <button
              onClick={openNewProductModal}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#d4af37] text-[#0e0d0b] shadow-sm"
            >
              <FiPlus className="text-sm" /> Add Piece
            </button>
          )}
        </div>

        {/* ----------------- VIEW: DASHBOARD ----------------- */}
        {activeTab === "dashboard" && (
          <div className="space-y-4 sm:space-y-6">
            {/* KPI Cards (2x2 on Mobile, 4x1 on Desktop) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {/* Total Revenue */}
              <div className="bg-[#171511] border border-[#2b261d] p-3.5 sm:p-5 rounded-xl">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#9c9484] font-medium block mb-1">
                  Revenue
                </span>
                <div className="text-lg sm:text-2xl font-serif font-bold text-[#f5efe6] truncate">
                  {currencySymbol}{stats.totalRevenue.toLocaleString()}
                </div>
                <p className="text-[10px] sm:text-[11px] text-[#9c9484] mt-1 truncate">
                  All customer orders
                </p>
              </div>

              {/* Total Orders */}
              <div className="bg-[#171511] border border-[#2b261d] p-3.5 sm:p-5 rounded-xl">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#9c9484] font-medium block mb-1">
                  Total Orders
                </span>
                <div className="text-lg sm:text-2xl font-serif font-bold text-[#f5efe6]">
                  {stats.totalOrders}
                </div>
                <p className="text-[10px] sm:text-[11px] text-[#9c9484] mt-1 truncate">
                  {stats.deliveredOrders} delivered
                </p>
              </div>

              {/* Pending Action Card */}
              <div
                onClick={() => {
                  setOrderStatusFilter("Pending");
                  setActiveTab("orders");
                }}
                className={`p-3.5 sm:p-5 rounded-xl border cursor-pointer transition-all ${
                  stats.pendingOrders > 0
                    ? "bg-[#2e1e08] border-amber-500/40"
                    : "bg-[#171511] border-[#2b261d]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#9c9484] font-medium">
                    Pending
                  </span>
                  {stats.pendingOrders > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  )}
                </div>
                <div
                  className={`text-lg sm:text-2xl font-serif font-bold ${
                    stats.pendingOrders > 0 ? "text-amber-400" : "text-[#f5efe6]"
                  }`}
                >
                  {stats.pendingOrders}
                </div>
                <p className="text-[10px] sm:text-[11px] text-[#9c9484] mt-1 truncate">
                  {stats.pendingOrders > 0 ? "Needs fulfillment →" : "All cleared"}
                </p>
              </div>

              {/* Catalog Items */}
              <div
                onClick={() => setActiveTab("products")}
                className="bg-[#171511] border border-[#2b261d] p-3.5 sm:p-5 rounded-xl cursor-pointer hover:border-[#d4af37]/30 transition-all"
              >
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#9c9484] font-medium block mb-1">
                  Catalog
                </span>
                <div className="text-lg sm:text-2xl font-serif font-bold text-[#f5efe6]">
                  {stats.totalProducts}
                </div>
                <p className="text-[10px] sm:text-[11px] text-[#9c9484] mt-1 truncate">
                  {stats.totalCategories} categories
                </p>
              </div>
            </div>

            {/* Concierge Info Strip */}
            <div className="bg-[#171511] border border-[#2b261d] p-3.5 sm:p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-[#9c9484]">
                <FaWhatsapp className="text-emerald-400 text-sm shrink-0" />
                <span className="truncate">
                  Orders forwarded to:{" "}
                  <strong className="text-[#f5efe6] font-mono">
                    {config?.contact?.whatsapp || "Not set"}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={openNewProductModal}
                  className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#d4af37]/15 text-[#f2ca50] border border-[#d4af37]/30 active:bg-[#d4af37]/25 text-center"
                >
                  + Add Piece
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-medium text-[#9c9484] bg-[#0e0d0b] border border-[#2b261d] active:text-[#f5efe6] text-center"
                >
                  View Orders
                </button>
              </div>
            </div>

            {/* Recent Orders Section */}
            <div className="bg-[#171511] border border-[#2b261d] rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-[#2b261d] flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-sm font-semibold text-[#f5efe6]">Recent Orders</h3>
                </div>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-xs text-[#d4af37] font-medium hover:underline"
                >
                  View All →
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-10 text-[#9c9484] text-xs">
                  No orders placed yet.
                </div>
              ) : (
                <>
                  {/* Mobile Order Cards for Recent Orders */}
                  <div className="md:hidden divide-y divide-[#2b261d]/60">
                    {orders.slice(0, 4).map((order) => {
                      const statusStyle = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
                      return (
                        <div key={order.id} className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-semibold text-[#d4af37]">
                              #{order.id}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                            >
                              {order.status}
                            </span>
                          </div>

                          <div className="flex items-baseline justify-between">
                            <div>
                              <div className="text-xs font-medium text-[#f5efe6]">{order.customer}</div>
                              <div className="text-[11px] text-[#9c9484]">{order.phone}</div>
                            </div>
                            <div className="text-sm font-serif font-bold text-[#f5efe6]">
                              {order.total}
                            </div>
                          </div>

                          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#2b261d]/30">
                            <button
                              onClick={() => sendWhatsAppUpdate(order)}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-[#08281a] border border-emerald-500/30 px-2.5 py-1 rounded-lg"
                            >
                              <FaWhatsapp className="text-xs" /> WhatsApp
                            </button>
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="text-[11px] font-medium text-[#9c9484] bg-[#0e0d0b] border border-[#2b261d] px-2.5 py-1 rounded-lg"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Table for Recent Orders */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#2b261d] bg-[#0e0d0b]/40 text-[#9c9484] uppercase tracking-wider text-[10px]">
                          <th className="py-3 px-4">Order ID</th>
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Items</th>
                          <th className="py-3 px-4">Total</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2b261d]/60">
                        {orders.slice(0, 5).map((order) => {
                          const statusStyle = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
                          return (
                            <tr key={order.id} className="hover:bg-[#0e0d0b]/40 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-semibold text-[#d4af37]">
                                #{order.id}
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="font-medium text-[#f5efe6]">{order.customer}</div>
                                <div className="text-[11px] text-[#9c9484]">{order.phone}</div>
                              </td>
                              <td className="py-3.5 px-4 text-[#9c9484]">
                                {(order.items || []).length} item(s)
                              </td>
                              <td className="py-3.5 px-4 font-semibold text-[#f5efe6]">
                                {order.total}
                              </td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                                >
                                  <span className={`w-1 h-1 rounded-full ${statusStyle.dot}`} />
                                  {order.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    onClick={() => sendWhatsAppUpdate(order)}
                                    title="WhatsApp"
                                    className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                  >
                                    <FaWhatsapp className="text-sm" />
                                  </button>
                                  <button
                                    onClick={() => setSelectedOrder(order)}
                                    title="Details"
                                    className="p-1.5 text-[#9c9484] hover:text-[#f5efe6] hover:bg-[#0e0d0b] rounded-lg transition-colors"
                                  >
                                    <FiEye className="text-sm" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ----------------- VIEW: ORDERS ----------------- */}
        {activeTab === "orders" && (
          <div className="space-y-3 sm:space-y-4">
            {/* Filter Bar */}
            <div className="bg-[#171511] border border-[#2b261d] p-3 sm:p-4 rounded-xl space-y-3">
              {/* Status Filter Scrollable Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-0.5">
                {[
                  { id: "all", label: "All", count: orders.length },
                  { id: "Pending", label: "Pending", count: stats.pendingOrders },
                  { id: "Processing", label: "Processing", count: stats.processingOrders },
                  { id: "Shipped", label: "Shipped", count: stats.shippedOrders },
                  { id: "Delivered", label: "Delivered", count: stats.deliveredOrders },
                  { id: "Cancelled", label: "Cancelled", count: stats.cancelledOrders },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setOrderStatusFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                      orderStatusFilter === tab.id
                        ? "bg-[#d4af37] text-[#0e0d0b] font-semibold shadow-xs"
                        : "text-[#9c9484] hover:text-[#f5efe6] bg-[#0e0d0b] border border-[#2b261d]"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        orderStatusFilter === tab.id
                          ? "bg-[#0e0d0b]/20 text-[#0e0d0b]"
                          : "bg-[#171511] text-[#9c9484]"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Instant Search Bar */}
              <div className="relative w-full">
                <FiSearch className="absolute left-3 top-3 text-[#9c9484] text-xs" />
                <input
                  type="text"
                  placeholder="Search by order #, customer, phone..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full bg-[#0e0d0b] border border-[#2b261d] rounded-xl py-2 pl-8 pr-8 text-[15px] sm:text-xs text-[#f5efe6] focus:outline-none focus:border-[#d4af37] placeholder:text-[#9c9484]/40"
                />
                {orderSearch && (
                  <button
                    onClick={() => setOrderSearch("")}
                    className="absolute right-3 top-3 text-[#9c9484] hover:text-[#f5efe6]"
                  >
                    <FiX className="text-xs" />
                  </button>
                )}
              </div>
            </div>

            {/* Orders Output */}
            {filteredOrders.length === 0 ? (
              <div className="bg-[#171511] border border-[#2b261d] rounded-2xl p-10 text-center">
                <FiShoppingBag className="text-3xl text-[#9c9484] mx-auto mb-2 opacity-40" />
                <p className="text-xs font-medium text-[#f5efe6]">No orders found</p>
                <p className="text-[11px] text-[#9c9484] mt-0.5">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <>
                {/* 1. Mobile Order Cards List (< 768px) */}
                <div className="md:hidden space-y-3">
                  {filteredOrders.map((order) => {
                    const statusStyle = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
                    return (
                      <div
                        key={order.id}
                        className="bg-[#171511] border border-[#2b261d] rounded-xl p-4 space-y-3"
                      >
                        {/* Top: ID & Date */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-[#d4af37]">
                            #{order.id}
                          </span>
                          <span className="text-[11px] text-[#9c9484]">
                            {order.placedAt ? new Date(order.placedAt).toLocaleDateString() : "Recent"}
                          </span>
                        </div>

                        {/* Customer & Address */}
                        <div>
                          <div className="text-sm font-semibold text-[#f5efe6]">{order.customer}</div>
                          <div className="text-xs text-[#9c9484] font-mono flex items-center gap-1 mt-0.5">
                            <FiPhone className="text-[10px]" />
                            <span>{order.phone}</span>
                          </div>
                          {order.address && (
                            <div className="text-[11px] text-[#9c9484] flex items-start gap-1 mt-1 line-clamp-1">
                              <FiMapPin className="text-[10px] shrink-0 mt-0.5" />
                              <span>{order.address}</span>
                            </div>
                          )}
                        </div>

                        {/* Items & Total */}
                        <div className="p-2.5 bg-[#0e0d0b] rounded-lg border border-[#2b261d] flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[#9c9484]">
                              {(order.items || []).length} piece(s)
                            </span>
                            <div className="text-[10px] text-[#9c9484] truncate max-w-[180px]">
                              {(order.items || []).map((i) => i.title).join(", ")}
                            </div>
                          </div>
                          <span className="font-serif font-bold text-sm text-[#f5efe6]">
                            {order.total}
                          </span>
                        </div>

                        {/* Bottom Actions Toolbar */}
                        <div className="pt-1 flex items-center justify-between gap-2">
                          {/* Inline Status Selector */}
                          <select
                            value={order.status || "Pending"}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className={`text-xs font-semibold py-1.5 px-2.5 rounded-lg border focus:outline-none ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                          >
                            <option value="Pending" className="bg-[#171511] text-[#f5efe6]">Pending</option>
                            <option value="Processing" className="bg-[#171511] text-[#f5efe6]">Processing</option>
                            <option value="Shipped" className="bg-[#171511] text-[#f5efe6]">Shipped</option>
                            <option value="Delivered" className="bg-[#171511] text-[#f5efe6]">Delivered</option>
                            <option value="Cancelled" className="bg-[#171511] text-[#f5efe6]">Cancelled</option>
                          </select>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => sendWhatsAppUpdate(order)}
                              title="WhatsApp Customer"
                              className="p-2 text-emerald-400 bg-[#08281a] border border-emerald-500/40 rounded-lg active:scale-95 transition-transform"
                            >
                              <FaWhatsapp className="text-base" />
                            </button>
                            <button
                              onClick={() => setSelectedOrder(order)}
                              title="View Details"
                              className="p-2 text-[#9c9484] bg-[#0e0d0b] border border-[#2b261d] rounded-lg active:scale-95 transition-transform"
                            >
                              <FiEye className="text-base" />
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              title="Delete Order"
                              className="p-2 text-rose-400 bg-[#330d17] border border-rose-500/30 rounded-lg active:scale-95 transition-transform"
                            >
                              <FiTrash2 className="text-base" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 2. Desktop Data Table (>= 768px) */}
                <div className="hidden md:block bg-[#171511] border border-[#2b261d] rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#2b261d] bg-[#0e0d0b]/40 text-[#9c9484] uppercase tracking-wider text-[10px]">
                          <th className="py-3 px-4">Order ID</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Items</th>
                          <th className="py-3 px-4">Total</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2b261d]/60">
                        {filteredOrders.map((order) => {
                          const statusStyle = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
                          return (
                            <tr key={order.id} className="hover:bg-[#0e0d0b]/40 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-semibold text-[#d4af37]">
                                #{order.id}
                              </td>
                              <td className="py-3.5 px-4 text-[#9c9484] whitespace-nowrap">
                                {order.placedAt ? new Date(order.placedAt).toLocaleDateString() : "Recent"}
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="font-medium text-[#f5efe6]">{order.customer}</div>
                                <div className="text-[11px] text-[#9c9484]">{order.phone}</div>
                              </td>
                              <td className="py-3.5 px-4 text-[#9c9484]">
                                <div>{(order.items || []).length} piece(s)</div>
                              </td>
                              <td className="py-3.5 px-4 font-semibold text-[#f5efe6]">
                                {order.total}
                              </td>
                              <td className="py-3.5 px-4">
                                <select
                                  value={order.status || "Pending"}
                                  onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                  className={`text-[11px] font-semibold py-1 px-2.5 rounded-lg border focus:outline-none cursor-pointer ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                                >
                                  <option value="Pending" className="bg-[#171511] text-[#f5efe6]">Pending</option>
                                  <option value="Processing" className="bg-[#171511] text-[#f5efe6]">Processing</option>
                                  <option value="Shipped" className="bg-[#171511] text-[#f5efe6]">Shipped</option>
                                  <option value="Delivered" className="bg-[#171511] text-[#f5efe6]">Delivered</option>
                                  <option value="Cancelled" className="bg-[#171511] text-[#f5efe6]">Cancelled</option>
                                </select>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    onClick={() => sendWhatsAppUpdate(order)}
                                    title="WhatsApp"
                                    className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                  >
                                    <FaWhatsapp className="text-sm" />
                                  </button>
                                  <button
                                    onClick={() => setSelectedOrder(order)}
                                    title="View Docket"
                                    className="p-1.5 text-[#9c9484] hover:text-[#f5efe6] hover:bg-[#0e0d0b] rounded-lg transition-colors"
                                  >
                                    <FiEye className="text-sm" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteOrder(order.id)}
                                    title="Delete"
                                    className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                  >
                                    <FiTrash2 className="text-sm" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ----------------- VIEW: PRODUCTS ----------------- */}
        {activeTab === "products" && (
          <div className="space-y-3 sm:space-y-4">
            {/* Filter Toolbar */}
            <div className="bg-[#171511] border border-[#2b261d] p-3 sm:p-4 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1 sm:max-w-xs">
                  <FiSearch className="absolute left-3 top-2.5 text-[#9c9484] text-xs" />
                  <input
                    type="text"
                    placeholder="Search pieces..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full bg-[#0e0d0b] border border-[#2b261d] rounded-xl py-1.5 pl-8 pr-3 text-[15px] sm:text-xs text-[#f5efe6] focus:outline-none focus:border-[#d4af37] placeholder:text-[#9c9484]/40"
                  />
                </div>

                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="bg-[#0e0d0b] border border-[#2b261d] rounded-xl py-2 sm:py-1.5 px-3 text-[15px] sm:text-xs text-[#f5efe6] focus:outline-none focus:border-[#d4af37]"
                >
                  <option value="all">All ({products.length})</option>
                  {categories.map((cat) => (
                    <option key={cat.id || cat.slug} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-[11px] text-[#9c9484] self-end sm:self-center">
                {filteredProducts.length} pieces found
              </div>
            </div>

            {/* Product Cards Grid (2 cols on mobile, 3-4 on desktop) */}
            {filteredProducts.length === 0 ? (
              <div className="bg-[#171511] border border-[#2b261d] rounded-2xl p-10 text-center">
                <FiPackage className="text-3xl text-[#9c9484] mx-auto mb-2 opacity-40" />
                <p className="text-xs font-medium text-[#f5efe6]">No products found</p>
                <button
                  onClick={openNewProductModal}
                  className="mt-3 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#d4af37] text-[#0e0d0b]"
                >
                  + Add Piece
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                {filteredProducts.map((prod) => {
                  const cat = categories.find((c) => String(c.id) === String(prod.categoryId));
                  return (
                    <div
                      key={prod.id || prod.slug}
                      className="bg-[#171511] border border-[#2b261d] rounded-xl overflow-hidden flex flex-col justify-between hover:border-[#d4af37]/40 transition-colors"
                    >
                      <div>
                        {/* Image Frame */}
                        <div className="aspect-square bg-[#0e0d0b] relative overflow-hidden flex items-center justify-center">
                          {prod.image ? (
                            <img
                              src={prod.image}
                              alt={prod.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-3xl text-[#2b261d]">
                              diamond
                            </span>
                          )}
                          {cat && (
                            <span className="absolute top-1.5 left-1.5 bg-[#0e0d0b]/85 border border-[#2b261d] text-[#d4af37] text-[9px] px-1.5 py-0.5 rounded font-medium truncate max-w-[85%]">
                              {cat.name}
                            </span>
                          )}
                        </div>

                        {/* Title & Price */}
                        <div className="p-2.5 sm:p-3">
                          <h4 className="text-xs font-semibold text-[#f5efe6] line-clamp-1 mb-1">
                            {prod.title}
                          </h4>
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className="text-xs sm:text-sm font-semibold text-[#d4af37]">
                              {prod.price?.startsWith("₹") || prod.price?.startsWith("$")
                                ? prod.price
                                : `${currencySymbol}${prod.price}`}
                            </span>
                            {prod.oldPrice && (
                              <span className="text-[10px] text-[#9c9484] line-through">
                                {prod.oldPrice?.startsWith("₹") || prod.oldPrice?.startsWith("$")
                                  ? prod.oldPrice
                                  : `${currencySymbol}${prod.oldPrice}`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-2 border-t border-[#2b261d]/60 flex items-center justify-between bg-[#0e0d0b]/30">
                        <span className="text-[9px] text-[#9c9484] font-mono truncate max-w-[70px] sm:max-w-[100px]">
                          /{prod.slug}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditProductModal(prod)}
                            title="Edit"
                            className="p-1.5 text-[#9c9484] hover:text-[#d4af37] rounded-md active:bg-[#1f1c16]"
                          >
                            <FiEdit2 className="text-xs" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.slug)}
                            title="Delete"
                            className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-md active:bg-rose-500/20"
                          >
                            <FiTrash2 className="text-xs" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ----------------- VIEW: CATEGORIES ----------------- */}
        {activeTab === "categories" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
            {/* Add Category Form */}
            <div className="md:col-span-5">
              <div className="bg-[#171511] border border-[#2b261d] p-4 sm:p-5 rounded-2xl">
                <h3 className="font-serif text-sm font-semibold text-[#f5efe6] mb-3">Add Category</h3>
                <form onSubmit={handleAddCategory} className="space-y-3">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-[#9c9484] font-medium block mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Diamond Pendants"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="w-full bg-[#0e0d0b] border border-[#2b261d] rounded-xl p-2.5 text-[15px] sm:text-xs text-[#f5efe6] focus:outline-none focus:border-[#d4af37] placeholder:text-[#9c9484]/40"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-[#9c9484] font-medium block mb-1">
                      Slug (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. diamond-pendants"
                      value={newCatSlug}
                      onChange={(e) => setNewCatSlug(e.target.value)}
                      className="w-full bg-[#0e0d0b] border border-[#2b261d] rounded-xl p-2.5 text-[15px] sm:text-xs text-[#f5efe6] focus:outline-none focus:border-[#d4af37] placeholder:text-[#9c9484]/40"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-[#9c9484] font-medium block mb-1">
                      Category Image (Uploads to R2)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files[0];
                        if (f) {
                          setNewCatImageFile(f);
                          setNewCatImagePreview(URL.createObjectURL(f));
                        }
                      }}
                      className="text-xs text-[#9c9484] file:mr-2.5 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-[#d4af37] file:text-[#0e0d0b] file:font-semibold mb-2 block"
                    />
                    <input
                      type="text"
                      placeholder="Or paste image URL"
                      value={newCatImage}
                      onChange={(e) => {
                        setNewCatImage(e.target.value);
                        setNewCatImagePreview(e.target.value);
                      }}
                      className="w-full bg-[#0e0d0b] border border-[#2b261d] rounded-xl p-2.5 text-[15px] sm:text-xs text-[#f5efe6] focus:outline-none focus:border-[#d4af37] placeholder:text-[#9c9484]/40"
                    />
                    {newCatImagePreview && (
                      <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden border border-[#2b261d]">
                        <img src={newCatImagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isAddingCat}
                    className="w-full bg-[#d4af37] text-[#0e0d0b] font-semibold text-xs py-3 rounded-xl hover:bg-[#f2ca50] transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <FiPlus className="text-sm" /> {isAddingCat ? "Adding..." : "Add Category"}
                  </button>
                </form>
              </div>
            </div>

            {/* Active Categories List */}
            <div className="md:col-span-7">
              <div className="bg-[#171511] border border-[#2b261d] p-4 sm:p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-serif text-sm font-semibold text-[#f5efe6]">
                    Active Categories ({categories.length})
                  </h3>
                </div>

                <div className="divide-y divide-[#2b261d]/60">
                  {categories.map((cat) => {
                    const prodCount = products.filter((p) => String(p.categoryId) === String(cat.id)).length;
                    return (
                      <div key={cat.id || cat.slug} className="py-3 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold text-[#f5efe6]">{cat.name}</div>
                          <div className="text-[11px] text-[#9c9484] mt-0.5">
                            <span className="font-mono text-[10px]">/{cat.slug}</span> · {prodCount} pieces
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteCategory(cat.slug)}
                          className="p-1.5 text-[#9c9484] hover:text-rose-400 rounded-lg active:bg-rose-500/10"
                          title="Delete Category"
                        >
                          <FiTrash2 className="text-xs" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- VIEW: STORE SETTINGS ----------------- */}
        {activeTab === "settings" && (
          <form onSubmit={handleSaveStoreConfig} className="space-y-4 sm:space-y-6">
            {/* 1. Brand Identity */}
            <div className="bg-[#171511] border border-[#2b261d] p-4 sm:p-5 rounded-2xl space-y-4">
              <div className="border-b border-[#2b261d] pb-2.5">
                <h3 className="font-serif text-sm font-semibold text-[#f5efe6]">Brand &amp; Identity</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#9c9484] font-medium block mb-1">
                    Store Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={configForm?.brand?.name || ""}
                    onChange={(e) =>
                      setConfigForm((prev) => ({
                        ...prev,
                        brand: { ...prev.brand, name: e.target.value },
                      }))
                    }
                    className="w-full bg-[#0e0d0b] border border-[#2b261d] rounded-xl p-2.5 text-[15px] sm:text-xs text-[#f5efe6] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#9c9484] font-medium block mb-1">
                    Sub-Brand / Collection
                  </label>
                  <input
                    type="text"
                    value={configForm?.brand?.subname || ""}
                    onChange={(e) =>
                      setConfigForm((prev) => ({
                        ...prev,
                        brand: { ...prev.brand, subname: e.target.value },
                      }))
                    }
                    className="w-full bg-[#0e0d0b] border border-[#2b261d] rounded-xl p-2.5 text-[15px] sm:text-xs text-[#f5efe6] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#9c9484] font-medium block mb-1">
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    value={configForm?.brand?.currency || "₹"}
                    onChange={(e) =>
                      setConfigForm((prev) => ({
                        ...prev,
                        brand: { ...prev.brand, currency: e.target.value },
                      }))
                    }
                    className="w-full bg-[#0e0d0b] border border-[#2b261d] rounded-xl p-2.5 text-[15px] sm:text-xs text-[#f5efe6] font-semibold focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#9c9484] font-medium block mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={configForm?.brand?.tagline || ""}
                  onChange={(e) =>
                    setConfigForm((prev) => ({
                      ...prev,
                      brand: { ...prev.brand, tagline: e.target.value },
                    }))
                  }
                  className="w-full bg-[#0e0d0b] border border-[#2b261d] rounded-xl p-2.5 text-[15px] sm:text-xs text-[#f5efe6] focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>

            {/* 2. WhatsApp Concierge */}
            <div className="bg-[#171511] border border-[#2b261d] p-4 sm:p-5 rounded-2xl space-y-4">
              <div className="border-b border-[#2b261d] pb-2.5">
                <h3 className="font-serif text-sm font-semibold text-[#f5efe6]">
                  WhatsApp Concierge &amp; Orders
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#9c9484] font-medium block mb-1">
                    WhatsApp (Orders forwarded here) *
                  </label>
                  <input
                    type="text"
                    required
                    value={configForm?.contact?.whatsapp || ""}
                    onChange={(e) =>
                      setConfigForm((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, whatsapp: e.target.value },
                      }))
                    }
                    placeholder="e.g. 917319064254"
                    className="w-full bg-[#0e0d0b] border border-[#2b261d] rounded-xl p-2.5 text-[15px] sm:text-xs text-[#f5efe6] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#9c9484] font-medium block mb-1">
                    Display Phone
                  </label>
                  <input
                    type="text"
                    value={configForm?.contact?.phone || ""}
                    onChange={(e) =>
                      setConfigForm((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, phone: e.target.value },
                      }))
                    }
                    placeholder="+91 73190 64254"
                    className="w-full bg-[#0e0d0b] border border-[#2b261d] rounded-xl p-2.5 text-[15px] sm:text-xs text-[#f5efe6] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#9c9484] font-medium block mb-1">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={configForm?.contact?.email || ""}
                    onChange={(e) =>
                      setConfigForm((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, email: e.target.value },
                      }))
                    }
                    className="w-full bg-[#0e0d0b] border border-[#2b261d] rounded-xl p-2.5 text-[15px] sm:text-xs text-[#f5efe6] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#9c9484] font-medium block mb-1">
                  Atelier Address
                </label>
                <input
                  type="text"
                  value={configForm?.contact?.address || ""}
                  onChange={(e) =>
                    setConfigForm((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, address: e.target.value },
                    }))
                  }
                  className="w-full bg-[#0e0d0b] border border-[#2b261d] rounded-xl p-2.5 text-[15px] sm:text-xs text-[#f5efe6] focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>

            {/* 3. Theme Presets */}
            <div className="bg-[#171511] border border-[#2b261d] p-4 sm:p-5 rounded-2xl space-y-4">
              <div className="border-b border-[#2b261d] pb-2.5">
                <h3 className="font-serif text-sm font-semibold text-[#f5efe6]">Theme Palette</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {THEME_PRESETS.map((preset) => {
                  const isSelected = configForm?.theme?.primaryColor === preset.primary;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPresetColor(preset)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        isSelected
                          ? "border-[#d4af37] bg-[#d4af37]/10"
                          : "border-[#2b261d] bg-[#0e0d0b] hover:border-[#9c9484]"
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: preset.colorHex }}
                      />
                      <span className="text-xs font-medium text-[#f5efe6] truncate">{preset.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Hero Content */}
            <div className="bg-[#171511] border border-[#2b261d] p-4 sm:p-5 rounded-2xl space-y-4">
              <div className="border-b border-[#2b261d] pb-2.5">
                <h3 className="font-serif text-sm font-semibold text-[#f5efe6]">Hero Banner Content</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#9c9484] font-medium block mb-1">
                    Headline Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={configForm?.hero?.title || ""}
                    onChange={(e) =>
                      setConfigForm((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, title: e.target.value },
                      }))
                    }
                    className="w-full bg-[#0e0d0b] border border-[#2b261d] rounded-xl p-2.5 text-[15px] sm:text-xs text-[#f5efe6] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#9c9484] font-medium block mb-1">
                    Hero Subtitle
                  </label>
                  <input
                    type="text"
                    value={configForm?.hero?.subtitle || ""}
                    onChange={(e) =>
                      setConfigForm((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, subtitle: e.target.value },
                      }))
                    }
                    className="w-full bg-[#0e0d0b] border border-[#2b261d] rounded-xl p-2.5 text-[15px] sm:text-xs text-[#f5efe6] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#9c9484] font-medium block mb-1">
                    Desktop Banner Image URL (Wide 3:1)
                  </label>
                  <input
                    type="text"
                    value={configForm?.hero?.bannerImage || ""}
                    placeholder="https://..."
                    onChange={(e) =>
                      setConfigForm((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, bannerImage: e.target.value },
                      }))
                    }
                    className="w-full bg-[#0e0d0b] border border-[#2b261d] rounded-xl p-2.5 text-[15px] sm:text-xs text-[#f5efe6] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#9c9484] font-medium block mb-1">
                    Mobile Banner Image URL (Square 1:1)
                  </label>
                  <input
                    type="text"
                    value={configForm?.hero?.mobileBannerImage || ""}
                    placeholder="https://..."
                    onChange={(e) =>
                      setConfigForm((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, mobileBannerImage: e.target.value },
                      }))
                    }
                    className="w-full bg-[#0e0d0b] border border-[#2b261d] rounded-xl p-2.5 text-[15px] sm:text-xs text-[#f5efe6] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSavingConfig}
                className="w-full sm:w-auto bg-[#d4af37] text-[#0e0d0b] font-semibold text-xs py-3.5 px-8 rounded-xl uppercase tracking-wider hover:bg-[#f2ca50] transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <FiSave className="text-sm" />
                <span>{isSavingConfig ? "Saving..." : "Save Store Configuration"}</span>
              </button>
            </div>
          </form>
        )}
      </main>

      {/* ----------------- MOBILE BOTTOM NAVIGATION BAR ----------------- */}
      <nav
        aria-label="Admin Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0e0d0b]/95 backdrop-blur-xl border-t border-[#2b261d] pb-safe"
      >
        <div className="flex items-center justify-around h-16 px-1">
          {/* 1. Overview */}
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              activeTab === "dashboard" ? "text-[#d4af37]" : "text-[#9c9484]"
            }`}
          >
            <FiGrid className="text-lg" />
            <span className="text-[10px] font-medium tracking-wider uppercase mt-1">Home</span>
          </button>

          {/* 2. Orders */}
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors relative ${
              activeTab === "orders" ? "text-[#d4af37]" : "text-[#9c9484]"
            }`}
          >
            <div className="relative">
              <FiShoppingBag className="text-lg" />
              {stats.pendingOrders > 0 && (
                <span className="absolute -top-1 -right-2 bg-amber-500 text-[#0e0d0b] text-[9px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center">
                  {stats.pendingOrders}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium tracking-wider uppercase mt-1">Orders</span>
          </button>

          {/* 3. Products */}
          <button
            onClick={() => setActiveTab("products")}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              activeTab === "products" ? "text-[#d4af37]" : "text-[#9c9484]"
            }`}
          >
            <FiPackage className="text-lg" />
            <span className="text-[10px] font-medium tracking-wider uppercase mt-1">Pieces</span>
          </button>

          {/* 4. Categories */}
          <button
            onClick={() => setActiveTab("categories")}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              activeTab === "categories" ? "text-[#d4af37]" : "text-[#9c9484]"
            }`}
          >
            <FiTag className="text-lg" />
            <span className="text-[10px] font-medium tracking-wider uppercase mt-1">Tags</span>
          </button>

          {/* 5. Settings */}
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              activeTab === "settings" ? "text-[#d4af37]" : "text-[#9c9484]"
            }`}
          >
            <FiSliders className="text-lg" />
            <span className="text-[10px] font-medium tracking-wider uppercase mt-1">Config</span>
          </button>
        </div>
      </nav>

      {/* ----------------- PRODUCT CREATE / EDIT BOTTOM SHEET / MODAL ----------------- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center">
          <div className="w-full sm:max-w-lg bg-[#171511] border-t sm:border border-[#2b261d] rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-5">
            {/* Mobile Drag Handle Indicator */}
            <div className="sm:hidden w-10 h-1 bg-[#2b261d] rounded-full mx-auto my-2 shrink-0"></div>

            {/* Header */}
            <div className="px-5 py-3.5 border-b border-[#2b261d] flex items-center justify-between shrink-0">
              <h3 className="font-serif text-base font-semibold text-[#f5efe6]">
                {editingProductId ? "Edit Piece" : "Add New Piece"}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-[#9c9484] hover:text-[#f5efe6] p-1.5 rounded-lg active:bg-[#0e0d0b]"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveProduct} className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#9c9484] font-medium block mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aurelia Solitaire Diamond Ring"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-[#0e0d0b] border border-[#2b261d] rounded-xl p-3 text-[15px] sm:text-xs text-[#f5efe6] focus:outline-none focus:border-[#d4af37] placeholder:text-[#9c9484]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#9c9484] font-medium block mb-1">
                    Price ({currencySymbol}) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 185000"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full bg-[#0e0d0b] border border-[#2b261d] rounded-xl p-3 text-[15px] sm:text-xs text-[#f5efe6] focus:outline-none focus:border-[#d4af37] placeholder:text-[#9c9484]/40"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#9c9484] font-medium block mb-1">
                    Original Price
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 210000"
                    value={formOldPrice}
                    onChange={(e) => setFormOldPrice(e.target.value)}
                    className="w-full bg-[#0e0d0b] border border-[#2b261d] rounded-xl p-3 text-[15px] sm:text-xs text-[#f5efe6] focus:outline-none focus:border-[#d4af37] placeholder:text-[#9c9484]/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#9c9484] font-medium block mb-1">
                    Category
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full bg-[#0e0d0b] border border-[#2b261d] rounded-xl p-3 text-[15px] sm:text-xs text-[#f5efe6] focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="">Select</option>
                    {categories.map((cat) => (
                      <option key={cat.id || cat.slug} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#9c9484] font-medium block mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    placeholder="Auto-generated"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="w-full bg-[#0e0d0b] border border-[#2b261d] rounded-xl p-3 text-[15px] sm:text-xs text-[#f5efe6] focus:outline-none focus:border-[#d4af37] placeholder:text-[#9c9484]/40"
                  />
                </div>
              </div>

              {/* Image Input */}
              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#9c9484] font-medium block mb-1">
                  Product Image
                </label>
                <div className="flex items-center gap-3">
                  {imagePreview ? (
                    <div className="w-16 h-16 bg-[#0e0d0b] rounded-xl border border-[#2b261d] relative overflow-hidden shrink-0">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview("");
                          setFormImage("");
                        }}
                        className="absolute top-1 right-1 bg-black/80 text-white rounded-full p-0.5 text-xs"
                      >
                        <FiX />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-[#0e0d0b] rounded-xl border border-dashed border-[#2b261d] flex items-center justify-center text-[#9c9484] shrink-0">
                      <span className="material-symbols-outlined text-xl">diamond</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="text-xs text-[#9c9484] file:mr-2.5 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-[#d4af37] file:text-[#0e0d0b] file:font-semibold"
                    />
                    <input
                      type="text"
                      placeholder="Or paste image URL"
                      value={formImage}
                      onChange={(e) => {
                        setFormImage(e.target.value);
                        setImagePreview(e.target.value);
                      }}
                      className="w-full bg-[#0e0d0b] border border-[#2b261d] rounded-lg p-2 text-xs text-[#f5efe6] focus:outline-none focus:border-[#d4af37] placeholder:text-[#9c9484]/40"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#9c9484] font-medium block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Carat weight, hallmarking, metal..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-[#0e0d0b] border border-[#2b261d] rounded-xl p-2.5 text-[15px] sm:text-xs text-[#f5efe6] focus:outline-none focus:border-[#d4af37] placeholder:text-[#9c9484]/40"
                />
              </div>

              {/* Form Action Footer */}
              <div className="pt-3 border-t border-[#2b261d] flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 text-xs text-[#9c9484] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="flex-1 sm:flex-none bg-[#d4af37] text-[#0e0d0b] font-semibold text-xs py-3 px-6 rounded-xl hover:bg-[#f2ca50] transition-colors shadow-sm disabled:opacity-50 text-center"
                >
                  {isSavingProduct ? "Saving..." : editingProductId ? "Update Piece" : "Save Piece"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- ORDER DETAILS BOTTOM SHEET / MODAL ----------------- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center">
          <div className="w-full sm:max-w-lg bg-[#171511] border-t sm:border border-[#2b261d] rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-5">
            {/* Mobile Drag Handle Indicator */}
            <div className="sm:hidden w-10 h-1 bg-[#2b261d] rounded-full mx-auto my-2 shrink-0"></div>

            {/* Header */}
            <div className="px-5 py-3.5 border-b border-[#2b261d] flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#9c9484]">Order Docket</span>
                <h3 className="font-mono text-base font-bold text-[#d4af37]">#{selectedOrder.id}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-[#9c9484] hover:text-[#f5efe6] p-1.5 rounded-lg active:bg-[#0e0d0b]"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            {/* Docket Content */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Quick Status Bar */}
              <div className="flex items-center justify-between p-3 bg-[#0e0d0b] rounded-xl border border-[#2b261d]">
                <div>
                  <span className="text-[10px] uppercase text-[#9c9484] block mb-1">Status</span>
                  <select
                    value={selectedOrder.status || "Pending"}
                    onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                    className="text-xs font-semibold py-1.5 px-2.5 rounded-lg bg-[#171511] border border-[#2b261d] text-[#f5efe6] focus:outline-none cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <button
                  onClick={() => sendWhatsAppUpdate(selectedOrder)}
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 px-3.5 rounded-xl transition-colors shadow-sm"
                >
                  <FaWhatsapp className="text-sm" /> WhatsApp Update
                </button>
              </div>

              {/* Customer Delivery Details */}
              <div className="bg-[#0e0d0b] p-4 rounded-xl border border-[#2b261d] text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#9c9484]">Customer:</span>
                  <strong className="text-[#f5efe6]">{selectedOrder.customer}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9c9484]">Phone:</span>
                  <strong className="text-[#d4af37] font-mono">{selectedOrder.phone}</strong>
                </div>
                {selectedOrder.email && (
                  <div className="flex justify-between">
                    <span className="text-[#9c9484]">Email:</span>
                    <span className="text-[#f5efe6]">{selectedOrder.email}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#9c9484]">Pincode:</span>
                  <span className="text-[#f5efe6]">{selectedOrder.pincode || "—"}</span>
                </div>
                <div>
                  <span className="text-[#9c9484] block mb-0.5">Address:</span>
                  <span className="text-[#f5efe6]">{selectedOrder.address || "—"}</span>
                </div>
                {selectedOrder.notes && (
                  <div className="pt-2 border-t border-[#2b261d]">
                    <span className="text-[#9c9484] block mb-0.5">Special Instructions:</span>
                    <span className="text-[#d4af37] italic">{selectedOrder.notes}</span>
                  </div>
                )}
              </div>

              {/* Items Breakdown */}
              <div>
                <h4 className="text-[11px] uppercase tracking-wider text-[#9c9484] font-medium mb-2">
                  Itemized Pieces ({(selectedOrder.items || []).length})
                </h4>
                <div className="bg-[#0e0d0b] rounded-xl border border-[#2b261d] divide-y divide-[#2b261d]/60 text-xs">
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div key={idx} className="p-3 flex justify-between items-center">
                      <div>
                        <div className="font-medium text-[#f5efe6]">{item.title}</div>
                        <div className="text-[11px] text-[#9c9484]">Quantity: {item.qty}</div>
                      </div>
                      <span className="font-serif font-semibold text-[#d4af37]">{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="flex justify-between items-center p-3.5 bg-[#0e0d0b] rounded-xl border border-[#2b261d]">
                <span className="text-xs uppercase tracking-wider text-[#9c9484] font-medium">Total Amount</span>
                <span className="text-lg font-serif font-bold text-[#d4af37]">
                  {selectedOrder.total}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- SECURITY / PASSWORD MODAL ----------------- */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-[#171511] border border-[#2b261d] rounded-2xl shadow-2xl p-5">
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[#2b261d]">
              <h3 className="font-serif text-sm font-semibold text-[#f5efe6]">Security Credentials</h3>
              <button
                onClick={() => setShowResetModal(false)}
                className="text-[#9c9484] hover:text-[#f5efe6] p-1"
              >
                <FiX className="text-base" />
              </button>
            </div>

            {resetError && (
              <div className="mb-3 p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
                {resetError}
              </div>
            )}
            {resetSuccess && (
              <div className="mb-3 p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl">
                {resetSuccess}
              </div>
            )}

            <form onSubmit={handlePasswordReset} className="space-y-3">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#9c9484] font-medium block mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#0e0d0b] border border-[#2b261d] rounded-xl p-2.5 text-[15px] sm:text-xs text-[#f5efe6] focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#9c9484] font-medium block mb-1">
                  New Password (min 4 chars)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#0e0d0b] border border-[#2b261d] rounded-xl p-2.5 text-[15px] sm:text-xs text-[#f5efe6] focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-3 py-2 text-xs text-[#9c9484]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="bg-[#d4af37] text-[#0e0d0b] font-semibold text-xs py-2 px-4 rounded-xl hover:bg-[#f2ca50] transition-colors shadow-sm disabled:opacity-50"
                >
                  {isResetting ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
