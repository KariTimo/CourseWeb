import React, { useEffect } from 'react';

function Background() {
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // Случайная начальная позиция
      particle.style.left = Math.random() * window.innerWidth + 'px';
      particle.style.top = window.innerHeight + 'px';
      
      // Случайный размер
      const size = Math.random() * 3 + 1;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      
      // Случайная прозрачность
      particle.style.opacity = Math.random() * 0.5 + 0.3;
      
      // Случайная скорость анимации
      const duration = Math.random() * 3 + 3;
      particle.style.animation = `float ${duration}s linear`;
      
      document.body.appendChild(particle);
      
      // Удаляем частицу после завершения анимации
      setTimeout(() => {
        particle.remove();
      }, duration * 1000);
    };

    // Создаем новые частицы каждые 200мс
    const interval = setInterval(createParticle, 200);

    return () => {
      clearInterval(interval);
      // Удаляем все частицы при размонтировании компонента
      const particles = document.querySelectorAll('.particle');
      particles.forEach(particle => particle.remove());
    };
  }, []);

  return null;
}

export default Background;