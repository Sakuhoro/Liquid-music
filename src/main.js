import './style.css'

const app = document.getElementById('app')
app.innerHTML = `
  <main>
    <h1>Liquid Music</h1>
    <p>Новый проект начат с нуля.</p>
    <p id="status">Проверка сервера...</p>
  </main>
`

fetch('/api/health')
  .then((r) => r.json())
  .then((d) => {
    document.getElementById('status').textContent = `Сервер: ${d.status} (${d.time})`
  })
  .catch(() => {
    document.getElementById('status').textContent = 'Сервер недоступен'
  })
