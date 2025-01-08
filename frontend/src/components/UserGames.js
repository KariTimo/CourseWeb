import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UserGames.css';

function UserGames() {
  const [userGames, setUserGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserGames = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3001/api/user/games', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserGames(response.data);
      } catch (err) {
        setError('Ошибка при загрузке ваших игр');
      } finally {
        setLoading(false);
      }
    };

    fetchUserGames();
  }, []);

  const removeGame = async (gameId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/api/user/games/${gameId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserGames(userGames.filter(game => game.id !== gameId));
    } catch (err) {
      console.error('Error removing game:', err);
      alert('Ошибка при удалении игры из профиля');
    }
  };

  const getImageUrl = (imagePath) => {
    return `http://localhost:3001${imagePath}`;
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className="user-games">
      <h2>Мои игры</h2>
      <div className="games-grid">
        {userGames.map(game => (
          <div key={game.id} className="game-card">
            <div className="game-image-container">
              <img 
                src={getImageUrl(`/images/${game.image_name}`)}
                alt={game.title}
                className="game-image"
                onError={(e) => {
                  e.target.src = getImageUrl('/images/default.jpg');
                }}
              />
            </div>
            <div className="game-info">
              <h3>{game.title}</h3>
              <p className="game-description">{game.description}</p>
              <div className="game-actions">
            {game.genre && <p>Жанр: {game.genre}</p>}
            <button
                  className="remove-btn"
                  onClick={() => removeGame(game.id)}
                >
                  Удалить из профиля
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {userGames.length === 0 && (
        <div className="empty-state">
          <p>У вас пока нет добавленных игр</p>
        </div>
      )}
    </div>
  );
}

export default UserGames;