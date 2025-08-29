import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import archiver from 'archiver'
import { logWarn } from './logger'
// 压缩本地构建目录
export async function compressDist(dir = '../dist', out = './zip/dist.zip'): Promise<string> {
  const sourceDir = path.resolve(process.cwd(), dir)
  const outPath = path.resolve(process.cwd(), out)
  // 检查源目录是否存在
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Source directory does not exist: ${sourceDir}`)
  }
  // 确保输出目录存在
  const outDir = path.dirname(outPath)
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true })
  }
  const output = fs.createWriteStream(outPath)
  const archive = archiver('zip', { zlib: { level: 9 } })

  return new Promise((resolve, reject) => {
    logWarn('压缩中...')
    output.on('close', () => resolve(outPath))
    archive.on('error', reject)
    archive.pipe(output)
    archive.directory(path.resolve(process.cwd(), dir), false)
    archive.finalize()
  })
}
