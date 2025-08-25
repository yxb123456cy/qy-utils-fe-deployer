import { compressDist } from '../utils/compress'
import { logSuccess } from './../utils/logger'
/**
 * 压缩本地构建目录测试;
 */
async function main() {
  const res = await compressDist()
  logSuccess(`压缩完成 Result: ${res}`)
}
main()
