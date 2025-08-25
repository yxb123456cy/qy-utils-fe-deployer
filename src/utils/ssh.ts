import type { Client, ConnectConfig } from 'ssh2'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

export async function runRemoteCommands(conn: Client, cmds: string[] = []): Promise<void> {
  for (const cmd of cmds) {
    await new Promise<void>((resolve, reject) => {
      conn.exec(cmd, (err, stream) => {
        if (err)
          return reject(err)
        stream.on('close', (code: number) => {
          if (code !== 0)
            return reject(new Error(`Command failed: ${cmd}`))
          resolve()
        }).stderr.on('data', () => {})
      })
    })
  }
}

export async function uploadAndUnzip(zipPath: string, remoteDir: string, conn: Client): Promise<void> {
  const remoteZip = `${remoteDir.replace(/\/$/, '')}/dist.zip`
  await new Promise<void>((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err)
        return reject(err)
      sftp.fastPut(zipPath, remoteZip, (err2) => {
        if (err2)
          return reject(err2)
        resolve()
      })
    })
  })
  await runRemoteCommands(conn, [
    `mkdir -p ${remoteDir}`,
    `cd ${remoteDir} && unzip -o dist.zip`,
  ])
}

function expandHome(p?: string): string | undefined {
  if (!p)
    return p
  if (p.startsWith('~/'))
    return path.join(os.homedir(), p.slice(2))
  return p
}

export function createConnectConfig(opts: {
  host: string
  port?: number
  username: string
  password?: string
  privateKey?: string
  passphrase?: string
}): ConnectConfig {
  const conf: ConnectConfig = {
    host: opts.host,
    port: opts.port || 22,
    username: opts.username,
  }
  if (opts.privateKey) {
    conf.privateKey = fs.readFileSync(expandHome(opts.privateKey)!)
    if (opts.passphrase)
      conf.passphrase = opts.passphrase
  }
  else if (opts.password) {
    conf.password = opts.password
  }
  return conf
}
