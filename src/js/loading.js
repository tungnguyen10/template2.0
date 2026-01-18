/**
 * LoadingManager - Global loading state management
 * Counter pattern để track multiple async operations
 */

class LoadingManager {
  constructor() {
    this.overlay = null
    this.textElement = null
    this.counter = 0
    this.isInitialized = false
  }

  init() {
    if (this.isInitialized) return
    
    this.overlay = document.getElementById('global-loading')
    this.textElement = this.overlay?.querySelector('.loading-text')
    
    if (!this.overlay) {
      console.warn('[LoadingManager] Loading overlay not found')
      return
    }
    
    // Add loading-active class to body ban đầu
    document.body.classList.add('loading-active')
    this.isInitialized = true
  }

  /**
   * Show loading overlay
   * @param {string} message - Optional custom message
   * @returns {Promise} Resolves after transition
   */
  show(message = 'Loading...') {
    if (!this.isInitialized) this.init()
    
    this.counter++
    
    if (this.textElement) {
      this.textElement.textContent = message
    }
    
    if (this.overlay) {
      this.overlay.classList.remove('hidden')
      document.body.classList.add('loading-active')
    }
    
    return Promise.resolve()
  }

  /**
   * Hide loading overlay (decrements counter)
   * Chỉ thực sự hide khi counter === 0
   * @returns {Promise} Resolves after transition
   */
  hide() {
    if (!this.isInitialized) return Promise.resolve()
    
    this.counter = Math.max(0, this.counter - 1)
    
    if (this.counter === 0 && this.overlay) {
      this.overlay.classList.add('hidden')
      document.body.classList.remove('loading-active')
      
      // Return promise để có thể await
      return new Promise(resolve => {
        setTimeout(resolve, 500) // Match CSS transition duration
      })
    }
    
    return Promise.resolve()
  }

  /**
   * Force hide loading (reset counter)
   */
  forceHide() {
    this.counter = 0
    return this.hide()
  }

  /**
   * Wrap async function với loading state
   * @param {Function} fn - Async function
   * @param {string} message - Loading message
   * @returns {Promise}
   */
  async wrap(fn, message = 'Loading...') {
    await this.show(message)
    try {
      const result = await fn()
      return result
    } finally {
      await this.hide()
    }
  }
}

// Export singleton instance
export const loadingManager = new LoadingManager()

// Expose globally for easy access from pages
if (typeof window !== 'undefined') {
  window.loading = loadingManager
}
