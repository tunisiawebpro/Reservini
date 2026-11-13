import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../server.js';
import { sendVerificationEmail } from '../utils/email.js';

// ==========================================
// 1. REGISTER
// ==========================================
export const register = async (req, res) => {
  try {
    const { email, username, password, fullName, phone } = req.body;

    // 1. Nettoyage des données (Enlever les espaces vides)
    const cleanEmail = email ? email.trim().toLowerCase() : null;
    const cleanUsername = username ? username.trim() : null;
    const cleanFullName = fullName && fullName.trim() !== '' ? fullName.trim() : (username ? username.trim() : 'Client');
    const cleanPhone = phone && phone.trim() !== '' ? phone.trim() : null;

    console.log('📥 Données reçues:', { cleanEmail, cleanUsername, cleanFullName, cleanPhone });

    if (!cleanEmail || !cleanUsername || !password) {
      return res.status(400).json({ error: 'Email, Username et Mot de passe sont obligatoires.' });
    }

    // 2. Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email: cleanEmail }, { username: cleanUsername }] }
    });
    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.email === cleanEmail ? 'Email déjà enregistré.' : 'Nom d\'utilisateur déjà pris.'
      });
    }

    // 3. Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, 12);

    // 4. Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        username: cleanUsername,
        passwordHash,
        role: 'CUSTOMER',
        profile: {
          create: { 
            businessName: cleanFullName, // Prisma exige une valeur non-vide si le champ est requis
            phone: cleanPhone            // Prisma exige null si le champ est vide et optionnel
          }
        }
      },
      include: { profile: true }
    });

    // 5. Générer le token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Inscription réussie.',
      token,
      user: { id: user.id, email: user.email, username: user.username, role: user.role, profile: user.profile }
    });
  } catch (error) {
    // ⚠️ HOUNI L MAGIE : On affiche l'erreur EXACTE de Prisma dans le terminal
    console.error('❌ ERREUR PRISMA EXACTE:');
    console.error(error.message); 
    console.error('--- Détails ---');
    console.error(error.meta || error.code);
    
    res.status(500).json({ error: 'Erreur serveur. Voir le terminal pour les détails.' });
  }
};

// ==========================================
// 2. LOGIN
// ==========================================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : null;

    // 1. Log exact de ce que le backend reçoit (avant et après normalisation)
    console.log('📥 [BACKEND] Requête de login reçue pour l\'email :', `"${email}"`, '| normalisé :', `"${cleanEmail}"`);

    // 2. Recherche insensible à la casse (email stocké en minuscules à l'inscription)
    const user = await prisma.user.findUnique({ 
      where: { email: cleanEmail },
      include: { profile: true } 
    });
    
    if (!user) {
      // 3. Si échec, on le dit clairement dans le terminal
      console.log('❌ [BACKEND] ÉCHEC : Aucun utilisateur trouvé avec cet email exact dans la base de données.');
      return res.status(401).json({ error: 'Email ou mot de passe invalide.' });
    }

    console.log('✅ [BACKEND] Utilisateur trouvé. Vérification du mot de passe...');

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValidPassword) {
      console.log('❌ [BACKEND] ÉCHEC : Mot de passe incorrect pour cet utilisateur.');
      return res.status(401).json({ error: 'Email ou mot de passe invalide.' });
    }

    console.log('🔓 [BACKEND] Connexion réussie !');

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Connexion réussie.',
      token,
      user: { id: user.id, email: user.email, username: user.username, role: user.role, profile: user.profile }
    });
  } catch (error) {
    console.error('❌ [BACKEND] Erreur serveur lors du login:', error);
    res.status(500).json({ error: 'Échec de la connexion.' });
    }
};

// ==========================================
// 3. LOGOUT
// ==========================================
export const logout = async (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Déconnexion réussie.' });
};

// ==========================================
// 4. GET CURRENT USER
// ==========================================
export const getCurrentUser = async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      username: req.user.username,
      role: req.user.role,
      profile: req.user.profile
    }
  });
};

// ==========================================
// 5. FORGOT PASSWORD (Envoyer le code)
// ==========================================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Aucun compte trouvé avec cet email.' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: { resetCode: code, resetCodeExpires: expires }
    });

    await sendVerificationEmail(email, 'Réinitialisation de mot de passe', code, 'Code de réinitialisation');
    res.json({ message: 'Code envoyé à votre email.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// ==========================================
// 6. VERIFY RESET CODE
// ==========================================
export const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || user.resetCode !== code || new Date() > user.resetCodeExpires) {
      return res.status(400).json({ error: 'Code invalide ou expiré.' });
    }
    res.json({ message: 'Code vérifié.', userId: user.id });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// ==========================================
// 7. RESET PASSWORD
// ==========================================
export const resetPassword = async (req, res) => {
  try {
    const { userId, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 12);
    
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash, resetCode: null, resetCodeExpires: null }
    });
    res.json({ message: 'Mot de passe mis à jour avec succès.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// ==========================================
// 8. UPDATE PROFILE (Username + Initier changement email)
// ==========================================
export const updateProfile = async (req, res) => {
  try {
    const { username, newEmail } = req.body;
    const userId = req.user.id;
    const updateData = {};

    if (username) updateData.username = username;

    if (newEmail && newEmail !== req.user.email) {
      const exists = await prisma.user.findUnique({ where: { email: newEmail } });
      if (exists) return res.status(400).json({ error: 'Cet email est déjà utilisé.' });

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 5 * 60 * 1000);

      await prisma.user.update({
        where: { id: userId },
        data: { 
          pendingEmail: newEmail, 
          emailChangeCode: code, 
          emailChangeCodeExpires: expires 
        }
      });

      await sendVerificationEmail(newEmail, 'Vérification de votre nouvel email', code, 'Confirmez votre email');
      return res.json({ message: 'Code de vérification envoyé au nouvel email.', requiresVerification: true });
    }

    await prisma.user.update({ where: { id: userId }, data: updateData });
    const updatedUser = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
    res.json({ message: 'Profil mis à jour.', user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// ==========================================
// 9. VERIFY EMAIL CHANGE
// ==========================================
export const verifyEmailChange = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.emailChangeCode !== code || new Date() > user.emailChangeCodeExpires) {
      return res.status(400).json({ error: 'Code invalide ou expiré.' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { 
        email: user.pendingEmail, 
        pendingEmail: null, 
        emailChangeCode: null, 
        emailChangeCodeExpires: null 
      }
    });

    const updatedUser = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
    res.json({ message: 'Email mis à jour avec succès.', user: updatedUser });
  } catch (error) {
    console.error('Verify email change error:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};