/**
 * Vite Entry Point
 * Import Tailwind CSS và khởi tạo components
 */

import './styles/main.css'
import './components/header/header.css'
import './components/footer/footer.css'
import { appEnv } from './config/env.js'
import { inlineSVGs } from './js/svg-loader.js'

// Auto-import tất cả component JS files (eager import để bundle vào main.js)
const componentModules = import.meta.glob('./components/**/*.js', { eager: true })

// Auto-import tất cả SVG files để Vite bundle chúng
const svgModules = import.meta.glob('./assets/svg/*.svg', { eager: true, query: '?url' })

// Surface the current environment for debugging/styling hooks
document.documentElement.dataset.appEnv = appEnv
if (import.meta.env.DEV) {
  console.info(`[lab-iuh] Running in ${appEnv} mode`)
  console.info(`[lab-iuh] Loaded ${Object.keys(svgModules).length} SVG assets`)
}

// Khởi tạo tất cả components khi DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  // Auto-init all components that have init() function
  Object.values(componentModules).forEach(module => {
    if (module.init && typeof module.init === 'function') {
      module.init()
    }
  })
  
  // Inline SVGs for better CSS styling and hover effects
  await inlineSVGs()
  
  // Dispatch event để các page-specific JS biết components đã load xong
  document.dispatchEvent(new Event('components-loaded'))
})


