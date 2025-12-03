import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Mountain, 
  TrendingUp, 
  Clock, 
  Calendar,
  Award,
  Target,
  Trash2,
  Plus,
  Star,
  Trophy,
  Zap,
  Heart
} from 'lucide-react';
import { authAPI, trailsAPI } from '../../api/api';
import AddHikeModal from '../../components/AddHikeModal/AddHikeModal';
import './Profile.css';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalHikes: 0,
    totalDuration: 0,
    avgRating: 0,
    lastHikeDate: null
  });
  const [completedHikes, setCompletedHikes] = useState([]);
  const [trails, setTrails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    loadProfileData();
  }, [isAuthenticated, navigate]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const [statsRes, hikesRes, trailsRes] = await Promise.all([
        authAPI.getStats(user.id),
        authAPI.getHikes(user.id),
        trailsAPI.getAll()
      ]);

      setStats(statsRes.data);
      setCompletedHikes(hikesRes.data);
      setTrails(trailsRes.data);
      calculateBadges(hikesRes.data, trailsRes.data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBadges = (hikes, allTrails) => {
    const earnedBadges = [];
    const hikeCount = hikes.length;

    // Badge za število pohodov
    if (hikeCount >= 1) earnedBadges.push({ 
      id: 'first', 
      name: 'Prvi Korak', 
      icon: '🥾', 
      color: '#27ae60',
      description: 'Opravil si svoj prvi pohod!'
    });
    if (hikeCount >= 5) earnedBadges.push({ 
      id: 'explorer', 
      name: 'Raziskovalec', 
      icon: '🗺️', 
      color: '#3498db',
      description: '5 opravljenih pohodov'
    });
    if (hikeCount >= 10) earnedBadges.push({ 
      id: 'adventurer', 
      name: 'Pustolov', 
      icon: '⛰️', 
      color: '#9b59b6',
      description: '10 opravljenih pohodov'
    });
    if (hikeCount >= 25) earnedBadges.push({ 
      id: 'mountaineer', 
      name: 'Alpinist', 
      icon: '🏔️', 
      color: '#e67e22',
      description: '25 opravljenih pohodov'
    });
    if (hikeCount >= 50) earnedBadges.push({ 
      id: 'legend', 
      name: 'Legenda', 
      icon: '👑', 
      color: '#f39c12',
      description: '50 opravljenih pohodov!'
    });

    // Badge za zahtevnost
    const completedTrailIds = hikes.map(h => h.trailId);
    const completedTrailsData = allTrails.filter(t => completedTrailIds.includes(t.id));
    
    const hasHard = completedTrailsData.some(t => 
      t.Zahtevnost?.toLowerCase().includes('zahtevna')
    );
    const hasVeryHard = completedTrailsData.some(t => 
      t.Zahtevnost?.toLowerCase().includes('zelo zahtevna')
    );

    if (hasHard) earnedBadges.push({ 
      id: 'challenger', 
      name: 'Izzivalec', 
      icon: '💪', 
      color: '#e74c3c',
      description: 'Opravil si zahtevno pot'
    });
    if (hasVeryHard) earnedBadges.push({ 
      id: 'extreme', 
      name: 'Ekstremist', 
      icon: '🔥', 
      color: '#c0392b',
      description: 'Opravil si zelo zahtevno pot!'
    });

    const totalMinutes = hikes.reduce((sum, h) => sum + (h.duration || 0), 0);
    const totalHours = Math.floor(totalMinutes / 60);

    if (totalHours >= 10) earnedBadges.push({ 
      id: 'endurance', 
      name: 'Vzdržljivec', 
      icon: '⏱️', 
      color: '#16a085',
      description: '10+ ur hoje'
    });
    if (totalHours >= 50) earnedBadges.push({ 
      id: 'marathon', 
      name: 'Maratonec', 
      icon: '🏃', 
      color: '#1abc9c',
      description: '50+ ur hoje'
    });

    // Badge za ocene
    const avgRating = hikes.reduce((sum, h) => sum + (h.rating || 0), 0) / hikes.length;
    if (avgRating >= 4.5 && hikeCount >= 5) {
      earnedBadges.push({ 
        id: 'perfectionist', 
        name: 'Perfekcionist', 
        icon: '⭐', 
        color: '#f1c40f',
        description: 'Povprečna ocena 4.5+'
      });
    }

    setBadges(earnedBadges);
  };

  const handleDeleteHike = async (hikeId) => {
    if (!window.confirm('Ali res želite izbrisati ta pohod?')) return;

    try {
      await authAPI.deleteHike(hikeId, user.id);
      loadProfileData();
    } catch (error) {
      console.error('Failed to delete hike:', error);
      alert('Napaka pri brisanju pohoda');
    }
  };

  const handleAddHike = async (hikeData) => {
  try {
    await authAPI.addHike({
      userId: user.id,
      trailId: hikeData.trailId,
      date: hikeData.date,
      duration: hikeData.duration,
      notes: hikeData.notes,
      rating: hikeData.rating
    });
    
    setShowAddModal(false);
    loadProfileData();
    alert('Pohod uspešno dodan!');
  } catch (error) {
    console.error('Failed to add hike:', error);
    alert('Napaka pri dodajanju pohoda: ' + (error.response?.data?.error || error.message));
  }
};

  const getTrailInfo = (trailId) => {
    return trails.find(t => t.id === trailId);
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

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getLevel = () => {
    const hikeCount = completedHikes.length;
    if (hikeCount < 5) return { level: 1, name: 'Začetnik', color: '#95a5a6' };
    if (hikeCount < 10) return { level: 2, name: 'Pohodnik', color: '#27ae60' };
    if (hikeCount < 25) return { level: 3, name: 'Raziskovalec', color: '#3498db' };
    if (hikeCount < 50) return { level: 4, name: 'Alpinist', color: '#9b59b6' };
    return { level: 5, name: 'Legenda', color: '#f39c12' };
  };

  const getNextLevelProgress = () => {
    const hikeCount = completedHikes.length;
    if (hikeCount < 5) return { current: hikeCount, next: 5, percentage: (hikeCount / 5) * 100 };
    if (hikeCount < 10) return { current: hikeCount, next: 10, percentage: ((hikeCount - 5) / 5) * 100 };
    if (hikeCount < 25) return { current: hikeCount, next: 25, percentage: ((hikeCount - 10) / 15) * 100 };
    if (hikeCount < 50) return { current: hikeCount, next: 50, percentage: ((hikeCount - 25) / 25) * 100 };
    return { current: hikeCount, next: hikeCount, percentage: 100 };
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="profile-loading">
            <Mountain size={48} />
            <p>Nalagam profil...</p>
          </div>
        </div>
      </div>
    );
  }

  const level = getLevel();
  const progress = getNextLevelProgress();

  return (
    <div className="profile-page">
      <div className="container">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-circle" style={{ background: level.color }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="profile-level-badge" style={{ background: level.color }}>
              <Trophy size={16} />
              <span>Level {level.level}</span>
            </div>
          </div>
          <div className="profile-info">
            <h1>{user.name}</h1>
            <p className="profile-email">{user.email}</p>
            <div className="profile-level">
              <span className="level-name" style={{ color: level.color }}>
                {level.name}
              </span>
              {progress.percentage < 100 && (
                <span className="level-progress-text">
                  {progress.current}/{progress.next} pohodov do naslednjega levela
                </span>
              )}
            </div>
            <div className="level-progress-bar">
              <div 
                className="level-progress-fill" 
                style={{ 
                  width: `${progress.percentage}%`,
                  background: level.color
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="profile-stats-grid">
          <div className="profile-stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <Mountain size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalHikes}</div>
              <div className="stat-label">Opravljenih pohodov</div>
            </div>
          </div>

          <div className="profile-stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{formatDuration(stats.totalDuration)}</div>
              <div className="stat-label">Skupni čas hoje</div>
            </div>
          </div>

          <div className="profile-stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <Star size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.avgRating || '0'}/5</div>
              <div className="stat-label">Povprečna ocena</div>
            </div>
          </div>

          <div className="profile-stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
              <Award size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{badges.length}</div>
              <div className="stat-label">Žetonov</div>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <div className="profile-section">
          <div className="section-header">
            <h2>
              <Award size={28} />
              Moji Žetoni
            </h2>
            <p>Zberi vse žetone in postani legenda!</p>
          </div>
          <div className="badges-grid">
            {badges.map(badge => (
              <div key={badge.id} className="badge-card" style={{ borderColor: badge.color }}>
                <div className="badge-icon" style={{ background: badge.color }}>
                  {badge.icon}
                </div>
                <h3>{badge.name}</h3>
                <p>{badge.description}</p>
              </div>
            ))}
            {badges.length === 0 && (
              <div className="no-badges">
                <Target size={48} />
                <p>Še nimaš nobenih žetonov.</p>
                <p>Začni s pohodništvom in jih zberi!</p>
              </div>
            )}
          </div>
        </div>

        {/* Completed Hikes */}
        <div className="profile-section">
          <div className="section-header">
            <h2>
              <TrendingUp size={28} />
              Moji Pohodi
            </h2>
            <button className="add-hike-btn" onClick={() => setShowAddModal(true)}>
              <Plus size={20} />
              Dodaj pohod
            </button>
          </div>

          {completedHikes.length > 0 ? (
            <div className="hikes-list">
              {completedHikes
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map(hike => {
                  const trail = getTrailInfo(hike.trailId);
                  return (
                    <div key={hike.id} className="hike-card">
                      <div className="hike-card-header">
                        <div className="hike-trail-info">
                          <h3>{trail?.izhod_info || `Pot ${hike.trailId}`}</h3>
                          {trail?.cilj_info && (
                            <p className="hike-destination">→ {trail.cilj_info}</p>
                          )}
                        </div>
                        <button 
                          className="delete-hike-btn"
                          onClick={() => handleDeleteHike(hike.id)}
                          title="Izbriši pohod"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="hike-card-details">
                        <div className="hike-detail">
                          <Calendar size={16} />
                          <span>{new Date(hike.date).toLocaleDateString('sl-SI')}</span>
                        </div>
                        <div className="hike-detail">
                          <Clock size={16} />
                          <span>{formatDuration(hike.duration)}</span>
                        </div>
                        {trail?.Zahtevnost && (
                          <div className="hike-detail">
                            <Mountain size={16} />
                            <span 
                              className="difficulty-badge"
                              style={{ 
                                background: getDifficultyColor(trail.Zahtevnost),
                                color: 'white'
                              }}
                            >
                              {trail.Zahtevnost}
                            </span>
                          </div>
                        )}
                        {hike.rating && (
                          <div className="hike-detail">
                            <Star size={16} fill="#f39c12" color="#f39c12" />
                            <span>{hike.rating}/5</span>
                          </div>
                        )}
                      </div>

                      {hike.notes && (
                        <div className="hike-notes">
                          <p>{hike.notes}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="no-hikes">
              <Mountain size={64} />
              <h3>Še nimaš zabeleženih pohodov</h3>
              <p>Dodaj svoj prvi pohod in začni zbirati žetone!</p>
              <button className="add-first-hike-btn" onClick={() => setShowAddModal(true)}>
                <Plus size={20} />
                Dodaj prvi pohod
              </button>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddHikeModal 
          trails={trails}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddHike}
        />
      )}
    </div>
  );
};

export default Profile;