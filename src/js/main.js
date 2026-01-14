/**
 * Component Loader
 * Load HTML components vào elements có attribute data-include
 */

export async function loadComponents() {
  const elements = document.querySelectorAll('[data-include]')
  
  const promises = Array.from(elements).map(async (element) => {
    const componentPath = element.getAttribute('data-include')
    const componentJS = element.getAttribute('data-js') // Optional JS path
    
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


