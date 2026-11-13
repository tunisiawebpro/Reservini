import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample products
  const products = await Promise.all([
    // Produit 1 : L'ancien produit de test (optionnel, tu peux le garder ou le supprimer)
    prisma.product.upsert({
      where: { slug: 'nfc-qr-table-card-standard' },
      update: {},
      create: {
        name: 'NFC + QR Table Card - Standard',
        slug: 'nfc-qr-table-card-standard',
        description: 'Premium NFC-enabled table card with QR code. Matte black finish with lime foil branding.',
        basePrice: 15.00,
        sku: 'RES-NFC-STD-001',
        stock: 100,
        isActive: true,
        variants: {
          create: [
            { finish: 'Matte', color: 'Noir Lime', priceModifier: 0 },
            { finish: 'Glossy', color: 'Noir Lime', priceModifier: 2 },
            { finish: 'Matte', color: 'Ivory Editorial', priceModifier: 0 }
          ]
        }
      }
    }),

    // Produit 2 : Carte seule (10 DT)
    prisma.product.upsert({
      where: { slug: 'carte-nfc-qr' },
      update: {},
      create: {
        name: 'Carte NFC + QR',
        slug: 'carte-nfc-qr',
        description: 'La carte physique premium pour vos tables. Finition mate ou brillante, puce NFC intégrée et QR code gravé.',
        basePrice: 10.00,
        sku: 'RES-CARD-ONLY',
        stock: 500,
        isActive: true
      }
    }),

    // Produit 3 : Pack Complet (300 DT)
    prisma.product.upsert({
      where: { slug: 'pack-complet' },
      update: {},
      create: {
        name: 'Pack Complet : Carte + Platform',
        slug: 'pack-complet',
        description: 'L\'écosystème complet. Recevez vos cartes physiques premium ET accédez à notre platforme Reservini.',
        basePrice: 300.00,
        sku: 'RES-FULL-PACK',
        stock: 50,
        isActive: true
      }
    })
  ]);

  console.log(`✅ Created ${products.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

  // Créer un admin par défaut
const adminPassword = await bcrypt.hash('admin123', 12);
await prisma.user.upsert({
  where: { email: 'admin@reservini.com' },
  update: {},
  create: {
    email: 'admin@reservini.com',
    username: 'admin',
    passwordHash: adminPassword,
    role: 'ADMIN',
    profile: {
      create: {
        businessName: 'Reservini Admin',
        phone: '+21600000000'
      }
    }
  }
});
console.log('✅ Admin créé: admin@reservini.com / admin123');