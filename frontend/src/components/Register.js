import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './AuthForms.css';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Отправка формы регистрации...'); // Отладка

    // Проверка совпадения паролей
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      console.log('Отправка запроса на регистрацию...'); // Отладка
      const response = await axios.post('http://localhost:3001/api/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      console.log('Ответ сервера:', response.data); // Отладка

      if (response.data.token) {
        // Сохраняем токен
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.user.id);
        localStorage.setItem('username', response.data.user.username);

        // Устанавливаем токен для будущих запросов
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        // Перенаправляем на каталог
        navigate('/catalog');
      }
    } catch (err) {
      console.error('Ошибка при регистрации:', err); // Отладка
      setError(
        err.response?.data?.message || 
        'Произошла ошибка при регистрации'
      );
    }
  };
  
  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Регистрация</h2>
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Имя пользователя"
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Пароль"
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Подтвердите пароль"
            required
            className="form-input"
          />
        </div>

        <button type="submit" className="auth-button"
         >
          Зарегистрироваться        
        </button>

        <div className="auth-switch">
          Уже есть аккаунт?<Link to="/login">Войти</Link>         
        </div>
      </form>
    </div>
  );
}

export default Register;