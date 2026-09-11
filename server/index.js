import express from 'express'
import path from 'path'
import fs from 'fs'
import multer from 'multer'
import { exec } from 'child_process'
import { fileURLToPath } from 'url'
import {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  resetProducts,
  getSetting,
  setSetting,
} from './db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

// Parse JSON and URL-encoded request bodies
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

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
    const name = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`
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
