import express from 'express';
import { prisma } from '../server.js';
import { requireAdmin } from '../middleware/admin.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// 🔒 HADHI MAHIYYA Koul les routes fel fichier (Ma 7ajtekch tzidha lkol wa7dou)
router.use(requireAdmin);

// 1. Dashboard Stats
router.get('/stats', async (req, res) => {
  try {
    const [totalOrders, totalUsers, totalRevenue, pendingOrders] = await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { total: true } }),
      prisma.order.count({ where: { paymentStatus: 'PENDING' } })
    ]);

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true, username: true } } }
    });

    res.json({
      stats: { 
        totalOrders, 
        totalUsers, 
        totalRevenue: parseFloat(totalRevenue._sum.total || 0), 
        pendingOrders 
      },
      recentOrders
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// 2. Liste des commandes (Avec Téléphone et Détails)
router.get('/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { 
          select: { 
            email: true, 
            username: true, 
            profile: { select: { phone: true, businessName: true } } 
          } 
        },
        items: { 
          include: { product: true } 
        }
      }
    });
    res.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// 3. Workflow Professionnel : Accepter ➔ Confirmer ➔ Payé
router.patch('/orders/:id/workflow', async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const orderId = req.params.id;

    // 1. Mettre à jour la commande
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        ...(status && { status }), 
        ...(paymentStatus && { paymentStatus }) 
      },
      include: {
        user: { select: { email: true, username: true, profile: { select: { businessName: true } } } },
        items: { include: { product: true } }
      }
    });

    // 2. ✅ ENVOI D'EMAIL AUTOMATIQUE KI N3MLOU "ACCEPTER"
    if (status === 'ACCEPTED') {
      try {
        // On importe dynamiquement pour éviter les erreurs si le fichier n'existe pas encore
        const { sendOrderAcceptedEmail } = await import('../utils/email.js');
        await sendOrderAcceptedEmail(
          updatedOrder.user.email,
          updatedOrder.orderNumber,
          updatedOrder.user.profile?.businessName || 'Client'
        );
        console.log(`✅ Email d'acceptation envoyé à ${updatedOrder.user.email}`);
      } catch (emailError) {
        console.error('❌ Erreur envoi email (Vérifiez le fichier utils/email.js):', emailError.message);
        // On ne bloque pas la requête, on log juste l'erreur
      }
    }

    res.json({ message: 'Statut mis à jour avec succès', order: updatedOrder });
  } catch (error) {
    console.error('Workflow error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut.' });
  }
});

// 4. Supprimer une commande
router.delete('/orders/:id', async (req, res) => {
  try {
    await prisma.order.delete({ where: { id: req.params.id } });
    res.json({ message: 'Commande supprimée avec succès.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// 5. Liste des utilisateurs
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: { profile: true, _count: { select: { orders: true } } }
    });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// 6. Supprimer un utilisateur
router.delete('/users/:id', async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'Utilisateur supprimé avec succès.' });
  } catch (error) {
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        error: 'Impossible de supprimer cet utilisateur car il possède des données associées (ex: commandes).' 
      });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }
    res.status(500).json({ error: 'Erreur serveur lors de la suppression.' });
  }
});

// 7. Créer un utilisateur (Admin)
router.post('/users', async (req, res) => {
  try {
    const { email, username, password, fullName, role } = req.body;
    const passwordHash = await bcrypt.hash(password, 12);
    
    const user = await prisma.user.create({
      data: {
        email, 
        username, 
        passwordHash,
        role: role || 'CUSTOMER',
        profile: { create: { businessName: fullName || username } }
      },
      include: { profile: true }
    });
    res.status(201).json({ user, message: 'Utilisateur créé.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Changer le rôle d'un utilisateur (Promouvoir Admin)
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      include: { profile: true }
    });
    res.json({ user, message: 'Rôle mis à jour.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// 9. Liste des produits
router.get('/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { variants: true }
    });
    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// 10. Créer un produit
router.post('/products', async (req, res) => {
  try {
    const { name, slug, description, basePrice, sku, stock, isActive, image } = req.body;
    
    const product = await prisma.product.create({
      data: {
        name, slug, description,
        basePrice: parseFloat(basePrice),
        sku, stock: parseInt(stock), isActive: isActive === true,
        image: image || null
      }
    });
    res.json({ product, message: 'Produit créé avec succès.' });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur.' });
  }
});

// 11. Modifier un produit
router.patch('/products/:id', async (req, res) => {
  try {
    const { name, description, basePrice, stock, isActive, image } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (basePrice !== undefined) updateData.basePrice = parseFloat(basePrice);
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (isActive !== undefined) updateData.isActive = isActive;
    if (image !== undefined) updateData.image = image;

    const product = await prisma.product.update({ where: { id: req.params.id }, data: updateData });
    res.json({ product, message: 'Produit mis à jour.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 12. Supprimer un produit
router.delete('/products/:id', async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: 'Produit supprimé.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

export default router;