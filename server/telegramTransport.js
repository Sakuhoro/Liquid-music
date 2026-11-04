import { spawn } from 'node:child_process'

// Keep the bot token and message out of process arguments and shell commands.
function runTelegramRequest(token, method, payload) {
  return new Promise((resolve, reject) => {
    const child = spawn('curl', ['--ipv4', '--silent', '--connect-timeout', '5', '--max-time', '20', '--max-filesize', '1048576', '--write-out', '\n%{http_code}', '--config', '-'], { stdio: ['pipe', 'pipe', 'ignore'] })
    const config = `url = "https://api.telegram.org/bot${token}/${method}"\nrequest = "POST"\nheader = "Content-Type: application/json"\ndata = ${JSON.stringify(JSON.stringify(payload))}\n`
    const chunks = []
    let size = 0
    const timer = setTimeout(() => child.kill('SIGKILL'), 25000)
    child.stdout.on('data', chunk => {
      size += chunk.length
      if (size > 1048576) child.kill('SIGKILL')
      else chunks.push(chunk)
    })
    child.stdin.on('error', () => {})
    child.on('error', () => { clearTimeout(timer); reject(new Error('Telegram transport could not start')) })
    child.on('close', code => {
      clearTimeout(timer)
      if (code !== 0) return reject(new Error(`Telegram connection failed (curl ${code ?? 'timeout'})`))
      const output = Buffer.concat(chunks).toString('utf8')
      const split = output.lastIndexOf('\n')
      const status = Number(output.slice(split + 1))
      let body = null
      try { body = JSON.parse(output.slice(0, split)) } catch {}
      resolve({ status, body })
    })
    child.stdin.end(config)
  })
}

export function createTelegramTransport(request = runTelegramRequest) {
  return async (token, method, payload) => {
    if (!token) return { ok: false, retryable: false, reason: 'TELEGRAM_BOT_TOKEN не задан' }
    if (!/^[A-Za-z0-9_:.-]+$/.test(token) || !/^[A-Za-z]+$/.test(method)) return { ok: false, retryable: false, reason: 'Некорректные параметры Telegram' }
    try {
      const { status, body } = await request(token, method, payload)
      if (status >= 200 && status < 300 && body?.ok === true) return { ok: true, result: body.result }
      return {
        ok: false,
        retryable: status === 429 || status >= 500,
        reason: body?.description || `Telegram HTTP ${status}`,
        retryAfter: body?.parameters?.retry_after ?? null,
      }
    } catch (error) {
      return { ok: false, retryable: true, reason: error.message }
    }
  }
}

export const callTelegramTransport = createTelegramTransport()
