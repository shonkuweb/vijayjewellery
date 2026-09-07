"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("vjc-vault-bag") || localStorage.getItem("diamond-nursery-cart");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        setItems([]);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("vjc-vault-bag", JSON.stringify(items));
  }, [items]);

  const addItem = (slug, qty = 1, variant = null, metadata = {}) => {
    setItems((prev) => {
      const found = prev.find((i) => i.slug === slug && i.variant === variant);
      if (found) {
        return prev.map((i) =>
          i.slug === slug && i.variant === variant ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { slug, qty, variant, ...metadata }];
    });
  };

  const updateQty = (slug, variant, qty) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => !(i.slug === slug && i.variant === variant)));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.slug === slug && i.variant === variant ? { ...i, qty } : i))
    );
  };

  const removeItem = (slug, variant) =>
    setItems((prev) => prev.filter((i) => !(i.slug === slug && i.variant === variant)));
  const clear = () => setItems([]);

  const detailedItems = useMemo(
    () =>
      items
        .map((item) => {
          const product = products.find((p) => p.slug === item.slug || p.id === item.slug);
          if (!product) {
            // Keep item with stored metadata if product is not yet loaded
            if (item.title && item.price) return item;
            return null;
          }
          let price = product.price;
          return {
            ...product,
            ...item,
            title: item.title || product.title,
            qty: item.qty,
            variant: item.variant,
            price: item.price || price,
            image: item.image || product.image,
          };
        })
        .filter(Boolean),
    [items, products]
  );

  return (
    <CartContext.Provider
      value={{
        items: detailedItems,
        addItem,
        updateQty,
        removeItem,
        clear,
        products,
        productsLoading,
        categories,
        categoriesLoading,
        refreshProducts: fetchProducts,
        refreshCategories: fetchCategories,
        isSidebarOpen,
        setIsSidebarOpen,
        isMenuOpen,
        setIsMenuOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
