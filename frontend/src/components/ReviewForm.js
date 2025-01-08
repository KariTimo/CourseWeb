import React, { useState } from 'react';
import './ReviewForm.css';

function ReviewForm({ game, onClose}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Пожалуйста, поставьте оценку');
      return;
    }

      setIsSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 3000);
    };

  if (isSubmitted) {
    return (
      <div className="review-form-overlay" onClick={onClose}>
        <div className="review-form-modal review-submitted">
          <div className="submission-message">
            <div className="submission-icon">✓</div>
            <h2>Спасибо за ваш отзыв!</h2>
            <p>Ваш отзыв отправлен на модерацию.</p>
            <p className="submission-note">Обычно проверка занимает не более 24 часов.</p>
            <div className="loading-animation">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="review-form-overlay" onClick={onClose}>
      <div className="review-form-modal" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        <h2>Написать отзыв</h2>
        <h3>{game.title}</h3>

        <form onSubmit={handleSubmit}>
          <div className="rating-input">
            <p>Ваша оценка:</p>
            <div className="stars-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div className="review-input">
            <textarea
              placeholder="Поделитесь своими впечатлениями об игре..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="submit-button"
          >
            Опубликовать отзыв
          </button>
        </form>
      </div>
    </div>
  );
}

export default ReviewForm;