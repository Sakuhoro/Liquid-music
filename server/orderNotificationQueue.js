// Telegram does not offer an idempotency key for sendMessage. Persist each
// confirmed part, so ordinary retries and restarts do not resend delivered parts.
export function splitOrderNotification(text) {
  const parts = []
  let part = ''
  for (const char of String(text)) {
    if (part.length + char.length > 3800) { parts.push(part); part = '' }
    part += char
  }
  if (part) parts.push(part)
  return parts
}

export function createOrderNotificationQueue({ db, send, chatId, format, loadOrder, now = Date.now, log = console }) {
  let running = false
  const claim = db.transaction(() => {
    const timestamp = now()
    const row = db.prepare(`SELECT * FROM order_notifications
      WHERE (state = 'pending' AND nextAttemptAt <= ?) OR (state = 'sending' AND leaseUntil <= ?)
      ORDER BY nextAttemptAt, createdAt LIMIT 1`).get(timestamp, timestamp)
    if (!row) return null
    db.prepare("UPDATE order_notifications SET state = 'sending', leaseUntil = ?, attempts = attempts + 1 WHERE orderId = ?").run(timestamp + 90000, row.orderId)
    return { ...row, attempts: row.attempts + 1 }
  })

  async function processPending() {
    if (running || !chatId) return
    running = true
    try {
      for (let processed = 0; processed < 20; processed++) {
        const row = claim.immediate()
        if (!row) break
        try {
          const order = loadOrder(row.orderId)
          if (!order) { db.prepare('DELETE FROM order_notifications WHERE orderId = ?').run(row.orderId); continue }
          const parts = splitOrderNotification(format(order, order))
          for (let index = row.nextPart; index < parts.length; index++) {
            // Renew the lease before each part of an unusually long order.
            db.prepare('UPDATE order_notifications SET leaseUntil = ? WHERE orderId = ?').run(now() + 90000, row.orderId)
            const payload = { chat_id: chatId, text: parts[index] }
            if (index === parts.length - 1) payload.reply_markup = { inline_keyboard: [[{ text: '🗑 Удалить тестовый заказ', callback_data: `delete_test_order:${row.orderId}` }]] }
            const outcome = await send('sendMessage', payload)
            if (!outcome.ok) {
              const retry = new Error(outcome.reason || 'Telegram send failed')
              retry.retryable = outcome.retryable
              retry.retryAfter = outcome.retryAfter
              throw retry
            }
            db.prepare('UPDATE order_notifications SET nextPart = ?, messageId = ?, leaseUntil = ? WHERE orderId = ?').run(index + 1, outcome.result.message_id, now() + 90000, row.orderId)
          }
          db.prepare("UPDATE order_notifications SET state = 'sent', sentAt = ?, leaseUntil = 0, lastError = NULL WHERE orderId = ?").run(new Date(now()).toISOString(), row.orderId)
          log.info(`[liquid-music] telegram order ${row.orderId} delivered via queue`)
        } catch (error) {
          const delay = error.retryable === false ? 3600000 : Math.min(300000, 15000 * 2 ** Math.min(row.attempts - 1, 5))
          const retryAfter = Math.max(delay, (Number(error.retryAfter) || 0) * 1000)
          db.prepare("UPDATE order_notifications SET state = 'pending', leaseUntil = 0, nextAttemptAt = ?, lastError = ? WHERE orderId = ?").run(now() + retryAfter, String(error.message).slice(0, 500), row.orderId)
          log.error(`[liquid-music] telegram order ${row.orderId} queued for retry in ${retryAfter}ms: ${error.message}`)
        }
      }
    } finally { running = false }
  }

  return { processPending }
}
