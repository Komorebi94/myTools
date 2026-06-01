import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

const appBase = process.env.VITE_BASE || '/'

// https://vite.dev/config/
export default defineConfig({
	base: appBase,
	define: {
		// 确保客户端能拿到与 base 一致的值（部分环境下 import.meta.env.BASE 可能未注入）
		__APP_BASE__: JSON.stringify(appBase)
	},
	plugins: [vue()],
	server: {
		host: '0.0.0.0'
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src')
		}
	},
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `@use "@/styles/breakpoints.scss" as *;\n`
			}
		}
	},
	build: {
		target: 'es2020',
		rollupOptions: {
			output: {
				manualChunks: {
					'vendor-vue': ['vue', 'vue-router'],
					'vendor-motion': ['gsap', '@vueuse/core'],
					'vendor-fireworks': ['fireworks-js']
				}
			}
		}
	}
})
