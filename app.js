const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const { Client } = require('pg');
const app = express();
const PORT = 3000;
const session = require('express-session'); // Для работы с сессиями
const LOG_FILE = path.join(__dirname, 'server', 'visits.log');


// Настройка EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));  // Папка с шаблонами

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// Настройка сессий
app.use(session({
  secret: 'x5y3z1', 
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 3600000, // 1 час
    httpOnly: true, // защита от XSS
    sameSite: 'lax' // защита от CSRF
  }
}));


let isServerJustStarted = true;

const dbConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'supermarket',
  password: '1234',
  port: 5432,
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Railway требует SSL, иначе ошибка подключения
  }
};


app.use((req, res, next) => {
  const logLine = `${new Date().toISOString()} ${req.method} ${req.url}\n`;
  fs.appendFile(LOG_FILE, logLine, (err) => {
      if (err) console.error('Ошибка записи в visits.log:', err);
  });
  next();
});

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

app.get('/privacy-policy', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/privacy-policy.html'));
});
app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "/form.html"));
});

app.get("/catalog", (req, res) => {
  res.sendFile(path.join(__dirname, "/catalog.html"));
});

app.get("/cart", (req, res) => {
  res.sendFile(path.join(__dirname, "/cart.html"));
});

app.get("/checkout", (req, res) => {
  res.sendFile(path.join(__dirname, "public/checkout.html"));
});

// Отдаём страницу со статистикой
app.get('/visit-stats', (req, res) => {
  res.sendFile(path.join(__dirname,  "public/visit-stats.html"));
});

// API для получения статистики (используется на странице)
app.get('/api/visit-stats', async (req, res) => {
  const { generateStats } = require('./server/generate-stats');
  const stats = await generateStats();
  res.json(stats);
});

app.get('/api/session-info', (req, res) => {
  if (req.session.user) {
    res.json({ authorized: true, name: req.session.user.name });
  } else {
    res.json({ authorized: false });
  }
});


// API для получения данных профиля текущего пользователя
app.get('/api/profile', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Пользователь не авторизован' });
  }
  res.json(req.session.user);
});

app.get('/api/profile-orders', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Пользователь не авторизован' });
  }
  
  try {
    const userId = req.session.user.id_Пользователя;
    const ordersQuery = `
      SELECT 
        z."id_Заказа", 
        z."Дата_создания", 
        z."Статус_заказа", 
        z."Стоимость_заказа",
        COALESCE(SUM(ct."Количество"), 0) AS total_items
      FROM "Заказы" z
      LEFT JOIN "Корзина" k ON k."id_Заказа" = z."id_Заказа"
      LEFT JOIN "Корзина_Товар" ct ON ct."id_Корзины" = k."id_Корзины"
      WHERE z."id_Пользователя" = $1
      GROUP BY z."id_Заказа", z."Дата_создания", z."Статус_заказа", z."Стоимость_заказа"
      ORDER BY z."Дата_создания" DESC;
    `;
    
    const result = await client.query(ordersQuery, [userId]);
    console.log('История заказов для пользователя:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка при получении заказов:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/orders', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Пользователь не авторизован' });
  }
  
  try {
    const userId = req.session.user.id_Пользователя;
    const ordersQuery = `
      SELECT 
        z."id_Заказа", 
        z."Дата_создания", 
        z."Статус_заказа", 
        z."Стоимость_заказа",
        COALESCE(SUM(ct."Количество"), 0) AS total_items
      FROM "Заказы" z
      LEFT JOIN "Корзина" k ON k."id_Заказа" = z."id_Заказа"
      LEFT JOIN "Корзина_Товар" ct ON ct."id_Корзины" = k."id_Корзины"
      WHERE z."id_Пользователя" = $1
      GROUP BY z."id_Заказа", z."Дата_создания", z."Статус_заказа", z."Стоимость_заказа"
      ORDER BY z."Дата_создания" DESC;
    `;
    
    const result = await client.query(ordersQuery, [userId]);
    console.log('История заказов для пользователя:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка при получении заказов:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/order-details/:id', async (req, res) => {
  if (!req.session.user) {
    return res.send(`
      <script>
        alert('Пользователь не авторизован!');
        window.location.href = '/login';
      </script>
    `);
  }
  const orderId = req.params.id;
  try {
    // Получаем из базы данные заказа, включая товары
    const orderQuery = `
      SELECT 
        z."id_Заказа", 
        z."Дата_создания", 
        z."Статус_заказа", 
        z."Стоимость_заказа", 
        u."Адрес"
      FROM "Заказы" z
      JOIN "Пользователь" u ON u."id_Пользователя" = z."id_Пользователя"
      WHERE z."id_Заказа" = $1`;
    const orderRes = await client.query(orderQuery, [orderId]);
    const order = orderRes.rows[0];

    // Получаем товары для этого заказа
    const itemsQuery = `
      SELECT 
        t."id_Товара" AS id,
        t."Название_товара" AS name,
        t."Цена" AS price,
        t."Изображение" AS image,
        ct."Количество" AS quantity
      FROM "Корзина_Товар" ct
      JOIN "Товар" t ON t."id_Товара" = ct."id_Товара"
      WHERE ct."id_Корзины" = (
        SELECT k."id_Корзины" FROM "Корзина" k WHERE k."id_Заказа" = $1
      )`;
    const itemsRes = await client.query(itemsQuery, [orderId]);
    const items = itemsRes.rows;
    
    // Формируем объект заказа с нужными данными
    const orderDetails = {
      id_Заказа: order.id_Заказа,
      status: order.Статус_заказа,
      total: order.Стоимость_заказа,
      address: order.Адрес,
      items: items
    };

    // Рендерим шаблон order-details.ejs
    res.render('order-details', { order: orderDetails });
  } catch (err) {
    console.error('Ошибка при получении деталей заказа:', err);
    res.status(500).send('Ошибка сервера');
  }
});



// Страница профиля
app.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.send(`
      <script>
        alert('Пользователь не авторизован!');
        window.location.href = '/login';
      </script>
    `);
  }
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});


