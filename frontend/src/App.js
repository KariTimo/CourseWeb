import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate  } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import GamesList from './components/GamesList';
import UserGames from './components/UserGames';
import UserProfile from './components/UserProfile';
import Login from './components/Login';
import Register from './components/Register';
import Background from './components/Background';
import AboutUs from './components/AboutUs';
import AddGame from './components/AddGame';
import EditGame from './components/EditGame';
import ThemeToggle from './components/ThemeToggle';
import './App.css';

// Создаем компонент для управления отображением футера
function AppContent() {
  const isAuthenticated = !!localStorage.getItem('token');
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });
  const navigate = useNavigate();

  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(adminStatus);
    console.log('Admin status:', adminStatus); // Отладочный лог
  }, []);

  // Применяем тему при изменении
  useEffect(() => {
    document.body.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
  }, [isDarkTheme]);

  // Функция переключения темы
  const toggleTheme = () => {
    setIsDarkTheme(prevTheme => !prevTheme);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    navigate('/login');
    window.location.reload();
  };

  // Проверяем, находимся ли мы на странице логина или регистрации
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // Если это админ, показываем только каталог
  if (isAdmin) {
    return (
      <div className="app">
        <div className="admin-header">
          <h1>Каталог игр</h1>
          <button onClick={handleLogout} className="logout-btn">Выйти</button>
        </div>
        <main className="main-content">
          <Routes>
            <Route path="/catalog" element={<GamesList />} />
            <Route path="/admin/games/add" element={<AddGame />} />
            <Route path="/admin/games/edit/:id" element={<EditGame />} />
            <Route path="*" element={<GamesList />} />
          </Routes>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app" data-theme={isDarkTheme ? 'dark' : 'light'}>
       
      {isAuthenticated && <Navigation />}
      {/* Добавляем переключатель темы */}
      <ThemeToggle isDark={isDarkTheme} onToggle={toggleTheme} />
      <main className={`main-content ${isAuthPage ? 'auth-page' : ''}`}>
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/catalog" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/catalog" />} />
          <Route path="/catalog" element={isAuthenticated ? <GamesList /> : <Navigate to="/login" />} />
          <Route path="/my-games" element={isAuthenticated ? <UserGames /> : <Navigate to="/login" />} />
          <Route path="/profile" element={isAuthenticated ? <UserProfile /> : <Navigate to="/login" />} />
          <Route path="/" element={isAuthenticated ? <Navigate to="/catalog" /> : <Navigate to="/login" />} />
          <Route path="/about" element={isAuthenticated ? <AboutUs /> : <Navigate to="/login"/>} />
        </Routes>
      </main>
      {/* Отображаем Footer только если пользователь авторизован и не находится на странице авторизации/регистрации */}
      {isAuthenticated && !isAuthPage && <Footer />}
    </div>
  );
}

// Основной компонент приложения
function App() {
  return (
    <Router>
      <Background />
      <AppContent />
    </Router>
  );
}

export default App;