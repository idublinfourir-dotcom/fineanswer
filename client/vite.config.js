import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `npm run preview` follows vercel.json the way Vercel does (a real file wins, then the
// first matching rewrite), so it serves the pre-rendered pages and the app shell like production.
const vercelRewrites = {
  name: 'vercel-rewrites',
  configurePreviewServer(server) {
    const { rewrites } = JSON.parse(fs.readFileSync(path.resolve(server.config.root, 'vercel.json'), 'utf8'))
    const outDir = path.resolve(server.config.root, server.config.build.outDir)
    server.middlewares.use((req, res, next) => {
      const [pathname, query] = req.url.split('?')
      const file = path.join(outDir, pathname)
      const isFile = pathname === '/' || (fs.existsSync(file) && fs.statSync(file).isFile())
      const rule = !isFile && rewrites.find((r) => new RegExp(`^${r.source}$`).test(pathname))
      // Analytics scripts and the proxied sitemap only exist on Vercel.
      if (pathname.startsWith('/_vercel/') || (rule && !rule.destination.startsWith('/'))) {
        res.statusCode = 404
        return res.end('Served by Vercel in production')
      }
      if (rule) req.url = rule.destination + (query ? `?${query}` : '')
      next()
    })
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vercelRewrites],
  // Bundled into the build-time renderer (scripts/prerender.js): their CommonJS
  // exports come through wrong under plain Node.
  ssr: { noExternal: ['react-fast-marquee', 'page-flip'] },
  build: {
    chunkSizeWarningLimit: 1000, // Increase limit to 1000 kB (default is 500 kB)
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split only a few very large libraries into dedicated chunks.
          // Let Vite handle the rest to avoid circular dependencies between chunks.
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) {
              return 'firebase-vendor';
            }
          }
        },
      },
    },
  },
})
