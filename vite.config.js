import { defineConfig } from 'vite'
import { resolve, extname, basename } from 'path'
import { glob } from 'glob'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

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

export default defineConfig({
  root: 'src/pages',
  plugins: [mapSrcRequests()],

  server: {
    open: true,
    fs: {
      allow: ['..'],
    },
  },

  build: {
    outDir: '../../dist',
    emptyOutDir: true,
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
})
