/**
 * Vite Entry Point
 * Import Tailwind CSS và khởi tạo component loader
 */

import './styles/main.css'
import './components/header/header.css'
import './components/footer/footer.css'
import { loadComponents } from './js/main.js'

// Load components khi DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  await loadComponents()
  
  // Dispatch event để các page-specific JS biết components đã load xong
  document.dispatchEvent(new Event('components-loaded'))
})