app.get("/orders", (req, res) => {
  res.sendFile(path.join(__dirname, "/orders.html"));
});

app.get("/stats", (req, res) => {
  res.sendFile(path.join(__dirname, "public/stats.html"));
});

app.use((req, res, next) => {
  if (isServerJustStarted) {
    res.clearCookie('cart', { path: '/' });
    console.log('Корзина очищена при запуске сервера');
    isServerJustStarted = false; // Чтобы не очищать при следующих запросах
  }
  next();
});



// Страница авторизации/входа
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Страница регистрации
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});


// Авторизация (POST /login)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send({ error: 'Заполните все поля' });
  }
  try {
    const result = await client.query(
      'SELECT * FROM "Пользователь" WHERE "email" = $1',
      [email]
    );
    const user = result.rows[0];
    if (!user || user["Пароль"] !== password) {
      return res.status(401).send({ error: 'Неверные учетные данные' });
    }
    // Сохраняем данные пользователя в сессии
    req.session.user = user;
    console.log('Пользователь авторизован:', user);
    res.redirect('/profile');
  } catch (err) {
    console.error('Ошибка при авторизации:', err);
    res.status(500).send({ error: 'Ошибка сервера' });
  }
});

// Регистрация (POST /register)
app.post('/register', async (req, res) => {
  const {
    lastName,
    firstName,
    middleName, 
    gender,
    phone,
    email,
    address,
    password,
    birthDate
  } = req.body;

  if (!lastName || !firstName || !gender || !phone || !email || !address || !password || !birthDate) {
    return res.status(400).send({ error: 'Пожалуйста, заполните все обязательные поля' });
  }
  try {
    const query = `INSERT INTO "Пользователь" 
      ("Фамилия", "Имя", "Отчество", "Пол", "Телефон", "email", "Адрес", "Пароль", "Дата_Рождения")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`;
    const params = [
      lastName,
      firstName,
      middleName || '',
      gender,
      phone,
      email,
      address,
      password,
      birthDate
    ];
    const result = await client.query(query, params);
    console.log('Пользователь зарегистрирован:', result.rows[0]);
    console.log('Пользователь зарегистрирован:');
    res.redirect('/login');
  } catch (err) {
    console.error('Ошибка при регистрации:', err);
    res.status(500).send({ error: 'Ошибка сервера при регистрации' });
  }
});

// Обновление профиля пользователя
app.post('/update-profile', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).send({ error: 'Пользователь не авторизован' });
  }

  const { firstName, lastName, middleName, gender, phone, address, birthDate, password } = req.body;
  if (!firstName || !lastName || !gender || !phone || !address || !birthDate || !password) {
    return res.status(400).send({ error: 'Пожалуйста, заполните все обязательные поля' });
  }

  try {
    const query = `
      UPDATE "Пользователь"
      SET "Имя" = $1, "Фамилия" = $2, "Отчество" = $3, "Пол" = $4, "Телефон" = $5, "Адрес" = $6,
          "Пароль" = $7, "Дата_Рождения" = $8
      WHERE "email" = $9
      RETURNING *;
    `;
    const params = [
      firstName,
      lastName,
      middleName || '',
      gender,
      phone,
      address,
      password,
      birthDate,
      req.session.user.email
    ];
    const result = await client.query(query, params);
    // Обновляем сессию пользователя
    req.session.user = result.rows[0];
    console.log('Данные профиля обновлены:', result.rows[0]);
    res.redirect('/profile');
  } catch (err) {
    console.error('Ошибка при обновлении профиля:', err);
    res.status(500).send({ error: 'Ошибка сервера при обновлении профиля' });
  }
});



// Выход из профиля (GET /logout)
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Ошибка при выходе:', err);
      return res.status(500).send({ error: 'Ошибка сервера при выходе' });
    }
    res.sendFile(path.join(__dirname, "/form.html"));
  });
});


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
    query += ' AND "Категория" = $' + (params.length + 1);  
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

