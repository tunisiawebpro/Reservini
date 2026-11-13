import { prisma } from '../server.js';

// Create order from cart (Checkout)
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 1. Extraire les données du body (y compris le téléphone)
    const { shippingAddress, phone, customizationNotes, paymentMethod } = req.body;

    // 2. Mettre à jour ou créer le CustomerProfile avec le téléphone
    await prisma.customerProfile.upsert({
      where: { userId: userId },
      update: { 
        phone: phone || undefined,
      },
      create: {
        userId: userId,
        phone: phone || '',
      }
    });

    // 3. Récupérer le panier de l'utilisateur
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Votre panier est vide.' });
    }

    // 4. Calculer le total et préparer les items de la commande
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of cart.items) {
      const variantPrice = item.variant ? item.variant.priceModifier : 0;
      const unitPrice = Number(item.product.basePrice) + Number(variantPrice);
      subtotal += unitPrice * item.quantity;

      orderItemsData.push({
        productId: item.productId,
        productName: item.product.name, // ✅ AJOUTÉ ICI (C'EST CE QUI MANQUAIT)
        quantity: item.quantity,
        unitPrice: unitPrice,
        customizationData: item.customizationData || {} // ✅ Le design est bien sauvegardé
      });
    }

    // 5. Calculer les frais de port (Même logique que le frontend)
    const shippingCost = subtotal > 200 ? 0 : 10;
    const total = subtotal + shippingCost;

    // 6. Générer un numéro de commande unique
    const orderNumber = `CMD-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 7. Créer la commande dans la base de données
    const order = await prisma.order.create({
      data: {
        userId,
        orderNumber,
        subtotal: subtotal,
        shippingCost: shippingCost, 
        total: total,
        shippingAddress: shippingAddress || 'Non spécifié',
        customizationNotes: customizationNotes || '',
        paymentStatus: 'PENDING', 
        status: 'PENDING',
        items: {
          create: orderItemsData
        }
      },
      include: {
        items: {
          include: { product: true }
        },
        user: {
          select: { email: true, username: true }
        }
      }
    });

    // 8. Vider le panier après la commande réussie
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    res.status(201).json({ 
      message: 'Commande créée avec succès.', 
      order 
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la création de la commande.' });
  }
};
// Get user's orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { items: true }
    });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
};
