import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      {
        find: 'src',
        replacement: resolve(__dirname, 'src'),
      },
      {
        find: '@components',
        replacement: resolve(__dirname, 'src', 'components'),
      },
      {
        find: '@shared',
        replacement: resolve(__dirname, 'src', 'shared'),
      },
      {
        find: '@hooks',
        replacement: resolve(__dirname, 'src', 'hooks'),
      },
    ],
  },
  plugins: [react(), svgr()],
})