// API для добавления товара в корзину (используем куки для буферной корзины)
app.post('/add-to-cart', (req, res) => {
  const { product } = req.body;
  console.log('Получен продукт для добавления в корзину:', product);

  let cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];

  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  res.cookie('cart', JSON.stringify(cart), { httpOnly: false });
  console.log('Обновленная корзина:', cart);
  res.send({ success: true });
});

// API для получения корзины
app.get('/get-cart', (req, res) => {
  const cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
  console.log('Текущая корзина из cookies:', cart); // Логируем корзину
  res.send(cart);
});
app.get('/get-checkout', (req, res) => {
  const checkout = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
  console.log('Текущая корзина из cookies:', checkout); // Логируем корзину
  res.send(checkout);
});
// API для удаления товара из корзины
app.post('/remove-from-cart', (req, res) => {
  const { productId } = req.body;
  console.log('Удаляем товар с productId:', productId, typeof productId);
  
  // Получаем корзину из cookies
  let cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
  console.log('Корзина перед удалением:', cart);
  
  // Удаляем товар, сравнивая числовое значение
  cart = cart.filter(item => item.id !== Number(productId));
  
  console.log('Корзина после удаления:', cart);
  
  // Обновляем куки с новой корзиной (срок жизни куки – 1 час )
  res.cookie('cart', JSON.stringify(cart), { httpOnly: false, maxAge: 1000 * 60 * 60 });
  
  res.send({ success: true });
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

// Кол-во заказов и общая сумма
app.get('/api/orders-stats', async (req, res) => {
  const client = new Client(dbConfig);
  await client.connect();
  try {
    const result = await client.query(`
      SELECT COUNT(*) AS count, COALESCE(SUM("Стоимость_заказа"), 0) AS total 
      FROM "Заказы";
    `);
    res.json({
      count: parseInt(result.rows[0].count),
      total: parseFloat(result.rows[0].total)
    });
  } catch (error) {
    console.error('Ошибка при получении статистики заказов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  } finally {
    await client.end();
  }
});



// Продажи по товарам
app.get('/api/product-sales', async (req, res) => {
  const client = new Client(dbConfig);
  await client.connect();
  try {
    const result = await client.query(`
      SELECT 
        t."Название_товара" AS name,
        COALESCE(SUM(kt."Количество"), 0) AS sold_quantity,
        COALESCE(SUM(kt."Количество" * t."Цена"), 0) AS total_revenue
      FROM "Товар" t
      LEFT JOIN "Корзина_Товар" kt ON t."id_Товара" = kt."id_Товара"
      GROUP BY t."Название_товара"
      ORDER BY sold_quantity DESC;
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка при получении данных по продажам товаров:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  } finally {
    await client.end();
  }
});



// Статистика пользователей
app.get('/api/user-stats', async (req, res) => {
  const client = new Client(dbConfig);
  await client.connect();
  try {
    const result = await client.query(`
      SELECT 
        u."id_Пользователя" AS id,
        COUNT(z."id_Заказа") AS orders_count,
        COALESCE(SUM(z."Стоимость_заказа"), 0) AS total_spent
      FROM "Пользователь" u
      LEFT JOIN "Заказы" z ON u."id_Пользователя" = z."id_Пользователя"
      GROUP BY u."id_Пользователя"
      ORDER BY total_spent DESC;
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка при получении статистики пользователей:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  } finally {
    await client.end();
  }
});




// Маршрут для создания заказа
app.post('/create-order', async (req, res) => {
  const user = req.session.user;
  if (!user) return res.status(401).send('Не авторизован');

  const { cart, address, total } = req.body;

  try {
    // Создаем заказ в таблице Заказы
    const orderRes = await client.query(
      `INSERT INTO "Заказы" ("Статус_заказа", "Стоимость_заказа", "id_Пользователя")
       VALUES ('Оформлен', $1, $2) RETURNING "id_Заказа"`,
      [total, user.id_Пользователя]
    );
    const orderId = orderRes.rows[0].id_Заказа;

    // Создаем запись в таблице Корзина
    const basketRes = await client.query(
      `INSERT INTO "Корзина" ("Общая_сумма", "id_Заказа")
       VALUES ($1, $2) RETURNING "id_Корзины"`,
      [total, orderId]
    );
    const basketId = basketRes.rows[0].id_Корзины;

    // Заполняем таблицу Корзина_Товар для каждого товара из корзины
    for (const item of cart) {
      await client.query(
        `INSERT INTO "Корзина_Товар" ("id_Корзины", "id_Товара", "Количество")
         VALUES ($1, $2, $3)`,
        [basketId, item.id, item.quantity]
      );
    }
    await client.query(
      `UPDATE "Пользователь" SET "Адрес" = $1 WHERE "id_Пользователя" = $2`,
      [address, user.id_Пользователя]
    );

    res.send({ success: true });
  } catch (err) {
    console.error('Ошибка при создании заказа:', err);
    res.status(500).send('Ошибка сервера');
  }
});


app.get('/api/check-auth', (req, res) => {
  if (req.session.user) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});






app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
  

  
});
