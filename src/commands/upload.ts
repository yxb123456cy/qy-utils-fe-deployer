import ora from 'ora'
import { loadConfigForEnv } from '../utils/config.js'
import { logSuccess } from '../utils/logger.js'
import { notifyAll } from '../utils/notifier.js'
import { uploadByStorage } from '../utils/storage.js'
import { logError } from './../utils/logger'
// 先只实现阿里云OSS 腾讯云COS 七牛云KODO MINIO这四种云存储上传;
export default async function upload(opts: { target?: string, env?: string }) {
  const envName = opts.env || 'dev'
  const spinner = ora(`Uploading artifacts for ${envName}...`).start()
  let ok = false
  try {
    const { storage, notify } = loadConfigForEnv(envName)
    if (!storage)
      throw new Error('No storage config found')
    if (opts.target && opts.target !== storage.provider) {
      spinner.info(`Overriding provider: ${storage.provider} -> ${opts.target}`)
      storage.provider = opts.target as any
    }
    await uploadByStorage(storage)
    ok = true
    spinner.succeed('Upload completed')
    logSuccess(`Provider: ${storage.provider}`)

    if (notify?.enable) {
      await notifyAll(notify.channels, {
        title: `Upload ${envName} Success`,
        text: `Provider: ${storage.provider}\nBaseDir: ${storage.baseDir}`,
        success: ok,
      })
    }
  }
  catch (e: any) {
    spinner.fail('Upload failed')
    try {
      const { notify } = loadConfigForEnv(envName)
      if (notify?.enable) {
        await notifyAll(notify.channels, {
          title: `Upload ${envName} Failed`,
          text: e?.message || String(e),
          success: false,
        })
      }
    }
    catch (err: any) {
      logError(`Notify failed ${err.message}`)
    }
  }
}
