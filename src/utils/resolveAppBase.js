/**
 * 解析应用 base（GitHub Pages 子路径部署）
 * 优先 import.meta.env.BASE，否则从入口 script 的 src 推断，如 /myTools/assets/index.js → /myTools/
 */
export const resolveAppBase = () => {
    const envBase = typeof __APP_BASE__ !== 'undefined' ? __APP_BASE__ : import.meta.env.BASE
    if (envBase && envBase !== '/') {
        return envBase.endsWith('/') ? envBase : `${envBase}/`
    }

    const script = document.querySelector('script[type="module"][src]')
    const src = script?.getAttribute('src') ?? ''
    const marker = '/assets/'
    const idx = src.indexOf(marker)
    if (idx > 0) return src.slice(0, idx + 1)

    return '/'
}
