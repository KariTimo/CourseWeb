import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserProfile.css';
function UserProfile() {
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    avatar_url: null,
    registration_date: new Date(),
    games_count: 0
  });
  const [userGames, setUserGames] = useState([]);
  const [avatarError, setAvatarError] = useState(false);
  const defaultAvatar = '/images/avatars/cat.jpg';
  
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return '/images/default-avatar.png';
    // Добавляем базовый URL сервера
    return `http://localhost:3001${avatarPath}`;
  };
  
  useEffect(() => {
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) {
      setProfileData(prev => ({
        ...prev,
        avatar_url: savedAvatar
      }));
    }
  }, []);

  useEffect(() => {
    const fetchUserGames = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }
        const response = await axios.get('http://localhost:3001/api/user/games', 
          {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setUserGames(response.data);
        
        const response2 = await fetch('http://localhost:3001/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response2.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response2.json();
        console.log('Profile data received:', data); // Для отладки
        setProfileData(data);
        setProfileData(prev => ({
          ...prev,
          games_count: response.data.length
        }));
      } catch (err) {
        console.error('Error fetching user games:', err);
      }
    };
    fetchUserGames();
    
  }, []);

  
  const handleAvatarUpload = async (event) => {
     try {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3001/api/profile/avatar', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload avatar');
    }

    const data = await response.json();
    console.log('Upload response:', data); // Отладочный лог

    // Убираем await перед setProfileData
    setProfileData(prev => ({
      ...prev,
      avatar_url: data.avatar_url
    }));

  } catch (error) {
    console.error('Error uploading avatar:', error);
  }
};

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar-section">
            <div className="avatar-container">
            <img 
     src={getAvatarUrl(profileData.avatar_url)}
    alt="Profile avatar"
    className="profile-avatar"
    onError={(e) => {
      console.log('Image load error:', profileData.avatar_url);
      setAvatarError(true);
      e.target.src = '/images/avatars/cat.jpg';
    }}
      />
            </div>
            <div className="avatar-upload">
            <label className="avatar-upload-button" htmlFor="avatar-input">
            Изменить аватар
              </label>
              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>

        <div className="profile-info">
          <div className="profile-field">
            <label>Имя пользователя:</label>
            <span>{profileData.username || 'Не указано'}</span>
          </div>
          
          <div className="profile-field">
            <label>Email:</label>
            <span>{profileData.email || 'Не указано'}</span>
          </div>

          <div className="profile-field">
            <label>О себе:</label>
            <span>{profileData.bio || 'Информация отсутствует'}</span>
          </div>

          <div className="profile-field">
            <label>Дата регистрации:</label>
            <span>
              {new Date(profileData.registration_date).toLocaleDateString('ru-RU')}
            </span>
          </div>
        </div>

        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-value">{profileData.games_count}</div>
            <div className="stat-label">Игр в коллекции</div>
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default UserProfile;