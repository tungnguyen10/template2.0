import { defineConfig, loadEnv } from 'vite'
import { resolve, extname, basename, dirname, isAbsolute } from 'path'
import { glob } from 'glob'
import { fileURLToPath } from 'url'
import { copyFileSync, mkdirSync, existsSync, readFileSync } from 'fs'
import svgo from 'vite-plugin-svgo'

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
  if (url.startsWith('/assets/')) {
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
    let transformed = html
    
    // Inject HTML components directly into DOM during build
    // Component JS đã được bundle vào main.js nên không cần inject script tag nữa
    transformed = transformed.replace(
      /<div\s+data-include=["']([^"']+)["'](?:\s+data-js=["'][^"']+["'])?\s*><\/div>/g,
      (match, htmlPath) => {
        try {
          // Xử lý relative path từ pages
          let componentPath = htmlPath
          if (htmlPath.startsWith('../')) {
            // ../components/header/header.html -> components/header/header.html
            componentPath = htmlPath.replace(/^\.\.\//, '')
          } else if (htmlPath.startsWith('./')) {
            // ./header.html -> pages/header.html
            componentPath = `pages/${htmlPath.slice(2)}`
          } else if (base !== '/' && htmlPath.startsWith(base)) {
            // Remove base path
            componentPath = htmlPath.substring(base.length)
          } else if (htmlPath.startsWith('/')) {
            componentPath = htmlPath.substring(1)
          }
          
          // Đọc file component HTML từ src
          const fullComponentPath = resolve(__dirname, 'src', componentPath)
          const componentHtml = readFileSync(fullComponentPath, 'utf-8').trim()
          
          // Chỉ trả về HTML, không cần script tag vì JS đã bundle trong main.js
          return componentHtml
        } catch (error) {
          console.warn(`Failed to inject component: ${htmlPath}`, error.message)
          return match // Giữ nguyên nếu có lỗi
        }
      }
    )
    
    // Transform img src="/assets/..." to include base path
    transformed = transformed.replace(
      /<img\s+([^>]*?)src=["']\/assets\/([^"']+)["']([^>]*?)>/g,
      (match, before, assetPath, after) => {
        const finalPath = base === '/' ? `/assets/${assetPath}` : `${base}assets/${assetPath}`
        return `<img ${before}src="${finalPath}"${after}>`
      }
    )
    
    return transformed
  }
})

// Component JS đã được bundle vào main.js qua import.meta.glob
// Không cần copy components nữa

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')
  const base = normalizeBasePath(env.VITE_BASE_PATH || '/')
  const outDir = resolveOutDir(env.VITE_OUT_DIR || '')

  return {
    base,
    root: 'src/pages',
    plugins: [
      mapSrcRequests(), 
      transformDataInclude(base),
      svgo({
        svgoConfig: {
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  removeViewBox: false,
                  cleanupIds: false,
                  removeComments: true,
                  removeTitle: false,
                  removeDesc: false,
                },
              },
            },
            'removeXMLNS',
          ],
        },
      }),
    ],

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
              return 'assets/svg/[name][extname]'
            }
            if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif'].includes(ext)) {
              return 'assets/image/[name][extname]'
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
