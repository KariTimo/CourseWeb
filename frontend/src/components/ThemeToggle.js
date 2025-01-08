import React from 'react';
import './ThemeToggle.css';

function ThemeToggle({ isDark, onToggle }) {
  return (
    <div className="theme-toggle">
      <label className="switch">
        <input
          type="checkbox"
          checked={isDark}
          onChange={onToggle}
        />
        <span className="slider round"></span>
      </label>
    </div>
  );
}

export default ThemeToggle;