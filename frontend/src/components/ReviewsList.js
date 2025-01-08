import React from 'react';
import './ReviewsList.css';

function ReviewsList({ reviews }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="reviews-list">
      <h3>Отзывы</h3>
      {reviews.length === 0 ? (
        <p className="no-reviews">Пока нет отзывов. Будьте первым!</p>
      ) : (
        reviews.map(review => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <div className="user-info">
                <img 
                  src={review.user.avatar_url || '/default-avatar.png'} 
                  alt="Аватар"
                  className="user-avatar"
                />
                <span className="username">{review.user.username}</span>
              </div>
              <div className="review-rating">
                {[...Array(5)].map((_, i) => (
                  <span 
                    key={i} 
                    className={`star ${i < review.rating ? 'filled' : ''}`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <div className="review-content">{review.content}</div>
            <div className="review-date">
              {formatDate(review.created_at)}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default ReviewsList;