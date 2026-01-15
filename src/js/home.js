/**
 * Home Page JS
 * Chỉ chạy trên trang home
 */

import Swiper from 'swiper'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { inlineSVGs } from './svg-loader.js'

// Import SVG assets to ensure they're bundled (using ?url forces asset emission)
import rocketSvg from '../assets/svg/rocket.svg?url'
import clockSvg from '../assets/svg/clock.svg?url'
import viteSvg from '../assets/svg/vite.svg?url'

document.addEventListener('components-loaded', async () => {
  // Inline SVGs for hover effects
  await inlineSVGs()
  
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

  // Initialize Swiper
  const swiper = new Swiper('.tech-swiper', {
    modules: [Navigation, Pagination, Autoplay],
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    autoplay: {
      delay: 3500,
      disableOnInteraction: false,
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    breakpoints: {
      640: {
        slidesPerView: 2,
      },
      1024: {
        slidesPerView: 3,
      },
    },
  })
})
