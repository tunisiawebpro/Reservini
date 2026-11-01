/* ==========================================================================
   NOVAFLOW — Contact Form Validation & Behavior
   ========================================================================== */

const contactForm = document.getElementById('contact-form');

if (contactForm) {
  const inputs = contactForm.querySelectorAll('input, select, textarea');

  // Show/hide error helpers
  function showError(input, message) {
    const formGroup = input.closest('.form-group');
    if (!formGroup) return;

    // Remove existing error
    const existing = formGroup.querySelector('.form-error');
    if (existing) existing.remove();

    input.classList.add('error');
    const errorEl = document.createElement('p');
    errorEl.className = 'form-error';
    errorEl.textContent = message;
    formGroup.appendChild(errorEl);
  }

  function clearError(input) {
    const formGroup = input.closest('.form-group');
    if (!formGroup) return;
    input.classList.remove('error');
    const existing = formGroup.querySelector('.form-error');
    if (existing) existing.remove();
  }

  // Validators
  function validateRequired(input) {
    if (input.value.trim() === '') {
      showError(input, `${input.getAttribute('data-label') || input.name} is required`);
      return false;
    }
    clearError(input);
    return true;
  }

  function validateEmail(input) {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(input.value.trim())) {
      showError(input, 'Please enter a valid email address');
      return false;
    }
    clearError(input);
    return true;
  }

  function validateSelect(input) {
    if (input.value === '') {
      showError(input, 'Please select an option');
      return false;
    }
    clearError(input);
    return true;
  }

  // Real-time validation on blur
  inputs.forEach((input) => {
    input.addEventListener('blur', () => {
      if (input.required) validateRequired(input);
      if (input.type === 'email') validateEmail(input);
    });

    // Clear error on input
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) {
        if (input.type === 'email') validateEmail(input);
        else if (input.tagName === 'SELECT') validateSelect(input);
        else validateRequired(input);
      }
    });
  });

  // Form submit
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;

    inputs.forEach((input) => {
      if (!input.required) return;
      if (input.type === 'email') {
        if (!validateEmail(input)) isValid = false;
      } else if (input.tagName === 'SELECT') {
        if (!validateSelect(input)) isValid = false;
      } else {
        if (!validateRequired(input)) isValid = false;
      }
    });

    if (!isValid) {
      const firstError = contactForm.querySelector('.form-error');
      if (firstError) firstError.closest('.form-group').querySelector('input, select, textarea')?.focus();
      return;
    }

    // Simulate submission
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.textContent = 'Message Sent!';
      submitBtn.classList.add('btn-secondary');
      submitBtn.classList.remove('btn-primary');

      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'alert alert-success';
      successMsg.textContent = 'Thank you! Your message has been sent successfully.';
      contactForm.insertAdjacentElement('beforebegin', successMsg);

      contactForm.reset();

      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.classList.remove('btn-secondary');
        submitBtn.classList.add('btn-primary');
        successMsg.remove();
      }, 3000);
    }, 1500);
  });
}