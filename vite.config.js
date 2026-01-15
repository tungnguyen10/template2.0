import { defineConfig, loadEnv } from 'vite'
import { resolve, extname, basename, dirname, isAbsolute } from 'path'
import { glob } from 'glob'
import { fileURLToPath } from 'url'
import { copyFileSync, mkdirSync, existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Lấy tất cả page HTML
const htmlFiles = glob.sync('**/*.html', {
  cwd: resolve(__dirname, 'src/pages')
})

// Map page cho Rollup
const input = {}
htmlFiles.forEach(file => {
  const name = file.replace('.html', '')
  input[name] = resolve(__dirname, 'src/pages', file)
})

const mapSrcRequests = () => ({
  name: 'map-src-requests',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (!req.url) return next()
      const mapped = mapUrlToFsPath(req.url)
      if (mapped) {
        req.url = `/@fs/${mapped}`
      }
      next()
    })
  },
  configurePreviewServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (!req.url) return next()
      const mapped = mapUrlToFsPath(req.url)
      if (mapped) {
        req.url = `/@fs/${mapped}`
      }
      next()
    })
  },
})

const mapUrlToFsPath = (url) => {
  if (url === '/main.js') {
    return resolve(__dirname, 'src/main.js')
  }
  if (url.startsWith('/js/')) {
    return resolve(__dirname, 'src', url.slice(1))
  }
  if (url.startsWith('/components/')) {
    return resolve(__dirname, 'src', url.slice(1))
  }
  return null
}

const getCssOutputName = (name) => {
  if (!name) return 'style'
  const normalized = name.replace(/\\/g, '/')
  const marker = 'styles/'
  const idx = normalized.lastIndexOf(marker)
  if (idx >= 0) {
    return normalized
      .slice(idx + marker.length)
      .replace(/\.css$/i, '')
      .replace(/\//g, '-')
  }
  return basename(normalized, '.css')
}

const normalizeBasePath = (value = '/') => {
  if (!value || value === '.') {
    return '/'
  }
  let normalized = value.trim().replace(/\\/g, '/')
  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`
  }
  if (!normalized.endsWith('/')) {
    normalized = `${normalized}/`
  }
  return normalized
}

const resolveOutDir = (value = '') => {
  const target = value.trim()
  const finalTarget = target.length ? target : 'dist'
  return isAbsolute(finalTarget) ? finalTarget : resolve(__dirname, finalTarget)
}

const transformDataInclude = (base) => ({
  name: 'transform-data-include',
  transformIndexHtml(html) {
    // Transform data-include và data-js attributes
    return html.replace(
      /(data-include|data-js)=["']([^"']+)["']/g,
      (match, attr, path) => {
        // Chỉ transform relative paths
        if (path.startsWith('/') || path.startsWith('http')) {
          return match
        }
        // Resolve relative path: ../components/footer.html -> components/footer.html
        // (vì HTML ở src/pages/, nên ../ đi lên src/, rồi vào components/)
        let resolved = path
        if (path.startsWith('../')) {
          resolved = path.replace(/^\.\.\//, '')
        } else if (path.startsWith('./')) {
          resolved = `pages/${path.slice(2)}`
        }
        // Prepend base path
        const finalPath = base === '/' ? `/${resolved}` : `${base}${resolved}`
        return `${attr}="${finalPath}"`
      }
    )
  }
})

const copyComponentsPlugin = (outDirPath) => ({
  name: 'copy-components',
  closeBundle() {
    // Copy all component HTML/JS files to dist (CSS already bundled in main)
    const componentsDir = resolve(__dirname, 'src/components')
    const targetDir = resolve(outDirPath, 'components')
    
    // Get only .html and .js files (CSS is already imported in main.js and bundled)
    const componentFiles = glob.sync('**/*.{html,js}', {
      cwd: componentsDir
    })
    
    componentFiles.forEach(file => {
      const srcPath = resolve(componentsDir, file)
      const destPath = resolve(targetDir, file)
      const destDir = dirname(destPath)
      
      // Create directory if not exists
      if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true })
      }
      
      // Copy file
      copyFileSync(srcPath, destPath)
    })
    
    console.log(`✓ Copied ${componentFiles.length} component files to ${targetDir}`)
  }
})

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')
  const base = normalizeBasePath(env.VITE_BASE_PATH || '/')
  const outDir = resolveOutDir(env.VITE_OUT_DIR || '')

  return {
    base,
    root: 'src/pages',
    plugins: [mapSrcRequests(), transformDataInclude(base), copyComponentsPlugin(outDir)],

    server: {
      open: true,
      fs: {
        allow: ['..'],
      },
    },

    build: {
      outDir,
      emptyOutDir: true,
      assetsInlineLimit: 0,
      rollupOptions: {
        input,
        output: {
          entryFileNames: ({ name }) => {
            const mappedName = name === 'main' ? 'app' : name
            return `assets/js/${mappedName}-[hash].js`
          },
          chunkFileNames: ({ name }) => {
            const isVendor = name === 'vendor'
            const chunkName = isVendor ? 'vendor' : name
            return `assets/js/${chunkName}-[hash].js`
          },
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor'
            }
          },
          assetFileNames: assetInfo => {
            const ext = extname(assetInfo.name || '').slice(1)
            if (ext === 'css') {
              const cssName = getCssOutputName(assetInfo.name || '') || 'style'
              return `assets/css/${cssName}-[hash][extname]`
            }
            if (ext === 'svg') {
              return 'assets/svg/[name]-[hash][extname]'
            }
            if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif'].includes(ext)) {
              return 'assets/image/[name]-[hash][extname]'
            }
            return 'assets/[name]-[hash][extname]'
          },
        },
      },
    },

    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@js': resolve(__dirname, 'src/js'),
        '@styles': resolve(__dirname, 'src/styles'),
        '@assets': resolve(__dirname, 'src/assets'),
      },
    },
  }
})
