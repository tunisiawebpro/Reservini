// ============================================
// RESERVINI — SHARED APP LOGIC
// ============================================

const API_URL = 'http://127.0.0.1:5000/api/v1';

// ============================================
// AUTH STATE
// ============================================
export const auth = {
  getToken: () => localStorage.getItem('reservini_token'),
  getUser: () => {
    const user = localStorage.getItem('reservini_user');
    return user ? JSON.parse(user) : null;
  },
  setSession: (token, user) => {
    localStorage.setItem('reservini_token', token);
    localStorage.setItem('reservini_user', JSON.stringify(user));
  },
  clearSession: () => {
    localStorage.removeItem('reservini_token');
    localStorage.removeItem('reservini_user');
  },
  isLoggedIn: () => !!auth.getToken(),
  
    async fetch(endpoint, options = {}) {
    const token = auth.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await res.json();
      if (!res.ok) {
        // Si le backend dit "Token invalide" ou "Expired", on peut nettoyer
        if (res.status === 401 && endpoint !== '/auth/me') {
           // Optionnel: auth.clearSession(); 
        }
        throw new Error(data.error || `Erreur ${res.status}`);
      }
      return data;
    } else {
      const text = await res.text();
      throw new Error(`Erreur Serveur (${res.status})`);
    }
  },
  
    async checkStatus() {
    const token = auth.getToken();
    const localUser = auth.getUser();
    
    // 1. Si pas de token du tout, pas connecté
    if (!token) return null;
    
    // 2. Si on a déjà les infos en local, on les affiche direct (Rapide !)
    // On ne bloque pas l'utilisateur si le backend est lent
    if (localUser) {
      // On essaie de mettre à jour en arrière-plan sans bloquer
      auth.fetch('/auth/me').then(data => {
        if (data.user) auth.setSession(token, data.user);
      }).catch(() => {
        // Si erreur, on ne fait rien, on garde le localUser
      });
      return localUser;
    }
    
    // 3. Si on a le token mais pas le user (1er chargement), on demande au backend
    try {
      const data = await auth.fetch('/auth/me');
      auth.setSession(token, data.user);
      return data.user;
    } catch (e) {
      // IMPORTANT : On ne déconnecte PAS l'utilisateur sauf si le token est EXPIRÉ (401)
      if (e.message && e.message.includes('401')) {
        auth.clearSession();
      }
      // Sinon, on retourne null mais on garde le token au cas où
      return null; 
    }
  },
};

// ============================================
// PAGE TRANSITIONS
// ============================================
export function initPageTransitions() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    
    const href = link.getAttribute('href');
    
    // Ignore external links, anchors, mailto, etc.
    if (!href || href.startsWith('#') || href.startsWith('http') || 
        href.startsWith('mailto:') || href.startsWith('tel:') ||
        link.target === '_blank') return;
    
    // Same page anchor
    if (href.startsWith('/') && window.location.pathname === href) return;
    
    e.preventDefault();
    document.body.classList.add('page-leaving');
    
    setTimeout(() => {
      window.location.href = href;
    }, 280);
  });
  
  // Animate page in
  document.body.classList.add('page-transition');
}

// ============================================
// NAVIGATION
// ============================================
export function initNavigation() {
  const nav = document.getElementById('nav');
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');
  
  // Scroll effect
  window.addEventListener('scroll', () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 30);
  });
  
  // Mobile menu
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });
  }

  // 🎯 Cacher "Compte" pour les admins (le remplacer par "Admin")
  const user = auth.getUser();
  if (user && user.role === 'ADMIN') {
    const compteLink = navLinks?.querySelector('a[href="/account.html"]');
    if (compteLink) {
      compteLink.textContent = 'Admin';
      compteLink.href = '/admin.html';
      compteLink.style.color = 'var(--color-mauve-dark)';
      compteLink.style.fontWeight = '600';
    }
  }
}

// ============================================
// AUTH UI
// ============================================
export async function initAuthUI() {
  const authContainer = document.getElementById('authContainer');
  if (!authContainer) return;
  
  const user = await auth.checkStatus();
  
  if (user) {
    // Déterminer le nom à afficher
    const displayName = user.profile?.businessName || user.username || 'Client';
    const initials = getInitials(displayName);
    
    // 🎯 C'est ici la magie : Si c'est un ADMIN, on le redirige vers admin.html
    const profileLink = user.role === 'ADMIN' ? '/admin.html' : '/account.html';
    
    authContainer.innerHTML = `
      <a href="${profileLink}" class="user-badge" title="${user.role === 'ADMIN' ? 'Panneau d\'administration' : 'Mon compte'}">
        <div class="user-avatar">${initials}</div>
        <span class="user-name">${displayName}</span>
      </a>
    `;
  } else {
    authContainer.innerHTML = `
      <a href="/login.html" class="nav-cta">Connexion</a>
    `;
  }
}

function getInitials(name) {
  return name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
export function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  
  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
}

// ============================================
// INIT ALL
// ============================================
export function initApp() {
  initPageTransitions();
  initNavigation();
  initAuthUI();
  initScrollAnimations();
}