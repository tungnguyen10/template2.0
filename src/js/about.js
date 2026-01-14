/**
 * About Page JS
 * Chỉ chạy trên trang about
 */

document.addEventListener('components-loaded', () => {
  const counterBtn = document.getElementById('about-counter')
  
  if (counterBtn) {
    let count = 0
    
    counterBtn.addEventListener('click', () => {
      count++
      counterBtn.textContent = `Counter: ${count}`
    })
  }
})
