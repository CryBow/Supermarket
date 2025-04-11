const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { Client } = require('pg');
const app = express();
const PORT = 3000;

// Настройка EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));  // Папка с шаблонами

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const dbConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'supermarket',
  password: '1234',
  port: 5432,
};

const client = new Client(dbConfig);
client.connect()
    .then(() => console.log('Connected to PostgreSQL database'))
    .catch(err => console.error('Error connecting to PostgreSQL database', err));

app.get('/', (req, res) => {
  console.log('Главная страница запрошена');
  res.sendFile(path.join(__dirname, 'form.html'));
});

app.get('/catalog', (req, res) => {
  res.sendFile(path.join(__dirname, 'catalog.html'));
});

// app.get('/api/products', async (req, res) => {
//   try {
//     const result = await client.query('SELECT * FROM Товар');
//     const products = result.rows;
//     console.log('Товары из БД:', products);
//     res.json(products);
//   } catch (err) {
//     console.error('Ошибка при получении товаров из БД:', err);
//     res.status(500).json({ error: 'Ошибка сервера' });
//   }
// });
// фильтры

// Новый маршрут для получения всех категорий
app.get('/api/categories', async (req, res) => {
  try {
    const result = await client.query('SELECT DISTINCT "Категория" FROM Товар');
    const categories = result.rows.map(row => row.Категория);
    console.log('Полученные категории из БД:', categories);
    res.json(categories);
  } catch (err) {
    console.error('Ошибка при получении категорий из БД:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});


app.get('/api/products', async (req, res) => {
  const { search, sort, category } = req.query;
  console.log('Получены параметры фильтров с клиента:', { search, sort, category });

  let query = 'SELECT * FROM Товар WHERE 1=1';
  let params = [];

  // Фильтрация по названию товара
  if (search && search !== '') {
    query += ' AND "Название_товара" ILIKE $1';
    params.push(`%${search}%`);
  }

  // Фильтрация по категории
  if (category && category !== 'Не выбрано' && category !== '') {
    query += ' AND "Категория" = $' + (params.length + 1);  // Используем динамический индекс для $2
    params.push(category);
  }

  // Сортировка по цене
  if (sort === 'price-asc') {
    query += ' ORDER BY "Цена" ASC';
  } else if (sort === 'price-desc') {
    query += ' ORDER BY "Цена" DESC';
  }

  try {
    console.log('Запрос SQL:', query);
    console.log('Параметры для запроса:', params);

    const result = await client.query(query, params);
    const products = result.rows;
    console.log('Товары из БД с фильтрами:', products);
    res.json(products);
  } catch (err) {
    console.error('Ошибка при получении товаров из БД:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});










// Маршрут для страницы товара
app.get('/product/:id', (req, res) => {
  const productId = req.params.id;

  // Запрос в БД для получения товара по id
  client.query('SELECT * FROM Товар WHERE id_Товара = $1', [productId], (err, result) => {
    if (err) {
      console.error('Ошибка при получении товара:', err);
      return res.status(500).send('Ошибка на сервере');
    }

    const product = result.rows[0];
    if (!product) {
      return res.status(404).send('Товар не найден');
    }

    // Отправляем данные на страницу product.ejs
    res.render('product', { product });
  });
});









app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});


