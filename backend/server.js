const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const multer = require('multer');

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/avatars/'); // Убедитесь, что эта папка существует
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Создаем хранилище для изображений игр
const gameStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/'); // Путь для изображений игр
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Неподдерживаемый формат файла'));
    }
  }
});

// Создаем отдельные middleware для загрузки
const uploadGame = multer({ storage: gameStorage });

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Настройка статических файлов
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Добавьте middleware для раздачи статических файлов
app.use('/images/avatars', express.static(path.join(__dirname, 'public/uploads/avatars')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'CatalogGames',
  password: 'postgres', 
  port: 5432,
});

// JWT Secret Key
const JWT_SECRET = 'your-secret-key'; // В продакшене используйте переменные окружения

// Middleware для проверки авторизации
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Не авторизован' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userData = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Недействительный токен' });
  }
};

// Middleware для проверки JWT токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Токен не предоставлен' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
};

// Регистрация
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Проверяем, существует ли пользователь
    const userExists = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        message: 'Пользователь с таким именем или email уже существует'
      });
    }

    // Хешируем пароль
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Создаем нового пользователя
    const newUser = await pool.query(
      `INSERT INTO users (username, email, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING id, username, email`,
      [username, email, hashedPassword]
    );

    // Создаем JWT токен
    const token = jwt.sign(
      {
        userId: newUser.rows[0].id,
        username: newUser.rows[0].username,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Отправляем ответ
    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.rows[0].id,
        username: newUser.rows[0].username,
        email: newUser.rows[0].email
      }
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      message: 'Ошибка при регистрации пользователя'
    });
  }
});

// Вход
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }
    
    const validPassword = await bcrypt.compare(password, result.rows[0].password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Неверный пароль' });
    }
    
    const token = jwt.sign(
      { userId: result.rows[0].id, 
        username: result.rows[0].username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ token, username: result.rows[0].username });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

const fs = require('fs');

// Middleware для проверки существования файлов
app.use('/uploads', (req, res, next) => {
  const filePath = path.join(__dirname, 'public', req.url);
  if (fs.existsSync(filePath)) {
    next();
  } else {
    res.status(404).send('File not found');
  }
});

// Маршрут для получения профиля пользователя
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Убедитесь, что userId корректно извлекается из токена
    console.log('Fetching profile for user:', userId); // Отладочный лог

    const result = await pool.query(`
      SELECT 
        id,
        username,
        email,
        bio,
        registration_date,
        avatar_url
      FROM users 
      WHERE id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Профиль не найден' });
    }

    // Модифицируем URL аватара
    const userData = result.rows[0];
    


    res.json(userData);

  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Ошибка при получении данных профиля' });
  }
});

// Защищенный endpoint для проверки авторизации
app.get('/api/profile', authMiddleware, async (req, res) => {
  res.json(req.userData);
});

// Endpoint для добавления новой игры
app.post('/api/games', uploadGame.single('image'), async (req, res) => {
  try {
    console.log('Received request body:', req.body); // Отладочный лог
    console.log('Received file:', req.file); // Отладочный лог

    const { 
      title, 
      description, 
      price, 
      genre, 
      platform, 
      rating,
      developer,        // добавляем поле разработчика
      release_date     // добавляем дату выхода
    } = req.body;

   

    // Проверяем наличие обязательных полей
    if (!title || !description || !price || !genre || !platform || !rating || !release_date || !developer) {
      return res.status(400).json({ 
        message: 'Все поля обязательны для заполнения',
        receivedData: req.body 
      });
    }

     // Сохраняем оригинальное имя файла и путь к нему
    const image_name = req.file ? req.file.originalname : null;
    const image_path = req.file ? `public/images/${req.file.originalname}` : null;

    console.log(image_name);
    console.log(image_path);

    const result = await pool.query(
      `INSERT INTO games (
        title, description, price, genre, platform, 
        rating, image_name, image_path, developer, release_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *`,
      [
        title, 
        description, 
        price, 
        genre, 
        platform, 
        rating, 
        image_name, 
        image_path,
        developer,
        release_date
      ]
    );

    // Добавляем полный URL для изображения в ответ
    const game = result.rows[0];
    game.image_url = game.image_path ? `/images/${game.image_name}` : null;

    res.json(game);
  } catch (error) {
    console.error('Error adding game:', error);
    res.status(500).json({ message: 'Ошибка при добавлении игры' });
  }
});

// Получение информации об одной игре
app.get('/api/games/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM games WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Игра не найдена' });
    }

    const game = result.rows[0];
    game.image_url = game.image_path ? `http://localhost:3001/uploads/${game.image_path}` : null;
    
    res.json(game);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Ошибка при получении информации об игре' });
  }
});

