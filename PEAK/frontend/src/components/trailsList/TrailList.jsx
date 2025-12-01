import React, { useState } from 'react';
import TrailCard from '../trailCard/TrailCard';
import SearchFilter from '../searchFilter/SearchFilter';
import './trailList.css';

const TrailList = ({ trails }) => {
  const [filteredTrails, setFilteredTrails] = useState(trails);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  const handleSearch = (term) => {
    setSearchTerm(term);
    filterTrails(term, selectedDifficulty);
  };

  const handleDifficultyChange = (difficulty) => {
    setSelectedDifficulty(difficulty);
    filterTrails(searchTerm, difficulty);
  };

  const filterTrails = (term, difficulty) => {
    let filtered = trails;

    if (term) {
      filtered = filtered.filter(trail => 
        trail.izhod_info?.toLowerCase().includes(term.toLowerCase()) ||
        trail.cilj_info?.toLowerCase().includes(term.toLowerCase()) ||
        trail.Teritorij?.toLowerCase().includes(term.toLowerCase())
      );
    }

    if (difficulty) {
      filtered = filtered.filter(trail => 
        trail.Zahtevnost?.toLowerCase().includes(difficulty.toLowerCase())
      );
    }

    setFilteredTrails(filtered);
  };

  return (
    <section className="trail-list-section">
      <div className="container">
        <div className="section-header">
          <h2>Odkrijte Planinske Poti</h2>
          <p>Izberite izmed {trails.length} planinskih poti po Sloveniji</p>
        </div>

        <SearchFilter 
          onSearch={handleSearch}
          onDifficultyChange={handleDifficultyChange}
        />

        <div className="trails-grid">
          {filteredTrails.length > 0 ? (
            filteredTrails.map(trail => (
              <TrailCard key={trail.id} trail={trail} />
            ))
          ) : (
            <div className="no-results">
              <p>Ni najdenih poti. Poskusite z drugimi filtri.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TrailList;