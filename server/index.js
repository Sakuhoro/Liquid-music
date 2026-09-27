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
      const unitPrice = calculateUnitPrice(line.volume, line.nicotine)
      if (unitPrice === null) {
        return res.status(400).json({ error: 'Неизвестный объем или крепость.' })
      }
      const product = getProductById(line.productId)
      if (!product) {
        return res.status(400).json({ error: `Товар ${line.productId} больше не доступен.` })
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
