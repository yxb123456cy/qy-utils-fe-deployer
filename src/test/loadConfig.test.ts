import { loadConfigForEnv } from '../utils/config'

async function main() {
  try {
    const result = loadConfigForEnv('dev')
    console.warn('✅ Loaded Config:', JSON.stringify(result, null, 2))
  }
  catch (err: any) {
    console.error('❌ Error:', err.message)
  }
}

main()