// Обновление информации об игре
app.put('/api/games/:id', uploadGame.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      price, 
      genre, 
      platform, 
      rating,
      developer,
      release_date
    } = req.body;

    let updateQuery = `
      UPDATE games 
      SET title = $1, description = $2, price = $3, 
          genre = $4, platform = $5, rating = $6,
          developer = $7, release_date = $8
    `;
    
    const values = [
      title, 
      description, 
      price, 
      genre, 
      platform, 
      rating,
      developer,
      release_date
    ];

    if (req.file) {
      // Если загружено новое изображение
      const image_name = req.file.originalname;
      const image_path = `/images/${req.file.originalname}`

      console.log(image_name);
      console.log(image_path);

      updateQuery += `, image_name = $9, image_path = $10 WHERE id = $11 RETURNING *`;
      values.push(image_name, image_path, id);
    } else {
      updateQuery += ` WHERE id = $9 RETURNING *`;
      values.push(id);
    }

    const result = await pool.query(updateQuery, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Игра не найдена' });
    }

    const game = result.rows[0];
    game.image_url = game.image_path ? `http://localhost:3001/uploads/${game.image_path}` : null;

    res.json(game);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Ошибка при обновлении игры' });
  }
});

// Endpoint для удаления игры
app.delete('/api/games/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Получаем информацию о игре для удаления файла изображения
    const game = await pool.query('SELECT image_path FROM games WHERE id = $1', [id]);
    
    if (game.rows[0]?.image_path) {
      const imagePath = path.join(__dirname, 'uploads', game.rows[0].image_path);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await pool.query('DELETE FROM games WHERE id = $1', [id]);
    res.json({ message: 'Игра успешно удалена' });
  } catch (error) {
    console.error('Error deleting game:', error);
    res.status(500).json({ message: 'Ошибка при удалении игры' });
  }
});

// Получение списка игр
app.get('/api/games', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM games ORDER BY id DESC');
    
    // Добавляем полные URL для изображений
    const games = result.rows.map(game => ({
      ...game,
      image_url: game.image_path ? `http://localhost:3001/uploads/${game.image_path}` : null
    }));
    
    res.json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ message: 'Ошибка при получении списка игр' });
  }
});

// Добавление игры в профиль пользователя
app.post('/api/user/games', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.userData;
    const { gameId } = req.body;
    
    const result = await pool.query(
      'INSERT INTO user_games (user_id, game_id) VALUES ($1, $2) RETURNING *',
      [userId, gameId]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error adding game to profile:', err);
    res.status(500).json({ error: 'Error adding game to profile' });
  }
});

// Получение игр пользователя
app.get('/api/user/games', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.userData;
    
    const result = await pool.query(
      `SELECT g.* FROM games g
       JOIN user_games ug ON g.id = ug.game_id
       WHERE ug.user_id = $1`,
      [userId]
    );
    // Отправляем результат
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching user games:', err);
    res.status(500).json({ error: 'Error fetching user games' });
  }
});

// Удаление игры из профиля
app.delete('/api/user/games/:gameId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.userData;
    const { gameId } = req.params;
    
    await pool.query(
      'DELETE FROM user_games WHERE user_id = $1 AND game_id = $2',
      [userId, gameId]
    );
    
    res.json({ message: 'Game removed from profile' });
  } catch (err) {
    console.error('Error removing game from profile:', err);
    res.status(500).json({ error: 'Error removing game from profile' });
  }
});

/// В endpoint загрузки аватара
app.post('/api/profile/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не загружен' });
    }

    const userId = req.user.userId;
    // Используем относительный путь для сохранения в базе
    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    console.log('Saving avatar path:', avatarPath); // Отладочный лог
    const result = await pool.query(
      'UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING avatar_url',
      [avatarPath, userId] // Сохраняем относительный путь
    );
    console.log('Updated user:', result.rows[0]); // Отладочный лог  

    res.json({ 
      message: 'Аватар успешно обновлен',
      avatar_url: avatarPath
    });

  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({ message: 'Ошибка при обновлении аватара' });
  }
});

// Получение всех игр
app.get('/api/games', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM games');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching games:', err);
    res.status(500).json({ error: 'Error fetching games' });
  }
});

// Запуск сервера
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
