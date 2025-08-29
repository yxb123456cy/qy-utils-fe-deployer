import { compressDist } from '../utils/compress'
import { logSuccess } from '../utils/logger'

/**
 * 压缩本地构建目录测试;
 */
async function main() {
  // 目前存在两个BUG 一个是源dist文件BUG 另一个是目标生成文件BUg
  // Res为最终生成的压缩包的路径;
  const res = await compressDist('../../dist', '../../zip/dist.zip')
  logSuccess(`压缩完成 Result: ${res}`)
}
main()
