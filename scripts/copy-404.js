import { copyFileSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(__dirname, '../dist')
const indexPath = path.join(distDir, 'index.html')
const notFoundPath = path.join(distDir, '404.html')

if (!existsSync(indexPath)) {
	console.error('copy-404: dist/index.html 不存在，请先执行 npm run build')
	process.exit(1)
}

copyFileSync(indexPath, notFoundPath)
console.log('copy-404: 已生成 dist/404.html（GitHub Pages SPA 回退）')
