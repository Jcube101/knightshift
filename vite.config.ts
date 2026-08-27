import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Keep the reviewed opening reference data out of the main application chunk.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const match = id.match(/\/src\/lib\/openingDatabase([A-E])\.ts$/)
          return match ? `opening-data-${match[1].toLowerCase()}` : undefined
        },
      },
    },
  },
})
