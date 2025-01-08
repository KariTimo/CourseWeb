import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import GameDetails from './GameDetails';
import { FaSearch } from 'react-icons/fa';
import './GamesList.css';

function GamesList() {
  const [games, setGames] = useState([]);
  const [userGames, setUserGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [filteredGames, setFilteredGames] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [gameToDelete, setGameToDelete] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // Список доступных жанров
  const genres = [
    { value: 'all', label: 'Все жанры' },
    { value: 'action', label: 'Action' },
    { value: 'rpg', label: 'RPG' },
    { value: 'strategy', label: 'Strategy' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'shooter', label: 'Shooter' },
    { value: 'fighting', label: 'Fighting' },
    { value: 'horror', label: 'Horror' },
    { value: 'action-adventure', label: 'Action-Adventure' },
    { value: 'survival', label: 'Survival' },
  ];

  // Список ценовых диапазонов
  const priceRanges = [
    { value: 'all', label: 'Все цены' },
    { value: '1000', label: 'До 1000 ₽' },
    { value: '2000', label: 'До 2000 ₽' },
    { value: '3000', label: 'До 3000 ₽' },
    { value: '5000', label: 'До 5000 ₽' }
  ];

  /*useEffect(() => {
    filterGames();
  }, [searchTerm, games]);*/

  // Фильтрация игр при изменении выбранного жанра или списка игр
  useEffect(() => {
    filterGames();
  }, [selectedGenre,  selectedPrice, searchTerm, games]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const headers = {
          'Content-Type': 'application/json'
        };
        
        // Добавляем токен в заголовки, если это админ
        if (isAdmin && token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('http://localhost:3001/api/games', {
          headers: headers
        });

        if (!response.ok) {
          throw new Error('Failed to fetch games');
        }

        const data = await response.json();
        setGames(data);
        setFilteredGames(data); // Изначально показываем все игры
        setError('');
      } catch (error) {
        console.error('Error fetching games:', error);
        setError('Ошибка при загрузке игр');
      }
    };

    fetchGames();
  }, [isAdmin, token]);

  const handleAddGame = () => {
    navigate('/admin/games/add');
  };

  const handleEditGame = (gameId) => {
    navigate(`/admin/games/edit/${gameId}`);
  };

  // Показать подтверждение удаления
  const handleDeleteClick = (game) => {
    setGameToDelete(game);
    setIsDeleting(true);
  };

  // Отменить удаление
  const handleCancelDelete = () => {
    setGameToDelete(null);
    setIsDeleting(false);
  };

  // Подтвердить и выполнить удаление
  const handleConfirmDelete = async () => {
    if (!gameToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/games/${gameToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete game');
      }

      // Обновляем список игр после удаления
      setGames(games.filter(game => game.id !== gameToDelete.id));
      setGameToDelete(null);
      setIsDeleting(false);
    } catch (error) {
      setError('Ошибка при удалении игры');
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const [gamesResponse, userGamesResponse] = await Promise.all([
          axios.get('http://localhost:3001/api/games', { headers }),
          axios.get('http://localhost:3001/api/user/games', { headers })
        ]);

        setGames(gamesResponse.data);
        setFilteredGames(gamesResponse.data);
        setUserGames(userGamesResponse.data.map(g => g.id));
      } catch (err) {
        setError('Ошибка при загрузке игр');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  

  const addToProfile = async (gameId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3001/api/user/games', 
        { gameId },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setUserGames([...userGames, gameId]);
    } catch (err) {
      setError('Ошибка при добавлении игры');
    }
  };
 
  const filterGames = () => {
    let filtered = [...games];

    // Фильтрация по жанру
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(game => 
        game.genre.toLowerCase() === selectedGenre.toLowerCase()
      );
    }

    // Фильтрация по цене
    if (selectedPrice !== 'all') {
      const maxPrice = parseInt(selectedPrice);
      filtered = filtered.filter(game => game.price <= maxPrice);
    }

    // Поиск по названию
    if (searchTerm) {
      filtered = filtered.filter(game =>
        game.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredGames(filtered);
  };

  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
  };

  const handlePriceChange = (e) => {
    setSelectedPrice(e.target.value);
  };

  const handleShowDetails = (game) => {
    setSelectedGame(game);
  };

  const handleCloseDetails = () => {
    setSelectedGame(null);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };


  if (loading) return <div>Загрузка...</div>;
  if (error) return <div className="error-message">{error}</div>;

  const getImageUrl = (imagePath) => {
    return `http://localhost:3001${imagePath}`;
  };
  
  


  return (
    <div className="games-container">
      <h2>Каталог игр</h2>
      
      {isAdmin && (
          <button className="add-game-btn" onClick={handleAddGame}>
            Добавить игру
          </button>
        )} 

        {isDeleting && gameToDelete && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h3>Подтверждение удаления</h3>
            <p>Вы уверены, что хотите удалить игру "{gameToDelete.title}"?</p>
            <div className="delete-modal-buttons">
              <button className="cancel-btn" onClick={handleCancelDelete}>
                Отмена
              </button>
              <button className="delete-btn" onClick={handleConfirmDelete}>
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}  
             

      <div className="search-container">
        <div className={`search-box ${isSearchExpanded ? 'expanded' : ''}`}>
          <FaSearch 
            className="search-icon" 
            onClick={() => setIsSearchExpanded(!isSearchExpanded)} 
          />
          <input
            type="text"
            placeholder={isSearchExpanded ? "Поиск игр..." : ""}
            value={searchTerm}
            onChange={handleSearch}
            onFocus={() => setIsSearchExpanded(true)}
            onBlur={(e) => {
              if (!e.target.value) {
                setIsSearchExpanded(false);
              }
            }}
          />
        </div>
      </div>

      {/* Секция фильтров */}
      <div className="filter-section">
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="genre-filter">Жанр:</label>
            <select 
              id="genre-filter"
              value={selectedGenre} 
              onChange={handleGenreChange}
              className="filter-select"
            >
              {genres.map(genre => (
                <option key={genre.value} value={genre.value}>
                  {genre.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="price-filter">Цена:</label>
            <select 
              id="price-filter"
              value={selectedPrice} 
              onChange={handlePriceChange}
              className="filter-select"
            >
              {priceRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="games-count">
          Найдено игр: {filteredGames.length}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
            
            <div className="games-grid">

        {/* Используем filteredGames вместо games */}
        {filteredGames.map(game => (
          <div key={game.id} className="game-card">
            <div className="game-image-container">
              <img 
                src={getImageUrl(`/images/${game.image_name}`)} 
                alt={game.title}
                className="game-image"
                onError={(e) => {
                  e.target.onerror = null; // Предотвращаем бесконечную рекурсию
                  e.target.src = getImageUrl('/images/default.jpg');
                }}
              />
            </div>
            
            {filteredGames.length === 0 && (
        <div className="no-games-message">
          Игры не найдены
        </div>
      )}

          
          

            <div className="game-info">
              <h3>{game.title}</h3>
              <p className="game-description">{game.description}</p>
              {!isAdmin && (
              <div className="game-actions">
                
                <button
                  className="details-btn"
                  onClick={() => handleShowDetails(game)}
                >
                  Подробнее
                </button>
                {!userGames.includes(game.id) ? (
                  <button
                    onClick={() => addToProfile(game.id)}
                    className="add-game-btn"
                  >
                    Добавить в профиль
                  </button>
                ) : (
                  <span className="in-profile-badge">В профиле</span>
                )}
              </div>             
            )}
            </div>
            {isAdmin && (
                <div className="game-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEditGame(game.id)}
                  >
                    Изменить
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteClick(game)}
                  >
                    Удалить
                  </button>
                </div>
              )}
          </div>
        ))}
        
      </div>

      {selectedGame && (
        <GameDetails 
          game={selectedGame} 
          onClose={handleCloseDetails} 
        />
      )}
    </div>
  );
}

export default GamesList;