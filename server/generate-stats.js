const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'visits.log');

// Основные страницы, которые нужно отображать
const allowedPages = [
  'form', 'home', 'catalog', 'cart', 'orders',
  'visit-stats', 'register', 'stats',
  'profile', 'login', 'checkout'
];

// Страницы с динамическими частями 
const dynamicPatterns = ['product', 'order-details'];

function generateStats() {
  const logData = fs.readFileSync(LOG_FILE, 'utf-8');
  const lines = logData.split('\n');

  const stats = {};

  for (const line of lines) {
    const match = line.match(/(GET|POST|PUT|DELETE)\s+([^\s]+)/);
    if (!match) continue;

    let url = match[2];
    url = url.split('?')[0];
    // Пропускаем API-запросы и статические файлы
    if (url.startsWith('/api/') || url.includes('.js') || url.includes('.css') || url.includes('.ico')) continue;
    // Удаляем начальный слэш
    const cleanPath = url.replace(/^\//, '');
    
    if (allowedPages.includes(cleanPath)) {
      stats[cleanPath] = (stats[cleanPath] || 0) + 1;
      continue;
    }

    // Проверка на динамические маршруты 
    for (const pattern of dynamicPatterns) {
      const regex = new RegExp(`^${pattern}/\\d+$`);
      if (regex.test(cleanPath)) {
        stats[cleanPath] = (stats[cleanPath] || 0) + 1;
        break;
      }
    }
  }

  return stats;
}

function generateHTML(stats) {
  const entries = Object.entries(stats).sort((a, b) => b[1] - a[1]);

  let html = '<ul>';
  for (const [page, count] of entries) {
    html += `<li>Страница: ${page} — ${count}</li>`;
  }
  html += '</ul>';

  return html;
}

module.exports = {
  generateStats,
  generateHTML
};
