import ora from 'ora'
import { Client } from 'ssh2'
import { compressDist } from '../utils/compress.js'
import { loadConfigForEnv } from '../utils/config.js'
import { logError, logSuccess } from '../utils/logger.js'
import { notifyAll } from '../utils/notifier.js'
import { createConnectConfig, runRemoteCommands, uploadAndUnzip } from '../utils/ssh.js'

export default async function deploy(opts: { env: string }) {
  const spinner = ora(`Deploying to ${opts.env}...`).start()
  let success = false
  try {
    const { env, notify } = loadConfigForEnv(opts.env)
    const zipPath = await compressDist()

    const conn = new Client()
    await new Promise<void>((resolve, reject) => {
      conn.on('ready', () => resolve())
      conn.on('error', reject)
      conn.connect(createConnectConfig(env))
    })

    try {
      await runRemoteCommands(conn, env.preCommands || [])
      await uploadAndUnzip(zipPath, env.deployPath, conn)
      await runRemoteCommands(conn, env.postCommands || [])
      success = true
      spinner.succeed('Deployment completed')
      logSuccess(`Deployed to ${env.host}:${env.deployPath}`)
    }
    finally {
      conn.end()
    }

    if (notify?.enable) {
      await notifyAll(notify.channels, {
        title: `Deploy ${opts.env} ${success ? 'Success' : 'Failed'}`,
        text: success ? `Host: ${env.host}\nPath: ${env.deployPath}` : 'See logs for details',
        success,
      })
    }
  }
  catch (e: any) {
    spinner.fail('Deployment failed')
    logError(e?.message || String(e))
    throw e
  }
}
