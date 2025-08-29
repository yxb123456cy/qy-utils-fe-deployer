export interface EnvConfig {
  host: string
  port?: number
  username: string
  password?: string
  privateKey?: string
  passphrase?: string
  deployPath: string
  preCommands?: string[]
  postCommands?: string[]
}

export interface StorageConfig {
  provider: 'oss' | 'minio' | 's3' | 'cos' | 'bos'
  baseDir: string
  oss?: {
    region: string
    bucket: string
    accessKeyId: string
    accessKeySecret: string
    endpoint?: string
  }
  minio?: {
    endPoint: string
    port?: number
    useSSL?: boolean
    accessKey: string
    secretKey: string
    bucket: string
  }
  s3?: {
    region: string
    bucket: string
    accessKeyId: string
    secretAccessKey: string
    endpoint?: string
  }
  cos?: {
    SecretId: string
    SecretKey: string
    Bucket: string
    Region: string
  }
}

export interface NotifyChannel {
  type: 'dingtalk' | 'feishu' | 'slack' | 'webhook'
  webhook: string
}

export interface AppConfig {
  envs: Record<string, EnvConfig>
  storage?: StorageConfig
  notify?: {
    enable: boolean
    channels: NotifyChannel[]
  }
}

export interface NotifyPayload {
  title: string
  text: string
  success: boolean
  meta?: Record<string, any>
}
