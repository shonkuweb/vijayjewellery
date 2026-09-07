"use client";

import { ConfigProvider } from "./context/ConfigContext";
import { CartProvider } from "./context/CartContext";
import CartSidebar from "./components/CartSidebar";
import MobileBottomNav from "./components/MobileBottomNav";

export function Providers({ children }) {
  return (
    <ConfigProvider>
      <CartProvider>
        {children}
        <CartSidebar />
        <MobileBottomNav />
      </CartProvider>
    </ConfigProvider>
  );
}
