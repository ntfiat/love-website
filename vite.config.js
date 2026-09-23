import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    {
      name: 'server-and-gen2-rewriter',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url.split('?')[0];
          if (url === '/gen2' || url === '/gen2/') {
            req.url = '/gen2.html' + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '');
            return next();
          }
          if (url.startsWith('/server/')) {
            req.url = '/index.html' + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '');
            return next();
          }
          if (url === '/' || url === '/index.html') {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(`<!DOCTYPE html><html><head><title>404 Not Found</title></head><body style="margin: 0; padding: 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fff; color: #222;"><div style="max-width: 600px; margin: 40px auto 0;"><h1 style="font-size: 26px; font-weight: 600; color: #111; margin: 0 0 10px;">404 Not Found</h1><p style="font-size: 15px; color: #555; line-height: 1.5; margin: 0 0 20px;">The requested URL was not found on this server.</p><hr style="border: 0; border-top: 1px solid #e5e5e5; margin: 20px 0;"><div style="font-size: 13px; color: #888;">nginx/1.22.1</div></div></body></html>`);
            return;
          }
          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url.split('?')[0];
          if (url === '/gen2' || url === '/gen2/') {
            req.url = '/gen2.html' + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '');
            return next();
          }
          if (url.startsWith('/server/')) {
            req.url = '/index.html' + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '');
            return next();
          }
          if (url === '/' || url === '/index.html') {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(`<!DOCTYPE html><html><head><title>404 Not Found</title></head><body style="margin: 0; padding: 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fff; color: #222;"><div style="max-width: 600px; margin: 40px auto 0;"><h1 style="font-size: 26px; font-weight: 600; color: #111; margin: 0 0 10px;">404 Not Found</h1><p style="font-size: 15px; color: #555; line-height: 1.5; margin: 0 0 20px;">The requested URL was not found on this server.</p><hr style="border: 0; border-top: 1px solid #e5e5e5; margin: 20px 0;"><div style="font-size: 13px; color: #888;">nginx/1.22.1</div></div></body></html>`);
            return;
          }
          next();
        });
      }
    }
  ],
  server: {
    watch: {
      ignored: [
        '**/UI - Assets/**',
        '**/temp_analysis/**',
        '**/node_modules/**',
        '**/.git/**',
        '**/assets/frames/**',
      ],
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        preview: resolve(__dirname, 'kitten-hero.html'),
        gen2: resolve(__dirname, 'gen2.html'),
      },
    },
  },
});
