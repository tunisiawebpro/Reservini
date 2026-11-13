import { prisma } from '../server.js';

// Get user's cart
export const getCart = async (req, res) => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: { product: { include: { variants: true } } }
        }
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.id },
        include: { items: { include: { product: { include: { variants: true } } } } }
      });
    }

    res.json({ cart });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Failed to fetch cart.' });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { productId, variantId, quantity, customizationData } = req.body;

    if (!Number.isSafeInteger(quantity) || quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be a positive whole number.' });
    }

    // 🔍 Recherche robuste : d'abord par id, puis par slug
    // (le frontend studio envoie un slug comme productId)
    let product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });
    if (!product) {
      product = await prisma.product.findUnique({
        where: { slug: productId },
        include: { variants: true },
      });
    }

    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Product not found or inactive.' });
    }

    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: true },
    });

    const requestedCustomization = customizationData || {};
    const existingItem = cart?.items.find(item =>
      item.productId === product.id &&
      item.variantId === (variantId || null) &&
      JSON.stringify(item.customizationData || {}) === JSON.stringify(requestedCustomization)
    );
    const resultingQuantity = (existingItem?.quantity || 0) + quantity;

    if (product.slug === 'carte-nfc-qr' && resultingQuantity < 5) {
      return res.status(400).json({ error: 'La commande minimum est de 5 cartes.' });
    }

    if (product.stock < resultingQuantity) {
      return res.status(400).json({ error: 'Insufficient stock.' });
    }

    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: req.user.id }, include: { items: true } });
    }

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
          customizationData: requestedCustomization
        }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          variantId: variantId || null,
          quantity,
          customizationData: requestedCustomization,
        }
      });
    }

    res.json({ message: 'Item added to cart successfully.' });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add item to cart.' });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    await prisma.cartItem.delete({ where: { id: itemId } });
    res.json({ message: 'Item removed from cart.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove item.' });
  }
};
