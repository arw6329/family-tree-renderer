import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import { reactScopedCssPlugin } from 'rollup-plugin-react-scoped-css'
import tsconfigPaths from "vite-tsconfig-paths"
import dts from "vite-plugin-dts"
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        reactScopedCssPlugin(),
        tsconfigPaths(),
        dts({
            insertTypesEntry: true,
        }),
        cssInjectedByJsPlugin({
            injectCodeFunction: function(cssCode, options) {
                customElements.whenDefined('reunionpage-family-tree')
                .then(() => {
                    customElements.get('reunionpage-family-tree').injectStyles(cssCode)
                })
            }
        })
    ],
    build: {
        copyPublicDir: false,
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            formats: ['es']
        },
        rollupOptions: {
            external: ['react', 'react/jsx-runtime', 'react-dom', 'react-dom/client'],
            output: {
                assetFileNames: 'assets/[name][extname]',
                entryFileNames: '[name].js',
                globals: {
                    'react': 'react',
                    'react-dom': 'ReactDOM',
                    'react/jsx-runtime': 'react/jsx-runtime',
                    'react-dom/client': 'ReactDOMClient'
                }
            }
        }
    }
})