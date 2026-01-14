/**
 * Header Component JS
 * Handle mobile menu toggle
 */

export function init() {
  const toggleBtn = document.getElementById('mobile-menu-toggle')
  const mobileMenu = document.getElementById('mobile-menu')
  
  if (toggleBtn && mobileMenu) {
    toggleBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden')
    })
  }
}
