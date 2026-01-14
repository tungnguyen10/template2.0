/**
 * Home Page JS
 * Chỉ chạy trên trang home
 */

document.addEventListener('components-loaded', () => {
  const btn = document.getElementById('demo-btn')
  const output = document.getElementById('demo-output')
  
  if (btn && output) {
    let clickCount = 0
    
    btn.addEventListener('click', () => {
      clickCount++
      output.textContent = `You clicked ${clickCount} time${clickCount > 1 ? 's' : ''}!`
      
      // Thêm animation
      output.classList.remove('animate-pulse')
      void output.offsetWidth // Trigger reflow
      output.classList.add('animate-pulse')
    })
  }
})
