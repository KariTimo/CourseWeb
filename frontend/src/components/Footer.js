import React from 'react';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>О проекте</h3>
          <p>Каталог видеоигр - это платформа для поиска и коллекционирования ваших любимых игр.</p>
        </div>
        
        <div className="footer-section">
          <h3>Контакты</h3>
          <ul>
            <li><a href="mailto:OurEmail@game.com">OurEmail@game.com</a></li>
            <li><a href="tel:88005553535">8 (800) 555-35-35</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Социальные сети</h3>
          <div className="social-links">
            <a href="https://vk.com" target="_blank" rel="noopener noreferrer">VK</a>
            <a href="https://telegram.org" target="_blank" rel="noopener noreferrer">Telegram</a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer">Discord</a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {currentYear} Каталог видеоигр. Все права защищены.</p>
      </div>
    </footer>
  );
}

export default Footer;