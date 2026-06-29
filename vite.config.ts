import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups"
    }
  },
  resolve: {
    dedupe: ['react', 'react-dom', 'three']
  },
  define: {
    // Silence THREE.Clock deprecation warning from @react-three/fiber internals
    __THREE_DEVTOOLS__: 'undefined',
  },
})
