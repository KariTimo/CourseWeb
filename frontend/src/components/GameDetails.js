import React, { useState, useEffect } from 'react';
import './GameDetails.css';
import axios from 'axios';
import ReviewForm from './ReviewForm';

function GameDetails({ game, onClose, onGameAdded }) {
  const [isInCollection, setIsInCollection] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  useEffect(() => {
    checkGameInCollection();
  }, [game]);

  const checkGameInCollection = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/user/games', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsInCollection(response.data.some(g => g.id === game.id));
    } catch (err) {
      console.error('Error checking game status:', err);
    }
  };
  // Добавьте обработчик успешной отправки отзыва
  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
  };

  const handleAddToCollection = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      await axios.post(
        'http://localhost:3001/api/user/games',
        { gameId: game.id },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      setIsInCollection(true);
      if (onGameAdded) {
        onGameAdded();
      }

      // Добавляем анимированное уведомление об успехе
      showSuccessNotification();
    } catch (err) {
      setError('Ошибка при добавлении игры в коллекцию');
    } finally {
      setLoading(false);
    }
  };

    const showSuccessNotification = () => {
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.textContent = 'Игра добавлена в коллекцию!';
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
    };

    const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating / 2);
    const hasHalfStar = rating % 2 >= 1;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="star">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="star half-filled">&#9733;</span>);
      } else {
        stars.push(<span key={i} className="star">☆</span>);
      }
    }
    return stars;
  };

  const getImageUrl = (imagePath) => {
    return `http://localhost:3001${imagePath}`;
  };

  return (
   <div className="game-details-overlay" onClick={onClose}>
      <div className="game-details-modal" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        <div className="modal-content">
          <div className="game-image-section">
            <img 
              src={getImageUrl(`/images/${game.image_name}`)} 
              alt={game.title}
              onError={(e) => {
                e.target.src = getImageUrl('/images/default.jpg');
              }}
            />
          </div>

          <div className="game-info-section">
          <h1 className="game-title">{game.title}</h1>
          
          <div className="game-rating">
              <span className="rating-value">{game.rating}/10</span>
              <div className="rating-stars">
                {renderStars(game.rating)}
              </div>
          </div>

          <p className="game-description">{game.description}</p>

          <div className="game-meta">
              <div className="meta-item">
                <div className="meta-label">Жанр</div>
                <div className="meta-value">{game.genre || 'Не указан'}</div>
              </div>

              <div className="meta-item">
                <div className="meta-label">Разработчик</div>
                <div className="meta-value">{game.developer || 'Не указан'}</div>
              </div>

              <div className="meta-item">
                <div className="meta-label">Дата выхода</div>
                <div className="meta-value">
                  {game.release_date 
                    ? new Date(game.release_date).toLocaleDateString('ru-RU')
                    : 'Не указана'
                  }
                </div>
              </div>

              <div className="meta-item">
                <div className="meta-label">Платформа</div>
                <div className="meta-value">{game.platform || 'Не указана'}</div>
              </div>
            </div>

            <div className="meta-item">
                <div className="meta-label">Цена</div>
                <div className="meta-value">{game.price || 'Не указана'} ₽</div>
              </div>

            {error && <div className="error-message">{error}</div>}

            <div className="game-actions">
              {!isInCollection ? (
                <button 
                  className={`action-button primary-action ${loading ? 'loading' : ''}`}
                  onClick={handleAddToCollection}
                  disabled={loading}
                >
                  {loading ? 'Добавление...' : 'Добавить в коллекцию'}
                </button>
              ) : (
                <div className="in-collection-badge">
                  В коллекции
                </div>
              )}
              <button 
                className="action-button secondary-action"
                onClick={() => setShowReviewForm(true)}
              >
                Написать отзыв
              </button>
            </div>
          </div>
          {showReviewForm && (
        <ReviewForm
          game={game}
          onClose={() => setShowReviewForm(false)}
          onReviewSubmitted={handleReviewSubmitted}
            />
          )}
        </div>
      </div>
    </div>
    
  );
}

export default GameDetails;