const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Initializing database setup...');

  // Ensure default site configuration exists
  const configFilePath = path.join(__dirname, '..', 'app', 'data', 'site-config.json');
  let configStr = JSON.stringify({
    brand: {
      name: "VIJAY JEWELLERY COLLECTION",
      subname: "Atelier Vijay & Co. — Est. 1994",
      tagline: "Thirty Years of Haute Joaillerie & Bespoke Artistry",
      logoImage: "",
      currency: "₹",
      established: "1994"
    },
    contact: {
      phone: "+91 73190 64254",
      whatsapp: "917319064254",
      email: "concierge@vijayjewellery.com",
      address: "Park Street Salon & Atelier, Kolkata, West Bengal, India"
    },
    theme: {
      primaryColor: "#b8860b",
      primaryContainer: "#f6d172",
      backgroundColor: "#fdfbf9",
      textColor: "#1a160d",
      preset: "light-gold"
    },
    hero: {
      badge: "30 YEARS OF HAUTE JOAILLERIE • EST. 1994",
      title: "Crafting Royal Heirlooms for Three Decades",
      subtitle: "Since 1994, Vijay Jewellery Collection has embodied uncompromising goldsmithing mastery—creating certified solitaires, antique polki chokers, and bespoke bridal treasures that endure across generations.",
      ctaText: "Explore The Vault",
      ctaLink: "#catalog-section",
      backgroundImage: "https://pub-ce8688bc6c654bcfb99716f7c9373bcd.r2.dev/vj-jewellery/hero-banner-1788783087695.png",
      bannerImage: "https://pub-ce8688bc6c654bcfb99716f7c9373bcd.r2.dev/vj-jewellery/hero-banner-1788783087695.png"
    },
    collections: [],
    craftsmanship: {
      badge: "Three Decades of Living Heritage",
      title: "The Soul of Bengali Goldsmithing",
      quote: "True luxury is not manufactured; it is sculpted with reverence. For thirty years, our atelier karigars have preserved ancestral goldsmithing secrets—uniting unyielding diamond brilliance with timeless hallmarked gold.",
      highlights: [
        "30+ Years Atelier Heritage",
        "100% GIA & IGI Certified Gems",
        "BIS 916 Pure Hallmarked Gold",
        "Armored White-Glove Courier"
      ]
    },
    footer: {
      aboutText: "Custodians of royal Indian jewelry art since 1994. Every gemstone is ethically sourced, rigorously authenticated, and set by master goldsmiths in our Kolkata atelier.",
      copyright: "VIJAY JEWELLERY COLLECTION • ALL RIGHTS RESERVED."
    }
  }, null, 2);

  if (fs.existsSync(configFilePath)) {
    try {
      configStr = fs.readFileSync(configFilePath, 'utf8');
    } catch (err) {}
  }

  await prisma.siteConfig.upsert({
    where: { id: 'default' },
    update: { config: configStr },
    create: { id: 'default', config: configStr },
  });
  console.log('✓ Initialized site configuration.');

  // Ensure default admin user exists
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
  await prisma.adminUser.upsert({
    where: { id: 'admin' },
    update: { password: adminPassword },
    create: { id: 'admin', password: adminPassword },
  });
  console.log('✓ Initialized admin user authentication.');

  console.log('Database initialized: 0 products and 0 categories by default.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
