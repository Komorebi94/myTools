/**
 * 触发浏览器下载 JSON 备份
 * @param {string} filename
 * @param {unknown} data
 */
export function downloadJsonBackup (filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}

/**
 * @param {File} file
 * @returns {Promise<unknown>}
 */
export function readJsonFile (file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            try {
                resolve(JSON.parse(String(reader.result)))
            } catch (e) {
                reject(e)
            }
        }
        reader.onerror = () => reject(reader.error)
        reader.readAsText(file)
    })
}
