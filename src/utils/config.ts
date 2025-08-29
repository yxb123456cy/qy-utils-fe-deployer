import type { AppConfig, EnvConfig, StorageConfig } from '../types/index.js'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import yaml from 'js-yaml'
import { resolveEnv } from './env.js'
import { logInfo } from './logger'
// 尝试寻找可能的配置文件路径;
function tryPaths(): string[] {
  const cwd = process.cwd()
  return [
    path.join(cwd, '../fe-deployer.yaml'),
    path.join(cwd, '../fe-deployer.yml'),
    path.join(cwd, '../deploy.config.yaml'),
    path.join(cwd, '../deploy.config.yml'),
  ]
}

export function loadConfigForEnv(env: string): { env: EnvConfig, storage?: StorageConfig, notify?: AppConfig['notify'] } {
  logInfo(`tryPaths-Result "${tryPaths()}"`)
  const file = tryPaths().find(p => fs.existsSync(p))
  logInfo(`file: ${file}`)
  if (!file)
    throw new Error('Config file not found: fe-deployer.yaml or deploy.config.yaml')

  const doc = yaml.load(fs.readFileSync(file, 'utf-8')) as AppConfig

  const envConf = doc.envs?.[env]
  if (!envConf)
    throw new Error(`Env "${env}" not found in config`)

  if (doc.storage) {
    const s = doc.storage
    if (s.oss) {
      s.oss.accessKeyId = resolveEnv(s.oss.accessKeyId)!
      s.oss.accessKeySecret = resolveEnv(s.oss.accessKeySecret)!
    }
    if (s.minio) {
      s.minio.accessKey = resolveEnv(s.minio.accessKey)!
      s.minio.secretKey = resolveEnv(s.minio.secretKey)!
    }
    if (s.s3) {
      s.s3.accessKeyId = resolveEnv(s.s3.accessKeyId)!
      s.s3.secretAccessKey = resolveEnv(s.s3.secretAccessKey)!
    }
    if (s.cos) {
      s.cos.SecretId = resolveEnv(s.cos.SecretId)!
      s.cos.SecretKey = resolveEnv(s.cos.SecretKey)!
    }
  }

  return { env: envConf, storage: doc.storage, notify: doc.notify }
}
