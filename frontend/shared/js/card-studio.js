// frontend/js/card-studio.js
import { api } from './api.js';

// State
const state = {
  productId: 'PLACEHOLDER_ID', // سنجلب هذا من الـ Backend لاحقاً
  restaurantName: 'Café Lumière',
  tableNumber: '08',
  color: 'matte',
  quantity: 10,
  basePrice: 15.00, // سعر افتراضي، سيتم جلبه من الـ API
  logoFile: null
};

// DOM Elements
const els = {
  inputRestaurant: document.getElementById('input-restaurant'),
  inputTable: document.getElementById('input-table'),
  selectColor: document.getElementById('select-color'),
  inputLogo: document.getElementById('input-logo'),
  inputQuantity: document.getElementById('input-quantity'),
  
  previewCard: document.getElementById('card-preview'),
  previewName: document.getElementById('preview-name'),
  previewTable: document.getElementById('preview-table'),
  previewLogo: document.getElementById('preview-logo'),
  
  livePrice: document.getElementById('live-price'),
  btnAddToCart: document.getElementById('btn-add-to-cart'),
  cartMessage: document.getElementById('cart-message')
};

// 1. Live Preview Update Function
function updatePreview() {
  els.previewName.textContent = state.restaurantName || 'Your Restaurant';
  els.previewTable.textContent = state.tableNumber || '00';
  
  // Update card class for color/finish
  els.previewCard.className = `card-preview ${state.color}`;
  
  // Update price
  const total = (state.basePrice * state.quantity).toFixed(2);
  els.livePrice.textContent = `${total} TND`;
}

// 2. Event Listeners for Live Updates
els.inputRestaurant.addEventListener('input', (e) => {
  state.restaurantName = e.target.value;
  updatePreview();
});

els.inputTable.addEventListener('input', (e) => {
  state.tableNumber = e.target.value;
  updatePreview();
});

els.selectColor.addEventListener('change', (e) => {
  state.color = e.target.value;
  updatePreview();
});

els.inputQuantity.addEventListener('input', (e) => {
  state.quantity = Math.max(1, parseInt(e.target.value) || 1);
  updatePreview();
});

els.inputLogo.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    state.logoFile = file;
    // عرض معاينة محلية للصورة
    const reader = new FileReader();
    reader.onload = (event) => {
      els.previewLogo.innerHTML = `<img src="${event.target.result}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%;">`;
    };
    reader.readAsDataURL(file);
  }
});

// 3. Add to Cart Logic
els.btnAddToCart.addEventListener('click', async () => {
  try {
    els.btnAddToCart.disabled = true;
    els.btnAddToCart.textContent = 'Adding...';

    // تجهيز بيانات التخصيص (Customization Data)
    const customizationData = {
      restaurantName: state.restaurantName,
      tableNumber: state.tableNumber,
      color: state.color,
      // ملاحظة: رفع الملف الحقيقي يتطلب FormData، لكن للتبسيط هنا نمرر الاسم
      logoFileName: state.logoFile ? state.logoFile.name : null 
    };

    // استدعاء الـ API (تأكد من تسجيل الدخول أولاً)
    await api.cart.add({
      productId: state.productId, // يجب أن يكون معرف منتج حقيقي من الـ Database
      variantId: null,
      quantity: state.quantity,
      customizationData: customizationData
    });

    // نجاح
    els.cartMessage.style.display = 'block';
    setTimeout(() => { els.cartMessage.style.display = 'none'; }, 3000);
    
  } catch (error) {
    alert(error.message || 'Failed to add to cart. Please login first.');
  } finally {
    els.btnAddToCart.disabled = false;
    els.btnAddToCart.textContent = 'Add to Cart';
  }
});

// 4. Initialize
async function init() {
  try {
    // جلب المنتجات لتحديد الـ productId الصحيح (مثال: المنتج الأول)
    const response = await api.products.getAll();
    if (response.products.length > 0) {
      state.productId = response.products[0].id;
      state.basePrice = parseFloat(response.products[0].basePrice);
    }
    updatePreview();
  } catch (error) {
    console.error('Failed to load products:', error);
  }
}

init();