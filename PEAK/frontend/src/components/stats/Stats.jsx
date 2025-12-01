import React from 'react';
import { MapPin, TrendingUp, Clock, Mountain } from 'lucide-react';
import './tats.css';

const Stats = ({ stats, loading }) => {
  if (loading) {
    return (
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="stat-card skeleton">
                <div className="stat-icon skeleton-icon"></div>
                <div className="stat-value skeleton-text"></div>
                <div className="stat-label skeleton-text"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="stats-section">
      <div className="container">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <MapPin size={28} />
            </div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Skupno poti</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <TrendingUp size={28} />
            </div>
            <div className="stat-value">{stats.avgDistance} km</div>
            <div className="stat-label">Povprečna razdalja</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <Mountain size={28} />
            </div>
            <div className="stat-value">{stats.avgAscent} m</div>
            <div className="stat-label">Povprečni vzpon</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
              <Clock size={28} />
            </div>
            <div className="stat-value">{Math.floor(stats.avgDuration / 60)}h {stats.avgDuration % 60}m</div>
            <div className="stat-label">Povprečen čas</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;