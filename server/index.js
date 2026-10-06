// Loaded first so the Telegram bot credentials below are in process.env before
// they are read. The file itself is gitignored; .env.example documents the keys.
import 'dotenv/config'
import express from 'express'
import path from 'path'
import fs from 'fs'
import multer from 'multer'
import crypto from 'crypto'
import cookieParser from 'cookie-parser'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { exec } from 'child_process'
import { fileURLToPath } from 'url'
import {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  resetProducts,
  getSetting,
  setSetting,
  getAllRecipes,
  setRecipe,
  deleteRecipe,
  getAllPainGirlStories,
  setPainGirlStory,
  deletePainGirlStory,
  getAllFlavorPrices,
  setFlavorPrice,
  deleteFlavorPrice,
  findUserByTelegramOrPhone,
  findUserByTelegram,
  createUser,
  createSession,
  getSessionUser,
  deleteSession,
  createOrder,
  getOrdersByUser,
  getAllOrders,
  deleteTestOrder,
  getLoyaltyForUser,
  calculateUnitPrice,
  VOLUME_PRICING,
  NICOTINE_PRICING,
} from './db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

// Parse JSON and URL-encoded request bodies & cookies
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use(cookieParser())

// Uploads directory
const uploadsDir = path.join(__dirname, '..', 'data', 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Multer storage setup for image and audio uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || (file.mimetype.includes('audio') ? '.mp3' : '.png')
    const uuid = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9)
    const name = `${uuid}-${Date.now()}${ext}`
    cb(null, name)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
})

// Git Audio/File Sync Helper
function syncFileToGit(filepath, originalName) {
  return new Promise((resolve) => {
    const relativePath = path.relative(path.join(__dirname, '..'), filepath)
    const commitMsg = `feat(audio-sync): upload audio ${originalName || path.basename(filepath)}`

    // Force git add, commit, and push to remote repository
    const gitCmd = `git add -f "${relativePath}" && git commit -m "${commitMsg}" && git push`
    exec(gitCmd, { cwd: path.join(__dirname, '..') }, (err, stdout, stderr) => {
      if (err) {
        console.warn('[Git Sync Warning]', err.message || stderr)
        resolve({ synced: false, error: err.message })
      } else {
        console.log('[Git Sync Success]', stdout)
        resolve({ synced: true, output: stdout })
      }
    })
  })
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir))

// API Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

// Image upload API endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }
  const fileUrl = `/uploads/${req.file.filename}`
  res.json({ url: fileUrl })
})

// Audio file upload endpoint with automatic Git Sync (Module 2)
app.post('/api/upload-audio', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file uploaded' })
  }
  const fileUrl = `/uploads/${req.file.filename}`
  const gitResult = await syncFileToGit(req.file.path, req.file.originalname)

  res.json({
    url: fileUrl,
    filename: req.file.filename,
    gitSynced: gitResult.synced,
  })
})

