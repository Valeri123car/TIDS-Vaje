import React, { useState, useEffect } from 'react';
import { MapPin, TrendingUp, Clock, Thermometer } from 'lucide-react';
import { getWeatherForTrail } from '../../api/weatherApi';
import './trailCard.css';

const TrailCard = ({ trail }) => {
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  useEffect(() => {
    // Load weather on hover or mount
    loadWeather();
  }, [trail.id]);

  const loadWeather = async () => {
    if (!weather && !loadingWeather) {
      setLoadingWeather(true);
      const weatherData = await getWeatherForTrail(trail);
      setWeather(weatherData);
      setLoadingWeather(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    if (!difficulty) return '#6c757d';
    const lower = difficulty.toLowerCase();
    if (lower.includes('lahka')) return '#27ae60';
    if (lower.includes('srednja')) return '#f39c12';
    if (lower.includes('zahtevna') && lower.includes('zelo')) return '#e74c3c';
    if (lower.includes('zahtevna')) return '#e67e22';
    return '#6c757d';
  };

  return (
    <div className="trail-card" onMouseEnter={loadWeather}>
      <div className="trail-card-image">
        <img 
          src={`https://picsum.photos/seed/${trail.id}/400/250`}
          alt={trail.izhod_info || 'Planinska pot'}
          loading="lazy"
        />
        <div className="trail-card-badge" style={{ background: getDifficultyColor(trail.Zahtevnost) }}>
          {trail.Zahtevnost || 'Ni podatka'}
        </div>
      </div>

      <div className="trail-card-content">
        <h3 className="trail-card-title">
          {trail.izhod_info || `Pot ${trail.id}`}
        </h3>

        {trail.cilj_info && (
          <p className="trail-card-destination">
            <MapPin size={16} />
            <span>Do: {trail.cilj_info}</span>
          </p>
        )}

        <div className="trail-card-stats">
          <div className="trail-stat">
            <TrendingUp size={18} />
            <span>{trail.Razdalja || '-'}</span>
          </div>
          <div className="trail-stat">
            <Clock size={18} />
            <span>{trail['Čas hoje'] || '-'}</span>
          </div>
          <div className="trail-stat">
            <MapPin size={18} />
            <span>{trail.Vzpon || '-'}</span>
          </div>
        </div>

        {weather && (
          <div className="trail-card-weather">
            <Thermometer size={18} />
            <span>{Math.round(weather.temp)}°C</span>
            <span className="weather-desc">{weather.description}</span>
          </div>
        )}

        <div className="trail-card-footer">
          <span className="trail-card-region">{trail.Teritorij || 'Slovenija'}</span>
          <a 
            href={trail.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="trail-card-link"
          >
            Več info →
          </a>
        </div>
      </div>
    </div>
  );
};

export default TrailCard;