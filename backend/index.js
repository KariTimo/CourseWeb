const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Подключение к PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'CatalogGames',
  password: 'postgres',
  port: 5432,
});

// Регистрация
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Проверяем существующего пользователя
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Пользователь с таким именем или email уже существует' 
      });
    }

    // Создаем нового пользователя
    const result = await pool.query(
      `INSERT INTO users (username, email, password, role, balance) 
       VALUES ($1, $2, $3, 'user', 0) 
       RETURNING id, username, email, role`,
      [username, password, email]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
});

// Вход
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT id, username, email, role FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при входе' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});