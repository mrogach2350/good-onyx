export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      await require('winston')
      await require('pino')
      await require('next-logger')
    }
  }