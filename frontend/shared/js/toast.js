// ============================================
// PROFESSIONAL TOAST SYSTEM
// ============================================

const ToastTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};

const ToastIcons = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠'
};

const ToastStyles = {
  success: 'background: var(--color-success); color: white;',
  error: 'background: var(--color-error); color: white;',
  info: 'background: var(--color-mauve-dark); color: white;',
  warning: 'background: #d4a574; color: white;'
};

export function showToast(message, type = ToastTypes.SUCCESS, duration = 4000) {
  // Créer le conteneur si inexistant
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  // Créer le toast
  const toast = document.createElement('div');
  toast.style.cssText = `
    ${ToastStyles[type]}
    padding: 14px 20px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.9rem;
    font-weight: 500;
    min-width: 280px;
    max-width: 400px;
    pointer-events: auto;
    animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.2);
  `;

  toast.innerHTML = `
    <span style="font-size: 1.2rem; font-weight: bold;">${ToastIcons[type]}</span>
    <span style="flex: 1;">${message}</span>
    <button onclick="this.parentElement.remove()" style="background: transparent; border: none; color: white; cursor: pointer; font-size: 1.2rem; padding: 0 5px;">✕</button>
  `;

  container.appendChild(toast);

  // Ajouter l'animation CSS si pas déjà fait
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(120%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(120%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  // Auto-remove
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Helper : Toast avec action (bouton cliquable)
export function showToastWithAction(message, actionText, actionCallback, type = ToastTypes.SUCCESS) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed; top: 100px; right: 20px; z-index: 9999;
      display: flex; flex-direction: column; gap: 10px; pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.style.cssText = `
    ${ToastStyles[type]}
    padding: 14px 20px; border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    display: flex; align-items: center; gap: 12px;
    font-size: 0.9rem; font-weight: 500;
    min-width: 320px; max-width: 450px;
    pointer-events: auto;
    animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  `;

  toast.innerHTML = `
    <span style="font-size: 1.2rem;">${ToastIcons[type]}</span>
    <span style="flex: 1;">${message}</span>
    <button class="toast-action-btn" style="background: rgba(255,255,255,0.2); border: none; color: white; cursor: pointer; padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 0.85rem;">${actionText}</button>
  `;

  container.appendChild(toast);
  toast.querySelector('.toast-action-btn').addEventListener('click', () => {
    actionCallback();
    toast.remove();
  });

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 6000);
}