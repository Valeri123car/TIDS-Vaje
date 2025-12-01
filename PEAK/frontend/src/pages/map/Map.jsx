import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { CheckCircle, Heart, MapPin, Mountain, TrendingUp, Clock, Thermometer } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { trailsAPI, authAPI, weatherAPI } from '../../api/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './map.css';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color, isCompleted = false, isFavorite = false) => {
  let icon = '📍';
  if (isCompleted) icon = '✅';
  else if (isFavorite) icon = '❤️';
  
  return L.divIcon({
    html: `<div style="font-size: 28px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">${icon}</div>`,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

const Map = () => {
  const { user, isAuthenticated } = useAuth();
  const [trails, setTrails] = useState([]);
  const [completedTrails, setCompletedTrails] = useState([]);
  const [favoriteTrails, setFavoriteTrails] = useState([]);
  const [filteredTrails, setFilteredTrails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrail, setSelectedTrail] = useState(null);
  const [weather, setWeather] = useState(null);
  
  const [filters, setFilters] = useState({
    showAll: true,
    showCompleted: true,
    showFavorites: true,
    difficulty: ''
  });

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [trails, completedTrails, favoriteTrails, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const trailsRes = await trailsAPI.getAll();
      setTrails(trailsRes.data);

      if (isAuthenticated && user) {
        const [hikesRes, favoritesRes] = await Promise.all([
          authAPI.getHikes(user.id),
          authAPI.getFavorites(user.id)
        ]);
        
        const completedTrailIds = hikesRes.data.map(h => h.trailId);
        setCompletedTrails(completedTrailIds);
        setFavoriteTrails(favoritesRes.data);
      }
    } catch (error) {
      console.error('Failed to load map data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = trails.filter(trail => {
      if (!trail.izhod_koordinate) return false;
      
      const coords = trail.izhod_koordinate.split(',').map(c => parseFloat(c.trim()));
      if (coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) return false;

      const isCompleted = completedTrails.includes(trail.id);
      const isFavorite = favoriteTrails.includes(trail.id);

      // Filter by completion/favorite status
      if (!filters.showAll && !filters.showCompleted && !filters.showFavorites) {
        return filters.showAll;
      }
      
      if (!filters.showAll && filters.showCompleted && !isCompleted) return false;
      if (!filters.showAll && filters.showFavorites && !isFavorite) return false;

      // Filter by difficulty
      if (filters.difficulty) {
        const difficulty = trail.Zahtevnost?.toLowerCase() || '';
        if (!difficulty.includes(filters.difficulty.toLowerCase())) return false;
      }

      return true;
    });

    setFilteredTrails(filtered);
  };

  const handleMarkerClick = async (trail) => {
    setSelectedTrail(trail);
    
    // Load weather
    const coords = trail.izhod_koordinate.split(',').map(c => parseFloat(c.trim()));
    try {
      const weatherRes = await weatherAPI.getCurrent(coords[0], coords[1]);
      setWeather({
        temp: weatherRes.data.main.temp,
        description: weatherRes.data.weather[0].description,
        icon: weatherRes.data.weather[0].icon
      });
    } catch (error) {
      console.error('Failed to load weather:', error);
      setWeather(null);
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

  if (loading) {
    return (
      <div className="map-page">
        <div className="map-loading">
          <Mountain size={48} />
          <p>Nalagam zemljevid...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-page">
      <div className="map-container">
        {/* Sidebar */}
        <div className="map-sidebar">
          <h3>
            <MapPin size={24} />
            Filtriranje
          </h3>

          <div className="filter-section">
            <h4>Prikaz poti</h4>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.showAll}
                onChange={(e) => setFilters({ ...filters, showAll: e.target.checked })}
              />
              <span>📍 Vse poti ({trails.length})</span>
            </label>
            
            {isAuthenticated && (
              <>
                <label className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.showCompleted}
                    onChange={(e) => setFilters({ ...filters, showCompleted: e.target.checked })}
                  />
                  <span>✅ Opravljene ({completedTrails.length})</span>
                </label>
                
                <label className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.showFavorites}
                    onChange={(e) => setFilters({ ...filters, showFavorites: e.target.checked })}
                  />
                  <span>❤️ Priljubljene ({favoriteTrails.length})</span>
                </label>
              </>
            )}
          </div>

          <div className="filter-section">
            <h4>Zahtevnost</h4>
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              className="difficulty-filter"
            >
              <option value="">Vse zahtevnosti</option>
              <option value="lahka">Lahka</option>
              <option value="srednja">Srednja</option>
              <option value="zahtevna">Zahtevna</option>
              <option value="zelo zahtevna">Zelo zahtevna</option>
            </select>
          </div>

          {selectedTrail && (
            <div className="trail-info-panel">
              <h4>Izbrana pot</h4>
              <div className="trail-info-content">
                <h3>{selectedTrail.izhod_info || `Pot ${selectedTrail.id}`}</h3>
                
                {selectedTrail.cilj_info && (
                  <p className="trail-destination">
                    <MapPin size={16} />
                    Do: {selectedTrail.cilj_info}
                  </p>
                )}

                <div className="trail-info-stats">
                  <div className="trail-info-stat">
                    <TrendingUp size={16} />
                    <span>{selectedTrail.Razdalja || '-'}</span>
                  </div>
                  <div className="trail-info-stat">
                    <Mountain size={16} />
                    <span>{selectedTrail.Vzpon || '-'}</span>
                  </div>
                  <div className="trail-info-stat">
                    <Clock size={16} />
                    <span>{selectedTrail['Čas hoje'] || '-'}</span>
                  </div>
                </div>

                {selectedTrail.Zahtevnost && (
                  <div 
                    className="trail-difficulty-badge"
                    style={{ background: getDifficultyColor(selectedTrail.Zahtevnost) }}
                  >
                    {selectedTrail.Zahtevnost}
                  </div>
                )}

                {weather && (
                  <div className="trail-weather-info">
                    <Thermometer size={18} />
                    <span>{Math.round(weather.temp)}°C</span>
                    <span className="weather-desc">{weather.description}</span>
                  </div>
                )}

                {isAuthenticated && (
                  <div className="trail-status-badges">
                    {completedTrails.includes(selectedTrail.id) && (
                      <div className="status-badge completed">
                        <CheckCircle size={16} />
                        <span>Opravljeno</span>
                      </div>
                    )}
                    {favoriteTrails.includes(selectedTrail.id) && (
                      <div className="status-badge favorite">
                        <Heart size={16} fill="currentColor" />
                        <span>Priljubljeno</span>
                      </div>
                    )}
                  </div>
                )}

                <a 
                  href={selectedTrail.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="trail-link-btn"
                >
                  Več informacij →
                </a>
              </div>
            </div>
          )}

          {!isAuthenticated && (
            <div className="login-prompt">
              <p>Prijavi se za sledenje opravljenim pohodom! 🏔️</p>
            </div>
          )}
        </div>

        {/* Map */}
        <div className="map-wrapper">
          <MapContainer
            center={[46.1512, 14.9955]}
            zoom={8}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredTrails.map(trail => {
              const coords = trail.izhod_koordinate.split(',').map(c => parseFloat(c.trim()));
              const isCompleted = completedTrails.includes(trail.id);
              const isFavorite = favoriteTrails.includes(trail.id);

              return (
                <Marker
                  key={trail.id}
                  position={[coords[0], coords[1]]}
                  icon={createCustomIcon(
                    getDifficultyColor(trail.Zahtevnost),
                    isCompleted,
                    isFavorite
                  )}
                  eventHandlers={{
                    click: () => handleMarkerClick(trail)
                  }}
                >
                  <Popup>
                    <div className="marker-popup">
                      <h4>{trail.izhod_info || `Pot ${trail.id}`}</h4>
                      {trail.cilj_info && <p>→ {trail.cilj_info}</p>}
                      <div className="popup-stats">
                        <span>{trail.Razdalja || '-'}</span>
                        <span>{trail.Vzpon || '-'}</span>
                      </div>
                      {isCompleted && <div className="popup-badge completed">✅ Opravljeno</div>}
                      {isFavorite && <div className="popup-badge favorite">❤️ Priljubljeno</div>}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default Map;