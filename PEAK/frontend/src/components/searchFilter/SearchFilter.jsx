import React from 'react';
import { Search } from 'lucide-react';
import './SearchFilter.css';

const SearchFilter = ({ onSearch, onDifficultyChange }) => {
  return (
    <div className="search-filter">
      <div className="search-box">
        <Search size={20} />
        <input
          type="text"
          placeholder="Išči po lokaciji, cilju ali regiji..."
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <select 
        className="difficulty-select"
        onChange={(e) => onDifficultyChange(e.target.value)}
      >
        <option value="">Vse zahtevnosti</option>
        <option value="lahka">Lahka</option>
        <option value="srednja">Srednja</option>
        <option value="zahtevna">Zahtevna</option>
        <option value="zelo zahtevna">Zelo zahtevna</option>
      </select>
    </div>
  );
};

export default SearchFilter;