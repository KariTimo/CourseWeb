import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

      try {
        const response = await axios.post('http://localhost:3001/api/login', {
          username,
          password
        });
        
        // Проверка на admin/admin
    if (username === 'admin' && password === 'admin') {
      console.log('Admin login successful'); // Отладочный лог
      localStorage.setItem('token', 'admin-token');
      localStorage.setItem('isAdmin', 'true');
      window.location.reload(); // Добавляем перезагрузку страницы
      return;
    }
    else 
    {
      console.log('user login successful'); // Отладочный лог

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('username', username);
        navigate('/catalog');      
    }
  } catch (err) {
    setError('Неверное имя пользователя или пароль');
  }

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(username,password),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('isAdmin', 'false');
        navigate('/');
      } else {
        setError(data.message || 'Ошибка при входе');
      }
    } catch (error) {
      setError('Ошибка сервера');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Вход</h2>
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Имя пользователя"
            required
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            required
          />
        </div>

        <button type="submit" className="login-button">
          Войти
        </button>

        <div className="register-prompt">
          Нет аккаунта? 
          <button 
            type="button" 
            className="register-link"
            onClick={() => navigate('/register')}
          >
            Зарегистрироваться
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;