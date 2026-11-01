/* ==========================================================================
   NOVAFLOW — Interactive Demo / Lab
   ========================================================================== */

// Demo product catalog
const DEMO_PRODUCTS = [
  {
    id: 'starter-plan',
    name: 'Starter Plan',
    price: 19,
    description: 'Perfect for small teams getting started',
    icon: '🚀',
  },
  {
    id: 'pro-plan',
    name: 'Pro Plan',
    price: 49,
    description: 'Advanced features for growing teams',
    icon: '📈',
  },
  {
    id: 'enterprise-plan',
    name: 'Enterprise Plan',
    price: 99,
    description: 'Full suite for large organizations',
    icon: '🏢',
  },
  {
    id: 'addon-support',
    name: 'Priority Support',
    price: 29,
    description: '24/7 priority support access',
    icon: '🎧',
  },
  {
    id: 'addon-training',
    name: 'Team Training',
    price: 79,
    description: 'Onboarding and training sessions',
    icon: '📚',
  },
];

let cart = [];

// DOM Elements
const demoGrid = document.getElementById('demo-grid');
const cartItemsEl = document.getElementById('cart-items');
const cartEmptyEl = document.getElementById('cart-empty');
const cartTotalEl = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const clearBtn = document.getElementById('clear-cart');

// Initialize demo
function initDemo() {
  renderProducts();
  renderCart();

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', handleCheckout);
  }
  if (clearBtn) {
    clearBtn.addEventListener('click', handleClearCart);
  }
}

// Render product cards
function renderProducts() {
  if (!demoGrid) return;

  demoGrid.innerHTML = DEMO_PRODUCTS.map((product) => `
    <div class="demo-item">
      <div class="demo-item-info">
        <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-1);">
          <span style="font-size:var(--font-size-lg);">${product.icon}</span>
          <h4>${product.name}</h4>
        </div>
        <p>${product.description}</p>
        <div style="font-size:var(--font-size-sm);font-weight:var(--font-weight-semibold);color:var(--color-text);margin-top:var(--space-2);">
          ${formatCurrency(product.price)}
        </div>
      </div>
      <div class="demo-item-actions">
        <button class="btn btn-sm btn-primary" data-add-to-cart="${product.id}" data-name="${product.name}" data-price="${product.price}">
          Add
        </button>
      </div>
    </div>
  `).join('');

  // Attach add-to-cart listeners
  demoGrid.querySelectorAll('[data-add-to-cart]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = btn.getAttribute('data-add-to-cart');
      const name = btn.getAttribute('data-name');
      const price = parseFloat(btn.getAttribute('data-price'));
      addToCartDemo(id, name, price);
    });
// Add to cart
function addToCartDemo(id, name, price) {
  const existing = cart.find((item) => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, qty: 1 });
  }
  renderCart();
  showNotification(`${name} added to cart`);
}

// Remove from cart
function removeFromCartDemo(id) {
  cart = cart.filter((item) => item.id !== id);
  renderCart();
}

// Update quantity
function updateQtyDemo(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCartDemo(id);
    return;
  }
  renderCart();
}

// Render cart
function renderCart() {
  if (!cartItemsEl || !cartTotalEl) return;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = '';
    cartEmptyEl.style.display = 'block';
    cartTotalEl.textContent = formatCurrency(0);
    checkoutBtn.disabled = true;
    return;
  }

  cartEmptyEl.style.display = 'none';
  cartItemsEl.innerHTML = cart.map((item) => `
    <div class="cart-item">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>${formatCurrency(item.price)} each</p>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn" data-qty-down="${item.id}" aria-label="Decrease quantity">−</button>
        <span style="font-size:var(--font-size-sm);font-weight:var(--font-weight-medium);">${item.qty}</span>
        <button class="qty-btn" data-qty-up="${item.id}" aria-label="Increase quantity">+</button>
      </div>
    </div>
  `).join('');

  // Attach quantity listeners
  cartItemsEl.querySelectorAll('[data-qty-down]').forEach((btn) => {
    btn.addEventListener('click', () => updateQtyDemo(btn.getAttribute('data-qty-down'), -1));
  });
  cartItemsEl.querySelectorAll('[data-qty-up]').forEach((btn) => {
    btn.addEventListener('click', () => updateQtyDemo(btn.getAttribute('data-qty-up'), 1));
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  cartTotalEl.textContent = formatCurrency(total);
  checkoutBtn.disabled = false;
}
  });
// Handle checkout
function handleCheckout() {
  if (cart.length === 0) return;
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  alert(`Thank you for your purchase!\nTotal: ${formatCurrency(total)}\n\nYour order has been placed.`);
  cart = [];
  renderCart();
}

// Handle clear cart
function handleClearCart() {
  cart = [];
  renderCart();
  showNotification('Cart cleared');
}

// Notification
function showNotification(message) {
  const existing = document.querySelector('.demo-notification');
  if (existing) existing.remove();

  const notif = document.createElement('div');
  notif.className = 'alert alert-success demo-notification';
  notif.textContent = message;
  notif.style.position = 'fixed';
  notif.style.top = '90px';
  notif.style.right = '20px';
  notif.style.zIndex = '1000';
  notif.style.minWidth = '250px';
  notif.style.boxShadow = 'var(--color-shadow-lg)';

  document.body.appendChild(notif);

  setTimeout(() => {
    notif.style.opacity = '0';
    notif.style.transition = 'opacity 0.3s ease';
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

// Format currency helper
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', initDemo);
}