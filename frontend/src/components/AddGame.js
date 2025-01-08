import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddGame.css';

function AddGame() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '', // изменено с bio на description
    price: '',
    genre: '',
    platform: '',
    rating: '',
    release_date: '',
    developer: '',
    image: null
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      const formDataToSend = new FormData();
      
      // Добавляем все текстовые поля
      Object.keys(formData).forEach(key => {
        if (key !== 'image' && formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Добавляем файл отдельно
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await fetch('http://localhost:3001/api/games', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при добавлении игры');
      }

      const data = await response.json();
      console.log('Success:', data);
      navigate('/catalog');
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Ошибка при добавлении игры');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setFormData(prevState => ({
        ...prevState,
        image: e.target.files[0]
      }));
    }
  };

  return (
    <div className="add-game">
      <h2>Добавить новую игру</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="add-game-form">
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
            required
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
            required
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
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
        </div>

        <div className="form-buttons">
          <button type="button" onClick={() => navigate('/catalog')} className="cancel-btn">
            Отмена
          </button>
          <button type="submit" className="submit-btn">
            Добавить
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddGame;