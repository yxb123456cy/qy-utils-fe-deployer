import { Command } from 'commander'
import deploy from './commands/deploy.js'
import docker from './commands/docker.js'
import upload from './commands/upload.js'

const program = new Command()

program
  .name('fe-deployer')
  .description('Frontend deployment toolset')
  .version('1.0.0')

program
  .command('deploy')
  .description('Deploy project to remote server via SSH & unzip')
  .option('-e, --env <env>', 'Environment (dev|test|prod)', 'dev')
  .action(deploy as any)

program
  .command('docker')
  .description('Generate Dockerfile and docker-compose.yml')
  .action(docker as any)

program
  .command('upload')
  .description('Upload build artifacts to cloud storage (reads YAML storage config)')
  .option('-t, --target <target>', 'Override storage provider (oss|minio|s3|cos)')
  .option('-e, --env <env>', 'Environment to read storage config from', 'dev')
  .action(upload as any)

program.parse()
