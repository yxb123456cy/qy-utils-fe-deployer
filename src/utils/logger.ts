import chalk from 'chalk'

// 打印info日志 蓝色;
export const logInfo = (msg: string) => console.warn(chalk.blue(msg))
// 打印success成功日志 蓝色;
export const logSuccess = (msg: string) => console.warn(chalk.green(msg))
// 打印warn警告日志 黄色;
export const logWarn = (msg: string) => console.warn(chalk.yellow(msg))
// 打印error失败日志 红色;
export const logError = (msg: string) => console.warn(chalk.red(msg))


