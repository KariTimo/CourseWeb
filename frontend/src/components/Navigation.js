import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <nav className="header">
      <div className="header-left">
        <Link to="/catalog" className="logo">
          GameCatalog
        </Link>
      </div>

      <div className="header-center">
        <Link 
          to="/catalog" 
          className={`nav-link ${location.pathname === '/catalog' ? 'active' : ''}`}
        >
          Каталог игр
        </Link>
        <Link 
          to="/my-games" 
          className={`nav-link ${location.pathname === '/my-games' ? 'active' : ''}`}
        >
          Мои игры
        </Link>
        <Link 
          to="/profile" 
          className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
        >
          Мой профиль
        </Link>
        <Link 
          to="/about" 
          className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
        >
          О нас
        </Link>
      </div>
      
      <div className="header-right">
        <span className="username">Привет, {username}!</span>
        <button onClick={handleLogout} className="logout-btn">
          Выйти
        </button>
      </div>
    </nav>
  );
}

export default Navigation;