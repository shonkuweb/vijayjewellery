import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "Vijay Jewellery Collection | Bespoke High Jewelry & Certified Diamonds",
  description: "Exquisite high jewelry, certified solitaires, and handcrafted heirlooms created with uncompromising master precision.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#fdfbf9",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#fdfbf9] text-[#1a160d] font-body antialiased overflow-x-hidden selection:bg-[#f6d172]/50 selection:text-[#1a160d] pb-16 md:pb-0">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
