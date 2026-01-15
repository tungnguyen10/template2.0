/**
 * Component Loader
 * Load HTML components vào elements có attribute data-include
 */

// Get base path from Vite's import.meta.env.BASE_URL
const getBasePath = () => {
  const base = import.meta.env.BASE_URL || '/'
  return base.endsWith('/') ? base : `${base}/`
}

export async function loadComponents() {
  const elements = document.querySelectorAll('[data-include]')
  const basePath = getBasePath()
  
  const promises = Array.from(elements).map(async (element) => {
    let componentPath = element.getAttribute('data-include')
    const componentJS = element.getAttribute('data-js') // Optional JS path
        // Resolve path: nếu relative thì prepend base, nếu absolute thì giữ nguyên
    if (componentPath && !componentPath.startsWith('/') && !componentPath.startsWith('http')) {
      // Relative path: normalize bằng cách resolve từ current page location
      const currentPath = new URL(window.location.href).pathname
      const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/') + 1)
      componentPath = new URL(componentPath, window.location.origin + currentDir).pathname
    }
        try {
      // Fetch HTML component
      const response = await fetch(componentPath)
      if (!response.ok) throw new Error(`Failed to load ${componentPath}`)
      
      const html = await response.text()
      element.innerHTML = html
      
      // Load component JS chỉ khi có attribute data-js
      if (componentJS) {
        await loadComponentScript(componentJS)
      }
      
    } catch (error) {
      console.error(`Error loading component ${componentPath}:`, error)
      element.innerHTML = `<div class="text-red-500">Failed to load component</div>`
    }
  })
  
  await Promise.all(promises)
}

/**
 * Dynamically load component JS
 */
async function loadComponentScript(scriptPath) {
  try {
    const module = await import(/* @vite-ignore */ scriptPath)
    // Nếu component export init function, gọi nó
    if (module.init && typeof module.init === 'function') {
      module.init()
    }
  } catch (error) {
    console.error(`Error loading script ${scriptPath}:`, error)
  }
}


