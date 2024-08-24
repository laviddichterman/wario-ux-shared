import react from '@vitejs/plugin-react'
import { glob } from 'glob'
import { fileURLToPath } from 'node:url'

import { extname, relative, resolve } from 'path'


import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'


// https://vitejs.dev/config/
export default defineConfig({
  // resolve: {
  //   alias: [
  //     {
  //       find: /^(@mui\/[\w-]+)/,
  //       replacement: resolve(__dirname, "node_modules/$1"),
  //     },
  //   ],
  // },
  plugins: [
    react(),
    dts({
      include: ['lib'],
      // rollupTypes: true, // Output .d.ts files
    }),
  ],

  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      formats: ['es'],
    },
    rollupOptions: {
      // Exclude peer dependencies from the bundle to reduce bundle size
      external: ['react', 'react/jsx-runtime',
        // ...Object.keys(peerDependencies)
      ],
      input: Object.fromEntries(
        // https://rollupjs.org/configuration-options/#input
        glob.sync('lib/**/*.{ts,tsx}').map(file => [
          // 1. The name of the entry point
          // lib/nested/foo.js becomes nested/foo
          relative(
            'lib',
            file.slice(0, file.length - extname(file).length)
          ),
          // 2. The absolute path to the entry file
          // lib/nested/foo.ts becomes /project/lib/nested/foo.ts
          fileURLToPath(new URL(file, import.meta.url))
        ])
      ),
      output: {
        interop: "esModule",
        assetFileNames: 'assets/[name][extname]',
        entryFileNames: '[name].js',
      }
    }
  }
})