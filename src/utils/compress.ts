import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import archiver from 'archiver'
// 压缩本地构建目录
export async function compressDist(dir = '../dist', out = './zip/dist.zip'): Promise<string> {
  const outPath = path.resolve(process.cwd(), out)
  const output = fs.createWriteStream(outPath)
  const archive = archiver('zip', { zlib: { level: 9 } })

  return new Promise((resolve, reject) => {
    output.on('close', () => resolve(outPath))
    archive.on('error', reject)
    archive.pipe(output)
    archive.directory(path.resolve(process.cwd(), dir), false)
    archive.finalize()
  })
}