// Products CRUD API Endpoints
app.get('/api/products', (req, res) => {
  try {
    const products = getAllProducts()
    res.json(products)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/products', (req, res) => {
  try {
    const newProd = addProduct(req.body)
    res.status(201).json(newProd)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/api/products/:id', (req, res) => {
  try {
    const updated = updateProduct({ ...req.body, id: req.params.id })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/api/products/:id', (req, res) => {
  try {
    const result = deleteProduct(req.params.id)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/products/reset', (req, res) => {
  try {
    const products = resetProducts()
    res.json(products)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Recipes API Endpoints
app.get('/api/recipes', (req, res) => {
  try {
    const recipes = getAllRecipes()
    res.json(recipes)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/recipes', (req, res) => {
  try {
    const { productId, items } = req.body
    if (!productId || !Array.isArray(items)) {
      return res.status(400).json({ error: 'productId and items array are required' })
    }
    const result = setRecipe(productId, items)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/api/recipes/:productId', (req, res) => {
  try {
    const result = deleteRecipe(req.params.productId)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Pain Girl Story Overrides
// The story each frame shows is customer-facing copy, so reading it is as public
// as reading the products. Writing it is what the studio is for, and that route
// is the only one of the CMS writes that insists on an admin session: the
// products, recipes and flavour prices endpoints below are open to anyone who
// can reach the origin, and this one is not going to widen that.
const painGirlStorySchema = z.object({
  frameId: z.string().min(1, 'Не указан кадр.').max(300, 'Слишком длинный путь кадра.'),
  storyText: z
    .string()
    .trim()
    .min(1, 'Текст истории не может быть пустым.')
    .max(4000, 'История длиннее 4000 символов.'),
})

app.get('/api/pain-girl/stories', (req, res) => {
  try {
    const stories = getAllPainGirlStories()
    res.json(stories)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/pain-girl/stories', requireAuth, (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Недостаточно прав.' })
  }
  const parsed = painGirlStorySchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Некорректные данные' })
  }
  try {
    const result = setPainGirlStory(parsed.data.frameId, parsed.data.storyText)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Deleting the override is how a frame goes back to the copy it shipped with.
// The frame id is a path -- /images/pain-girl/hot gum.png -- so it rides in the
// query string: in the path it would be cut into segments by the router and no
// row could ever be found.
app.delete('/api/pain-girl/stories', requireAuth, (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Недостаточно прав.' })
  }
  const frameId = typeof req.query.frameId === 'string' ? req.query.frameId : ''
  if (!frameId) {
    return res.status(400).json({ error: 'Не указан кадр.' })
  }
  try {
    const result = deletePainGirlStory(frameId)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Flavor Prices API Endpoints
app.get('/api/flavor-prices', (req, res) => {
  try {
    const prices = getAllFlavorPrices()
    res.json(prices)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/flavor-prices', (req, res) => {
  try {
    const { vendor, name, pricePer10ml, currency } = req.body
    if (!vendor || !name || pricePer10ml === undefined) {
      return res.status(400).json({ error: 'vendor, name, and pricePer10ml are required' })
    }
    const result = setFlavorPrice(vendor, name, pricePer10ml, currency || 'RUB')
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/api/flavor-prices/:key', (req, res) => {
  try {
    const result = deleteFlavorPrice(req.params.key)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Authentication API Schemas & Routes
const registerSchema = z.object({
  fullName: z.string().min(2, 'Пожалуйста, введите полное ФИО.'),
  phone: z.string().min(10, 'Укажите корректный номер телефона (не менее 10 цифр).'),
  telegramId: z.string().min(1, 'Укажите корректный Telegram ID.'),
  password: z.string().min(9, 'Пароль должен содержать минимум 9 символов.'),
  rememberMe: z.boolean().optional(),
})

const loginSchema = z.object({
  telegramId: z.string().min(1, 'Укажите Telegram ID.'),
  password: z.string().min(9, 'Пароль должен содержать минимум 9 символов.'),
  rememberMe: z.boolean().optional(),
})

app.post('/api/auth/register', (req, res) => {
  try {
    const parseResult = registerSchema.safeParse(req.body)
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0]
      return res.status(400).json({ error: issue.message })
    }

    const { fullName, phone, telegramId, password, rememberMe } = parseResult.data

    // Check duplicate rule: matching phone OR matching telegramId
    const existing = findUserByTelegramOrPhone(telegramId, phone)
    if (existing) {
      return res.status(400).json({ error: 'Звукорежиссер уже есть на студии' })
    }

    const passwordHash = bcrypt.hashSync(password, 10)
    const newUser = createUser({
      fullName,
      phone,
      telegramId,
      passwordHash,
      role: 'USER',
    })

    const session = createSession(newUser.id, Boolean(rememberMe))

    res.cookie('lm_session', session.token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    })

    return res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.fullName,
        phone: newUser.phone,
        telegram: newUser.telegramId.startsWith('@') ? newUser.telegramId : `@${newUser.telegramId}`,
        registeredAt: newUser.createdAt.split('T')[0],
        role: newUser.role,
      },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/auth/login', (req, res) => {
  try {
    const parseResult = loginSchema.safeParse(req.body)
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0]
      return res.status(400).json({ error: issue.message })
    }

    const { telegramId, password, rememberMe } = parseResult.data

    const user = findUserByTelegram(telegramId)
    if (!user) {
      return res.status(401).json({ error: 'Звукорежиссер не найден или неверный пароль.' })
    }

    const isValidPassword = bcrypt.compareSync(password, user.passwordHash)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Звукорежиссер не найден или неверный пароль.' })
    }

    const session = createSession(user.id, Boolean(rememberMe))

    res.cookie('lm_session', session.token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    })

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.fullName,
        phone: user.phone,
        telegram: user.telegramId.startsWith('@') ? user.telegramId : `@${user.telegramId}`,
        registeredAt: user.createdAt.split('T')[0],
        role: user.role,
      },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// --- Telegram order notifications -------------------------------------------
// A new order is announced in the studio's chat with a button that throws the
// order away again. That button is destructive, so the request behind it is not
// trusted on arrival: Telegram authenticates the webhook with a secret header,
// and the chat the press came from has to be one of the configured staff chats.
const TELEGRAM_ORDER_CHAT_ID = process.env.TELEGRAM_ORDER_CHAT_ID || process.env.TELEGRAM_ADMIN_CHAT_ID || ''
const TELEGRAM_STAFF_CHAT_IDS = [
  TELEGRAM_ORDER_CHAT_ID,
  process.env.TELEGRAM_ADMIN_CHAT_ID,
  process.env.TELEGRAM_MANAGER_CHAT_ID,
].filter(Boolean)
const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || ''

const formatRub = (value) => `${new Intl.NumberFormat('ru-RU').format(Math.round(Number(value) || 0))} ₽`

// One call to the Bot API. Returns null instead of throwing, because a Telegram
// outage is not a reason to fail the customer's checkout or the webhook.
async function callTelegram(method, payload) {
  if (!TELEGRAM_BOT_TOKEN) return null
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const body = await response.json().catch(() => null)
    if (!response.ok || !body || body.ok !== true) {
      console.error(`[liquid-music] telegram ${method} failed:`, body ? body.description : response.status)
      return null
    }
    return body.result
  } catch (err) {
    console.error(`[liquid-music] telegram ${method} threw:`, err.message)
    return null
  }
}

// The buyer's Telegram handle, or their name and id when the handle we stored is
// not a handle at all: a person who registered with a phone number still has to
// be recognisable in the chat.
function describeBuyer(user) {
  const raw = String(user?.telegramId || '').trim()
  if (raw.startsWith('@')) return raw
  const name = String(user?.fullName || '').trim()
  if (raw && /^@?\d{4,}$/.test(raw)) {
    const handle = raw.startsWith('@') ? raw : `@${raw}`
    return name ? `${name} ${handle}` : handle
  }
  return name || raw || 'без контакта'
}

function orderMessageText(order, user) {
  const lines = [`📦 Новый заказ #${order.orderId}`, '', `👤 ${describeBuyer(user)}`]
  if (user?.phone) lines.push(`☎️ ${user.phone}`)
  lines.push('')
  for (const item of order.items) {
    lines.push(
      `• ${item.productName} — ${item.volume} / ${item.nicotine} × ${item.quantity} — ${formatRub(item.unitPrice * item.quantity)}`
    )
  }
  lines.push('')
  if (order.discountAmount > 0) {
    lines.push(`Скидка ${order.discountPct}%: −${formatRub(order.discountAmount)}`)
  }
  lines.push(`Итого: ${formatRub(order.total)}`)
  return lines.join('\n')
}

// Announced after the order is committed and deliberately not awaited: the
// customer has already paid and must not be kept waiting on Telegram, and a
// failed announcement must not roll the order back.
async function notifyOrderCreated(order, user) {
  if (!TELEGRAM_ORDER_CHAT_ID) return
  await callTelegram('sendMessage', {
    chat_id: TELEGRAM_ORDER_CHAT_ID,
    text: orderMessageText(order, user),
    reply_markup: {
      inline_keyboard: [
        [{ text: '🗑 Удалить тестовый заказ', callback_data: `delete_test_order:${order.orderId}` }],
      ],
    },
  })
}

function isStaffChat(chatId) {
  const id = String(chatId ?? '')
  return TELEGRAM_STAFF_CHAT_IDS.some((configured) => String(configured) === id)
}

// The order number out of a callback payload. Anything that is not one of our own
// LM-... numbers is refused rather than passed to the database.
const ORDER_ID_PATTERN = /^LM-[A-Z0-9]{1,32}$/

app.post('/api/telegram/webhook', async (req, res) => {
  // Without a configured secret there is no way to tell Telegram's request from
  // anyone else's, so the endpoint refuses everything rather than trusting an
  // unauthenticated body.
  if (!TELEGRAM_WEBHOOK_SECRET) {
    return res.status(503).json({ error: 'Telegram webhook не настроен на сервере.' })
  }

  const given = Buffer.from(String(req.get('X-Telegram-Bot-Api-Secret-Token') || ''), 'utf8')
  const expected = Buffer.from(TELEGRAM_WEBHOOK_SECRET, 'utf8')
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) {
    return res.status(401).json({ error: 'Не удалось подтвердить источник запроса.' })
  }

  const update = req.body && typeof req.body === 'object' ? req.body : {}
  const query = update.callback_query

  // Telegram wants a 200 for updates we are not acting on, otherwise it retries
  // them until they succeed.
  if (!query || typeof query !== 'object') {
    // Someone writing to the bot is how the studio's chat id is found. It is
    // only logged, never trusted and never stored: nothing here decides who may
    // delete an order, and the message itself is not kept.
    const chat = update.message?.chat
    if (chat?.id) console.log(`[liquid-music] telegram chat seen: ${chat.id} (${chat.type || 'unknown'})`)
    return res.json({ ok: true })
  }

  const requestedId = String(query.data || '').replace(/^delete_test_order:/, '')
  const isDeleteButton = String(query.data || '').startsWith('delete_test_order:')

  // Rejecting the press is answered politely and changes nothing else: the order
  // stays, the button stays, and whoever pressed it is told why.
  if (!isDeleteButton || !ORDER_ID_PATTERN.test(requestedId)) {
    await callTelegram('answerCallbackQuery', { callback_query_id: query.id, text: 'Действие не поддерживается.', show_alert: false })
    return res.json({ ok: true })
  }

  if (!isStaffChat(query.message?.chat?.id)) {
    await callTelegram('answerCallbackQuery', { callback_query_id: query.id, text: '🚫 Недостаточно прав.', show_alert: true })
    return res.json({ ok: true })
  }

  let result
  try {
    result = deleteTestOrder(requestedId)
  } catch (err) {
    console.error('[liquid-music] telegram order delete failed:', err.message)
    result = { ok: false, error: err.message }
  }

  if (result.ok) {
    await callTelegram('answerCallbackQuery', {
      callback_query_id: query.id,
      text: `❌ Заказ #${requestedId} успешно удален`,
      show_alert: false,
    })
    // The order is gone, so the button that would delete it again has to go too,
    // otherwise the chat fills up with dead buttons.
    await callTelegram('editMessageReplyMarkup', {
      chat_id: query.message.chat.id,
      message_id: query.message.message_id,
      reply_markup: { inline_keyboard: [] },
    })
    return res.json({ ok: true, deleted: result.orderId })
  }

  await callTelegram('answerCallbackQuery', {
    callback_query_id: query.id,
    text: `⚠️ ${result.error}`,
    show_alert: true,
  })
  return res.json({ ok: true })
})

// --- Telegram sign-in ------------------------------------------------------
// The widget hands the browser a payload signed by the bot, and the signature
// is keyed on the bot token. That token is the only thing that makes a claimed
// identity trustworthy here, so with no token configured the endpoint refuses
// everything rather than believing whatever the browser sends. The bot's
// credentials live in the environment, never in the bundle.
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const TELEGRAM_BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || ''

// Telegram's own scheme: the key is the SHA-256 of the bot token, the message
// is every remaining field joined by newlines in key order, and the hex digest
// has to equal the hash the widget supplied. Timing-safe, so a wrong signature
// cannot be recovered a byte at a time.
function verifyTelegramPayload(payload) {
  if (!TELEGRAM_BOT_TOKEN) {
    return { ok: false, error: 'Вход через Telegram пока не настроен на сервере.' }
  }
  if (!payload || typeof payload !== 'object') {
    return { ok: false, error: 'Пустой ответ Telegram.' }
  }

  // Only `hash` is excluded from the signed message. auth_date is part of it,
  // so it is read for the age check and then left in place rather than being
  // destructured away.
  const { hash, ...signed } = payload
  if (typeof hash !== 'string' || !/^[0-9a-f]{64}$/i.test(hash)) {
    return { ok: false, error: 'Некорректная подпись Telegram.' }
  }

  // A signature stays valid forever, so age is checked separately: a captured
  // payload must not be replayable tomorrow.
  const ageSeconds = Date.now() / 1000 - Number(signed.auth_date)
  if (!Number.isFinite(ageSeconds) || ageSeconds < -300 || ageSeconds > 86400) {
    return { ok: false, error: 'Данные Telegram устарели, попробуйте ещё раз.' }
  }

  const dataCheckString = Object.keys(signed)
    .sort()
    .map((key) => `${key}=${signed[key]}`)
    .join('\n')

  const key = crypto.createHash('sha256').update(TELEGRAM_BOT_TOKEN).digest()
  const expected = crypto.createHmac('sha256', key).update(dataCheckString).digest('hex')

  const given = Buffer.from(hash.toLowerCase(), 'utf8')
  const computed = Buffer.from(expected, 'utf8')
  if (given.length !== computed.length || !crypto.timingSafeEqual(given, computed)) {
    return { ok: false, error: 'Не удалось подтвердить вход через Telegram.' }
  }

  return { ok: true, data: signed }
}

// Lets the client build the widget without the token ever leaving the server,
// and lets it hide the button outright while no bot is configured.
app.get('/api/auth/telegram/config', (req, res) => {
  res.json({
    enabled: Boolean(TELEGRAM_BOT_TOKEN && TELEGRAM_BOT_USERNAME),
    username: TELEGRAM_BOT_USERNAME || null,
  })
})

app.post('/api/auth/telegram', (req, res) => {
  try {
    const { telegram, phone, rememberMe } = req.body || {}

    // The phone is deliberately outside the signed object: adding a field to
    // the message would invalidate the signature, so it is verified as a
    // separate, unsigned input.
    const check = verifyTelegramPayload(telegram)
    if (!check.ok) {
      return res.status(401).json({ error: check.error })
    }

    const t = check.data
    if (!t.id) {
      return res.status(401).json({ error: 'Telegram не передал идентификатор.' })
    }

    // A username is the handle the site already identifies members by. Without
    // one the numeric id stands in, still unique, and the widget remains the
    // only way back into that account.
    const handle = t.username ? '@' + String(t.username).replace(/^@/, '') : 'tg' + String(t.id)
    const fullName = [t.first_name, t.last_name]
      .filter(Boolean)
      .join(' ')
      .trim()

    const returning = findUserByTelegram(handle)
    if (returning) {
      const session = createSession(returning.id, Boolean(rememberMe))
      res.cookie('lm_session', session.token, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
      })
      return res.json({
        success: true,
        created: false,
        user: {
          id: returning.id,
          name: returning.fullName,
          phone: returning.phone,
          telegram: returning.telegramId.startsWith('@') ? returning.telegramId : `@${returning.telegramId}`,
          registeredAt: returning.createdAt.split('T')[0],
          role: returning.role,
        },
      })
    }

    // New member. Telegram never shares a phone number, and the column is
    // NOT NULL, so it is the one field still asked for by hand.
    const digits = String(phone || '').replace(/\D/g, '')
    if (digits.length < 10) {
      return res.status(400).json({
        error: 'Укажите номер телефона — он нужен, чтобы связаться по заказу.',
        needsPhone: true,
      })
    }

    // The same number on a different handle is not this person, and silently
    // taking the account over would hand them someone else's order history.
    const byPhone = findUserByTelegramOrPhone('@none', phone)
    if (byPhone) {
      return res.status(400).json({
        error: 'Этот номер уже привязан к другому аккаунту. Войдите по нему или напишите нам.',
      })
    }

    if (!fullName) {
      return res.status(400).json({ error: 'Telegram не передал имя. Укажите его при заказе.' })
    }

    // passwordHash is NOT NULL, so one is stored, but it is a random secret
    // rather than anything the member chose: bcrypt over 32 random bytes
    // cannot be guessed, which makes the password form a dead end for this
    // account on purpose. Telegram stays the single way in.
    const passwordHash = bcrypt.hashSync(crypto.randomBytes(32).toString('hex'), 10)
    const newUser = createUser({
      fullName,
      phone: phone.trim(),
      telegramId: handle,
      passwordHash,
      role: 'USER',
    })

    const session = createSession(newUser.id, Boolean(rememberMe))
    res.cookie('lm_session', session.token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    })

    return res.status(201).json({
      success: true,
      created: true,
      user: {
        id: newUser.id,
        name: newUser.fullName,
        phone: newUser.phone,
        telegram: `@${newUser.telegramId}`,
        registeredAt: newUser.createdAt.split('T')[0],
        role: newUser.role,
      },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/auth/me', (req, res) => {
  try {
    const token = req.cookies?.lm_session || req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.json({ authenticated: false, user: null })
    }

    const user = getSessionUser(token)
    if (!user) {
      res.clearCookie('lm_session')
      return res.json({ authenticated: false, user: null })
    }

    return res.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.fullName,
        phone: user.phone,
        telegram: user.telegramId.startsWith('@') ? user.telegramId : `@${user.telegramId}`,
        registeredAt: user.createdAt.split('T')[0],
        role: user.role,
      },
      loyalty: getLoyaltyForUser(user.id),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/auth/logout', (req, res) => {
  try {
    const token = req.cookies?.lm_session
    if (token) {
      deleteSession(token)
    }
    res.clearCookie('lm_session')
    return res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Orders & Loyalty API

// Guards the order routes: unlike /api/auth/me this one answers 401, because a
// caller that is not signed in has nothing to read here.
function requireAuth(req, res, next) {
  const token = req.cookies?.lm_session || req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' })
  }
  const user = getSessionUser(token)
  if (!user) {
    res.clearCookie('lm_session')
    return res.status(401).json({ error: 'Сессия истекла' })
  }
  req.user = user
  next()
}

const orderItemSchema = z.object({
  productId: z.string().min(1, 'Не указан товар.'),
  volume: z.enum(['30ml', '60ml', '120ml'], { message: 'Неизвестный объем.' }),
  nicotine: z.enum(['0mg', '1.5mg', '3mg', '6mg'], { message: 'Неизвестная крепость.' }),
  quantity: z.number().int().min(1).max(999),
})

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Корзина пуста.').max(60),
})

app.get('/api/orders', requireAuth, (req, res) => {
  try {
    const orders = getOrdersByUser(req.user.id)
    return res.json({
      orders: orders.map(mapOrderForClient),
      loyalty: getLoyaltyForUser(req.user.id),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/orders', requireAuth, (req, res) => {
  try {
    const parseResult = createOrderSchema.safeParse(req.body)
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0]
      return res.status(400).json({ error: issue.message })
    }

    // Price every line from the server-side matrix and the products table. The
    // client never gets to say what an item costs or what it is called.
    const items = []
    for (const line of parseResult.data.items) {
      let unitPrice = calculateUnitPrice(line.volume, line.nicotine)
      if (unitPrice === null) {
        return res.status(400).json({ error: 'Неизвестный объем или крепость.' })
      }
      const product = getProductById(line.productId)
      if (!product) {
        return res.status(400).json({ error: `Товар ${line.productId} больше не доступен.` })
      }

      if (product.category === 'Pain Girl' || product.id.startsWith('pain-girl-')) {
        let painGirlBase = 1333
        let painGirlExtra = 1335
        if (line.nicotine === '1.5mg') {
          painGirlBase = 1358
          painGirlExtra = 1360
        } else if (line.nicotine === '3mg') {
          painGirlBase = 1383
          painGirlExtra = 1385
        } else if (line.nicotine === '6mg') {
          painGirlBase = 1433
          painGirlExtra = 1435
        }
        unitPrice = product.id === 'pain-girl-6' ? painGirlExtra : painGirlBase
      }

      items.push({
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        volume: line.volume,
        nicotine: line.nicotine,
        volumePrice: VOLUME_PRICING[line.volume],
        nicotinePrice: NICOTINE_PRICING[line.nicotine],
        unitPrice,
        quantity: line.quantity,
      })
    }

    const order = createOrder({ userId: req.user.id, items })
    const full = getOrdersByUser(req.user.id).find((o) => o.id === order.id)

    // Announced, not awaited: the order is already saved, so Telegram is told
    // about it in the background and the checkout returns straight away.
    notifyOrderCreated(full, req.user).catch(() => {})

    return res.status(201).json({
      success: true,
      order: mapOrderForClient(full),
      loyalty: getLoyaltyForUser(req.user.id),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Admin view of every order on the studio account. Admin only, because it
// crosses account boundaries and carries buyer contact details.
app.get('/api/admin/orders', requireAuth, (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Недостаточно прав.' })
    }
    const orders = getAllOrders()
    return res.json({ orders: orders.map(mapAdminOrderForClient) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Same order shape as the customer's own view, with the buyer attached so the
// admin table can show who a row belongs to.
function mapAdminOrderForClient(order) {
  return {
    ...mapOrderForClient(order),
    user: {
      id: order.userId,
      name: order.fullName,
      phone: order.phone,
      telegram: order.telegramId,
      registeredAt: order.fullName,
      role: 'USER',
    },
  }
}

// Shape an order row for the client. The item rows are the frozen price and
// product label from the moment of purchase, so a later product rename or price
// change does not rewrite history.
function mapOrderForClient(order) {
  if (!order) return null
  return {
    id: order.id,
    orderId: order.orderId,
    subtotal: order.subtotal,
    discountPct: order.discountPct,
    discountAmount: order.discountAmount,
    total: order.total,
    status: order.status,
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage,
      volume: item.volume,
      nicotine: item.nicotine,
      volumePrice: item.volumePrice,
      nicotinePrice: item.nicotinePrice,
      totalUnitPrice: item.unitPrice,
      quantity: item.quantity,
    })),
  }
}

// Settings API Endpoints (e.g. for videos, audio settings)
app.get('/api/settings/:key', (req, res) => {
  try {
    const val = getSetting(req.params.key)
    res.json({ key: req.params.key, value: val ? JSON.parse(val) : null })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/settings/:key', (req, res) => {
  try {
    setSetting(req.params.key, req.body.value)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Serve static React build in production
const distDir = path.join(__dirname, '..', 'dist')
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))
  app.get(/^\/(?!api\/|uploads\/).*/, (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`[liquid-music] server listening on :${PORT}`)
})
