/**
 * SVG Inline Loader
 * Replace <img> tags with inline SVG for CSS styling
 */

export async function inlineSVGs() {
  const svgImages = document.querySelectorAll('img[src$=".svg"]')
  
  const promises = Array.from(svgImages).map(async (img) => {
    const src = img.getAttribute('src')
    if (!src) return
    
    try {
      const response = await fetch(src)
      if (!response.ok) return
      
      const svgText = await response.text()
      const parser = new DOMParser()
      const svgDoc = parser.parseFromString(svgText, 'image/svg+xml')
      const svg = svgDoc.querySelector('svg')
      
      if (!svg) return
      
      // Copy classes and attributes from img to svg
      const imgClasses = img.getAttribute('class')
      if (imgClasses) {
        svg.setAttribute('class', imgClasses)
      }
      
      const alt = img.getAttribute('alt')
      if (alt) {
        svg.setAttribute('aria-label', alt)
      }
      
      // Add currentColor to paths without stroke/fill
      svg.querySelectorAll('path, circle, rect, polyline, polygon').forEach(el => {
        if (!el.hasAttribute('fill') || el.getAttribute('fill') === 'none') {
          el.setAttribute('stroke', 'currentColor')
        }
      })
      
      // Replace img with svg
      img.replaceWith(svg)
      
    } catch (error) {
      console.error(`Failed to inline SVG: ${src}`, error)
    }
  })
  
  await Promise.all(promises)
}
