# fe-deployer

前端工程部署工具集（TypeScript）：
- 一键部署到服务器（SSH + 压缩/解压）
- Docker 模板生成（Dockerfile + docker-compose）
- 多云上传：阿里云 OSS / MinIO / AWS S3 / 腾讯云 COS
- YAML 配置（`fe-deployer.yaml` 或 `deploy.config.yaml`）
- 部署通知（钉钉、飞书、Slack 或通用 Webhook）

## 快速开始

```bash
npm i -g fe-deployer
fe-deployer --help

# 生成 Docker 模板
fe-deployer docker

# 上传构建产物到云存储
fe-deployer upload -t oss

# 部署到服务器（读取 YAML 配置）
fe-deployer deploy -e prod
```

## 配置文件

创建 `fe-deployer.yaml`（或 `deploy.config.yaml`）在你的项目根目录：

```yaml
envs:
  dev:
    host: 1.2.3.4
    port: 22
    username: root
    # 私钥方式（推荐）或 password 二选一
    privateKey: ~/.ssh/id_rsa
    # password: "your-password"
    deployPath: /var/www/apps/myapp
    preCommands:
      - mkdir -p /var/www/apps/myapp
    postCommands:
      - ls -lah
  prod:
    host: 5.6.7.8
    port: 22
    username: ubuntu
    privateKey: ~/.ssh/id_rsa
    deployPath: /srv/myapp

storage:
  provider: oss # 可选：oss|minio|s3|cos
  baseDir: dist
  oss:
    region: oss-cn-hangzhou
    bucket: your-bucket
    accessKeyId: ${OSS_ID}
    accessKeySecret: ${OSS_SECRET}
  minio:
    endPoint: 127.0.0.1
    port: 9000
    useSSL: false
    accessKey: ${MINIO_KEY}
    secretKey: ${MINIO_SECRET}
    bucket: my-bucket
  s3:
    region: ap-southeast-1
    bucket: my-bucket
    accessKeyId: ${AWS_ID}
    secretAccessKey: ${AWS_SECRET}
  cos:
    SecretId: ${COS_ID}
    SecretKey: ${COS_SECRET}
    Bucket: my-bucket-1250000000
    Region: ap-singapore

notify:
  enable: true
  channels:
    - type: dingtalk
      webhook: https://oapi.dingtalk.com/robot/send?access_token=xxx
    - type: feishu
      webhook: https://open.feishu.cn/open-apis/bot/v2/hook/xxx
    - type: slack
      webhook: https://hooks.slack.com/services/xxx/yyy/zzz
    - type: webhook
      webhook: https://example.com/deploy-callback
```

> 支持 `${ENV_VAR}` 占位符：会从环境变量里取值。

## 安全提示
- 推荐使用 SSH 私钥，不在 YAML 里写明文密码。
- CI 环境把密钥设置在 Secrets 中。

## License
MIT
