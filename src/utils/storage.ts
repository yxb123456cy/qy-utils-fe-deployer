import type { StorageConfig } from '../types'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import OSS from 'ali-oss'

import COS from 'cos-nodejs-sdk-v5'
import { Client as MinioClient } from 'minio'

async function walkFiles(dir: string): Promise<string[]> {
  const base = path.resolve(process.cwd(), dir)
  const out: string[] = []
  const stack = [base]
  while (stack.length) {
    const cur = stack.pop()!
    for (const f of fs.readdirSync(cur)) {
      const p = path.join(cur, f)
      const stat = fs.statSync(p)
      if (stat.isDirectory()) {
        stack.push(p)
      }
      else {
        out.push(p)
      }
    }
  }
  return out
}

export async function uploadByStorage(cfg: StorageConfig): Promise<void> {
  const files = await walkFiles(cfg.baseDir)
  const root = path.resolve(process.cwd(), cfg.baseDir)

  switch (cfg.provider) {
    case 'oss': {
      const client = new OSS({
        region: cfg.oss!.region,
        accessKeyId: cfg.oss!.accessKeyId,
        accessKeySecret: cfg.oss!.accessKeySecret,
        bucket: cfg.oss!.bucket,
        endpoint: cfg.oss!.endpoint,
      })
      for (const file of files) {
        const key = path.relative(root, file).replace(/\\/g, '/')
        await client.put(key, file)
      }
      break
    }
    case 'minio': {
      const m = new MinioClient({
        endPoint: cfg.minio!.endPoint,
        port: cfg.minio!.port ?? 9000,
        useSSL: cfg.minio!.useSSL ?? false,
        accessKey: cfg.minio!.accessKey,
        secretKey: cfg.minio!.secretKey,
      })
      const bucket = cfg.minio!.bucket
      const exists = await m.bucketExists(bucket).catch(() => false)
      if (!exists)
        await m.makeBucket(bucket, '')
      for (const file of files) {
        const key = path.relative(root, file).replace(/\\/g, '/')
        await m.fPutObject(bucket, key, file)
      }
      break
    }
    case 's3': {
      const endPoint = cfg.s3!.endpoint || 's3.amazonaws.com'
      const useSSL = true
      const m = new MinioClient({
        endPoint,
        useSSL,
        accessKey: cfg.s3!.accessKeyId,
        secretKey: cfg.s3!.secretAccessKey,
        region: cfg.s3!.region,
      } as any)
      const bucket = cfg.s3!.bucket
      const exists = await m.bucketExists(bucket).catch(() => false)
      if (!exists)
        await m.makeBucket(bucket, cfg.s3!.region)
      for (const file of files) {
        const key = path.relative(root, file).replace(/\\/g, '/')
        await m.fPutObject(bucket, key, file)
      }
      break
    }
    case 'cos': {
      const cos = new COS({
        SecretId: cfg.cos!.SecretId,
        SecretKey: cfg.cos!.SecretKey,
      })
      const Bucket = cfg.cos!.Bucket
      const Region = cfg.cos!.Region
      for (const file of files) {
        const Key = path.relative(root, file).replace(/\\/g, '/')
        await new Promise<void>((resolve, reject) => {
          cos.putObject({
            Bucket,
            Region,
            Key,
            Body: fs.createReadStream(file),
          }, err => err ? reject(err) : resolve())
        })
      }
      break
    }
  }
}
