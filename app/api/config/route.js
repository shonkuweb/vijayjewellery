import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

const DEFAULT_CONFIG = {
  brand: {
    name: "VIJAY JEWELLERY COLLECTION",
    subname: "Atelier Vijay & Co. — Est. 1994",
    tagline: "Thirty Years of Haute Joaillerie & Bespoke Artistry",
    logoImage: "",
    currency: "₹",
    established: "1994",
  },
  contact: {
    phone: "+91 73190 64254",
    whatsapp: "917319064254",
    email: "concierge@vijayjewellery.com",
    address: "Park Street Salon & Atelier, Kolkata, West Bengal, India",
  },
  theme: {
    primaryColor: "#b8860b",
    primaryContainer: "#f6d172",
    backgroundColor: "#fdfbf9",
    textColor: "#1a160d",
    preset: "light-gold",
  },
  hero: {
    badge: "30 YEARS OF HAUTE JOAILLERIE • EST. 1994",
    title: "Crafting Royal Heirlooms for Three Decades",
    subtitle: "Since 1994, Vijay Jewellery Collection has embodied uncompromising goldsmithing mastery—creating certified solitaires, antique polki chokers, and bespoke bridal treasures that endure across generations.",
    ctaText: "Explore The Collection",
    ctaLink: "#catalog-section",
    backgroundImage: "https://pub-ce8688bc6c654bcfb99716f7c9373bcd.r2.dev/vj-jewellery/hero-banner-1788783087695.png",
    bannerImage: "https://pub-ce8688bc6c654bcfb99716f7c9373bcd.r2.dev/vj-jewellery/hero-banner-1788783087695.png",
    mobileBannerImage: "https://pub-ce8688bc6c654bcfb99716f7c9373bcd.r2.dev/vj-jewellery/hero-banner-mobile-1788783667118.jpg",
  },
  collections: [
    {
      id: "high-jewelry",
      tag: "Haute Joaillerie",
      title: "The Sovereign Collection",
      description: "Rare D-Flawless certified solitaires, investment diamonds, and articulated platinum masterworks.",
      icon: "diamond",
    },
    {
      id: "bespoke-creations",
      tag: "Custom Commissions",
      title: "Bespoke Bridal Salon",
      description: "Individually commissioned engagement solitaires and bridal suites tailored to your family crest.",
      icon: "architecture",
    },
    {
      id: "heritage-pieces",
      tag: "Royal Bengal Heritage",
      title: "Imperial Antiques & Polki",
      description: "Syndicate uncut polki diamonds, natural Zambian emeralds, and intricate 22K Bengal filigree.",
      icon: "history",
    },
  ],
  craftsmanship: {
    badge: "Three Decades of Living Heritage",
    title: "The Soul of Bengali Goldsmithing",
    quote: "Every piece is a testament to uncompromising craftsmanship. Our master artisans blend centuries-old techniques with modern precision to create heirlooms that transcend time.",
    highlights: [
      "30+ Years Atelier Heritage",
      "100% GIA & IGI Certified Gems",
      "BIS 916 Pure Hallmarked Gold",
      "Armored White-Glove Courier",
    ],
  },
  footer: {
    aboutText: "Custodians of royal Indian jewelry art since 1994. Every gemstone is ethically sourced, rigorously authenticated, and set by master goldsmiths in our Kolkata atelier.",
    copyright: "VIJAY JEWELLERY COLLECTION • ALL RIGHTS RESERVED.",
  },
};

export async function GET() {
  try {
    const record = await prisma.siteConfig.findUnique({
      where: { id: 'default' },
    });

    if (record && record.config) {
      try {
        return NextResponse.json(JSON.parse(record.config));
      } catch (err) {
        console.error('Error parsing site config JSON:', err);
      }
    }

    return NextResponse.json(DEFAULT_CONFIG);
  } catch (error) {
    console.error('Failed to fetch site config from database:', error);
    return NextResponse.json(DEFAULT_CONFIG);
  }
}

export async function PUT(request) {
  try {
    const updatedConfig = await request.json();

    const existingRecord = await prisma.siteConfig.findUnique({
      where: { id: 'default' },
    });

    let current = DEFAULT_CONFIG;
    if (existingRecord && existingRecord.config) {
      try {
        current = JSON.parse(existingRecord.config);
      } catch (err) {}
    }

    const merged = { ...current, ...updatedConfig };
    const mergedStr = JSON.stringify(merged, null, 2);

    await prisma.siteConfig.upsert({
      where: { id: 'default' },
      update: { config: mergedStr },
      create: { id: 'default', config: mergedStr },
    });

    return NextResponse.json({ success: true, config: merged });
  } catch (error) {
    console.error('Failed to update site config:', error);
    return NextResponse.json({ error: 'Failed to update configuration' }, { status: 500 });
  }
}
