/* ==========================================================================
   NOVAFLOW — Shared Navigation & Global Interactions
   ========================================================================== */

/**
 * Scroll to top / reveal on scroll
 */
function initScrollEffects() {
  const header = document.querySelector('.header');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (header) {
      if (currentScroll > 100) {
        header.style.boxShadow = 'var(--color-shadow-md)';
      } else {
        header.style.boxShadow = 'none';
      }
    }
    lastScroll = currentScroll;
  });
}

/**
 * Active nav link highlighting based on current page
 */
function setActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.style.color = 'var(--color-primary)';
      link.style.fontWeight = '600';
    }
  });
}

/**
 * Smooth reveal animation for elements with .reveal class
 */
function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

/**
 * DOM Ready
 */
document.addEventListener('DOMContentLoaded', () => {
  initComponents();
  setActiveNav();
  initScrollEffects();
  initReveal();
});