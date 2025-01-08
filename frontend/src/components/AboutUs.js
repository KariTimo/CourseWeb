import React from 'react';
import './AboutUs.css';

function AboutUs() {
  return (
    <div className="about-container">
      <div className="about-content">
        <h1 className="about-title">О нас</h1>
        
        <section className="about-section">
          <h2>Добро пожаловать в Game Catalog</h2>
          <p>
            Game Catalog - это инновационная платформа для геймеров, где вы можете 
            отслеживать свои любимые игры, делиться впечатлениями и находить новые 
            приключения в мире видеоигр.
          </p>
        </section>

        <section className="about-section">
          <h2>Наша миссия</h2>
          <p>
            Мы стремимся создать уникальное пространство для игрового сообщества, 
            где каждый геймер может:
          </p>
          <ul className="features-list">
            <li>Создавать персональную коллекцию игр</li>
            <li>Отслеживать новинки игровой индустрии</li>
            <li>Делиться мнением о играх</li>
            <li>Находить единомышленников</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>Почему мы?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <h3>🎮 Большая база игр</h3>
              <p>Тысячи игр разных жанров и платформ</p>
            </div>
            <div className="benefit-card">
              <h3>💫 Удобный интерфейс</h3>
              <p>Интуитивно понятная навигация и современный дизайн</p>
            </div>
            <div className="benefit-card">
              <h3>🤝 Активное сообщество</h3>
              <p>Общение с другими геймерами и обмен опытом</p>
            </div>
            <div className="benefit-card">
              <h3>🔄 Регулярные обновления</h3>
              <p>Постоянное добавление новых игр и функций</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Присоединяйтесь к нам</h2>
          <p>
            Станьте частью нашего растущего сообщества геймеров. 
            Регистрируйтесь, создавайте свою коллекцию и делитесь 
            впечатлениями от любимых игр!
          </p>
        </section>
      </div>
    </div>
  );
}

export default AboutUs;