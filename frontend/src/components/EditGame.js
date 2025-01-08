import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './EditGame.css';

function EditGame() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    genre: '',
    platform: '',
    rating: '',
    developer: '',
    release_date: '',
    image: null
  });
  const [error, setError] = useState('');
  const [currentImage, setCurrentImage] = useState('');

  useEffect(() => {
    fetchGameDetails();
  }, [id]);

  const fetchGameDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/games/${id}`);
      if (!response.ok) throw new Error('Failed to fetch game details');
      
      const game = await response.json();
      setFormData({
        title: game.title || '',
        description: game.description || '',
        price: game.price || '',
        genre: game.genre || '',
        platform: game.platform || '',
        rating: game.rating || '',
        developer: game.developer || '',
        release_date: game.release_date ? game.release_date.split('T')[0] : '',
      });
      setCurrentImage(game.image_url);
    } catch (error) {
      setError('Ошибка при загрузке данных игры');
      console.error('Error:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        image: e.target.files[0]
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();

      Object.keys(formData).forEach(key => {
        if (key !== 'image' && formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await fetch(`http://localhost:3001/api/games/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при обновлении игры');
      }

      navigate('/catalog');
    } catch (error) {
      setError(error.message);
      console.error('Error:', error);
    }
  };

  return (
    <div className="edit-game">
      <h2>Редактировать игру</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="edit-game-form">
        <div className="form-group">
          <label htmlFor="title">Название игры</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Описание игры</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="developer">Разработчик</label>
          <input
            type="text"
            id="developer"
            name="developer"
            value={formData.developer}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="release_date">Дата выхода</label>
          <input
            type="date"
            id="release_date"
            name="release_date"
            value={formData.release_date}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Цена</label>
          <input
            type="number"
            id="price"
            name="price"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="genre">Жанр</label>
          <select
            id="genre"
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            required
          >
            <option value="">Выберите жанр</option>
            <option value="action">Action</option>
            <option value="rpg">RPG</option>
            <option value="strategy">Strategy</option>
            <option value="adventure">Adventure</option>
            <option value="shooter">Shooter</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="platform">Платформа</label>
          <select
            id="platform"
            name="platform"
            value={formData.platform}
            onChange={handleChange}
            required
          >
            <option value="">Выберите платформу</option>
            <option value="pc">PC</option>
            <option value="ps5">PlayStation 5</option>
            <option value="ps4">PlayStation 4</option>
            <option value="xbox">Xbox Series X/S</option>
            <option value="switch">Nintendo Switch</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="rating">Рейтинг</label>
          <input
            type="number"
            id="rating"
            name="rating"
            min="0"
            max="10"
            step="0.1"
            value={formData.rating}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Изображение</label>
          {currentImage && (
            <div className="current-image">
              <img src={currentImage} alt="Current" />
              <p>Текущее изображение</p>
            </div>
          )}
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        <div className="form-buttons">
          <button type="button" onClick={() => navigate('/catalog')} className="cancel-btn">
            Отмена
          </button>
          <button type="submit" className="submit-btn">
            Сохранить
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditGame;