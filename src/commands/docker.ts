import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import ejs from 'ejs'

import inquirer from 'inquirer'
import { logError, logSuccess } from '../utils/logger.js'
import { logWarn } from './../utils/logger'

// 兼容 ESM & CJS 的 __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default async function docker() {
  const projectType = await inquirer.prompt([{
    type: 'list',
    name: 'appProjectType',
    message: 'please select your app ProjectType:',
    choices: [
      { name: 'WEB', value: 'web' },
      { name: 'JAVA-SpringBoot', value: 'java-springboot' },
      { name: 'Golang', value: 'golang' },
      { name: 'Node.js', value: 'nodejs' },
    ],
    default: 'web',
  }])
  logWarn(`user AppProjectType:${projectType.appProjectType}`)

  if (projectType.appProjectType === 'web' || projectType.appProjectType === 'nodejs') {
    // 获取用户输入 交互式输入;
    const answers = await inquirer.prompt([
      { type: 'input', name: 'nodeVersion', message: 'Node version:', default: '18' },
      { type: 'confirm', name: 'withNginx', message: 'Include Nginx stage?', default: true },
    ])
    logWarn(`user Answers:${JSON.stringify(answers)}`)

    // 模板目录：templates 文件夹相对于当前文件
    const templateDir = path.resolve(__dirname, '../templates')
    // 输出目录 relative to current working directory
    const outputDir = process.cwd()

    // 遍历模板文件并将用户回答Answers中的相关变量渲染至模板;
    for (const file of ['Dockerfile.ejs', 'docker-compose.ejs']) {
      const templatePath = path.join(templateDir, file)
      const content = (await ejs.renderFile(templatePath, answers)) as string
      fs.writeFileSync(path.join(outputDir, file.replace('.ejs', '')), content)
    }

    // .dockerignore 内容
    const dockerignore = [
      'node_modules',
      'dist.zip',
      'dist/**/*.map',
      '.git',
      '.env',
      'coverage',
      'tmp',
      'logs',
    ].join('\n')
    // 写入.dockerignore
    fs.writeFileSync(path.join(outputDir, '.dockerignore'), dockerignore)

    // 打印成功信息
    logSuccess('Docker templates generated successfully.')
  }
  else {
    // todo 后续完善golang项目以及SpringBoot项目的docker模版生成;
    logError(`Sorry, currently ${projectType.appProjectType} project is not supported`)
  }
}
