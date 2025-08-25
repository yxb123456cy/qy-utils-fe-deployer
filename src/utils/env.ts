import process from 'node:process'

// 解析ENV文件;
export function resolveEnv(value?: string): string | undefined {
  if (!value)
    return value
  const envVar = value.match(/^\$\{(.+?)\}$/)
  if (envVar) {
    return process.env[envVar[1]]
  }
  return value
}
