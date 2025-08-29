import type { NotifyChannel } from '../types'
import axios from 'axios'

export interface NotifyPayload {
  title: string
  text: string
  success: boolean
  meta?: Record<string, any>
}

async function postJSON(url: string, data: any) {
  await axios.post(url, data, { timeout: 10000 })
}

export async function notifyAll(channels: NotifyChannel[] = [], payload: NotifyPayload) {
  await Promise.allSettled(channels.map(async (ch) => {
    switch (ch.type) {
      case 'dingtalk':
        await postJSON(ch.webhook, {
          msgtype: 'markdown',
          markdown: { title: payload.title, text: `**${payload.title}**\n\n${payload.text}` },
        })
        break
      case 'feishu':
        await postJSON(ch.webhook, {
          msg_type: 'post',
          content: {
            post: {
              zh_cn: {
                title: payload.title,
                content: [[{ tag: 'text', text: payload.text }]],
              },
            },
          },
        })
        break
      case 'slack':
        await postJSON(ch.webhook, {
          text: `*${payload.title}*\n${payload.text}`,
        })
        break
      case 'webhook':
      default:
        await postJSON(ch.webhook, payload)
    }
  }))
}
