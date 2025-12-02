import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, MapPin, Home } from 'lucide-react';
import { sursAPI } from '../../api/api';
import Loading from '../../components/Loading/Load';
import './tourism.css';

const Tourism = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTourismData();
  }, []);

  const loadTourismData = async () => {
    try {
      setLoading(true);
      const response = await sursAPI.getTourism();
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to load tourism data:', err);
      setError('Napaka pri nalaganju podatkov');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="tourism-page">
        <div className="container">
          <div className="error-message">
            <h2>⚠️ {error}</h2>
            <button onClick={loadTourismData} className="retry-btn">
              Poskusi znova
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Determine data keys dynamically
  const kocaKey = data.data.vrednosti['Planinska koča'] ? 'Planinska koča' : 
                   data.data.vrednosti['Planinski dom'] ? 'Planinski dom' :
                   data.data.vrednosti['Regija'] ? 'Regija' : 
                   Object.keys(data.data.vrednosti).find(k => k.includes('dom') || k.includes('Dom') || k.includes('koča'));
  
  const prenocitvKey = data.data.vrednosti['Število prenočitev'] ? 'Število prenočitev' : 
                       data.data.vrednosti['Število nočitev'] ? 'Število nočitev' : 
                       Object.keys(data.data.vrednosti).find(k => k.includes('prenočit') || k.includes('nočit'));

  const koce = data.data.vrednosti[kocaKey] || [];
  const prenocitveSample = data.data.vrednosti[prenocitvKey] || [];
  const leta = data.data.vrednosti['Leto'] || data.data.vrednosti['LETO'] || [];
  const regije = data.data.vrednosti['Planinska regija'] || data.data.vrednosti['Regija'] || [];
  const vrsteTurizma = data.data.vrednosti['Vrsta turizma'] || 
                       data.data.vrednosti['Vrsta obiska'] || 
                       data.data.vrednosti['Vrsta podatka'] || [];

  return (
    <div className="tourism-page">
      <div className="container">
        {/* Header */}
        <div className="tourism-header">
          <BarChart3 size={48} />
          <h1>Planinski Turizem v Sloveniji</h1>
          <p className="tourism-subtitle">
            {data.source || 'PZS - Planinska zveza Slovenije'}
          </p>
          <p className="tourism-note">
            {data.note || '📊 Podatki pridobljeni iz PX formata in parseani'}
          </p>
        </div>

        {/* Summary Cards */}
        {data.data.povzetek && (
          <div className="tourism-summary">
            <div className="summary-card">
              <div className="summary-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <Users size={28} />
              </div>
              <div className="summary-content">
                <div className="summary-value">
                  {(data.data.povzetek.skupno_prenočitev || 
                    data.data.povzetek.skupno_nočitev_2023 || 0).toLocaleString()}
                </div>
                <div className="summary-label">Prenočitve skupaj</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <TrendingUp size={28} />
              </div>
              <div className="summary-content">
                <div className="summary-value">
                  {(data.data.povzetek.povprečje_na_kočo || 
                    data.data.povzetek.povprečje_na_dom || 
                    data.data.povzetek.rast_2022_2023 || 'N/A').toLocaleString()}
                </div>
                <div className="summary-label">
                  {data.data.povzetek.povprečje_na_kočo || data.data.povzetek.povprečje_na_dom 
                    ? 'Povprečje na kočo' 
                    : 'Rast'}
                </div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                <MapPin size={28} />
              </div>
              <div className="summary-content">
                <div className="summary-value">
                  {data.data.povzetek.top_koča ||
                   data.data.povzetek.top_regija || 
                   data.data.povzetek.najpopularnejša_regija || 'N/A'}
                </div>
                <div className="summary-label">Top Koča</div>
              </div>
            </div>

            {(data.data.povzetek.število_koč || data.data.povzetek.število_domov) && (
              <div className="summary-card">
                <div className="summary-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                  <Home size={28} />
                </div>
                <div className="summary-content">
                  <div className="summary-value">
                    {data.data.povzetek.število_koč || data.data.povzetek.število_domov}
                  </div>
                  <div className="summary-label">Planinskih koč</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Data Sections */}
        <div className="tourism-sections">
          {/* Planinske Koče */}
          {koce.length > 0 && (
            <div className="tourism-section">
              <h2>
                <Home size={24} />
                Planinske Koče
              </h2>
              <div className="data-grid">
                {koce.slice(0, 10).map((koca, index) => (
                  <div key={index} className="data-item">
                    <div className="data-icon">🏔️</div>
                    <div className="data-name">{koca}</div>
                  </div>
                ))}
                {koce.length > 10 && (
                  <div className="data-item" style={{ opacity: 0.6 }}>
                    <div className="data-icon">...</div>
                    <div className="data-name">+{koce.length - 10} več</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Planinske Regije */}
          {regije.length > 0 && (
            <div className="tourism-section">
              <h2>
                <MapPin size={24} />
                Planinske Regije
              </h2>
              <div className="data-grid">
                {regije.slice(0, 10).map((regija, index) => (
                  <div key={index} className="data-item">
                    <div className="data-icon">⛰️</div>
                    <div className="data-name">{regija}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leta */}
          {leta.length > 0 && (
            <div className="tourism-section">
              <h2>
                <BarChart3 size={24} />
                Obdobje Podatkov
              </h2>
              <div className="years-timeline">
                {leta.slice(0, 6).map((leto, index) => (
                  <div key={index} className="year-item">
                    <div className="year-badge">{leto}</div>
                  </div>
                ))}
                {leta.length > 6 && (
                  <div className="year-item">
                    <div className="year-badge" style={{ opacity: 0.6 }}>
                      +{leta.length - 6}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Vrste Podatkov */}
          {vrsteTurizma.length > 0 && (
            <div className="tourism-section">
              <h2>
                <Users size={24} />
                Vrste Podatkov
              </h2>
              <div className="tourism-types">
                {vrsteTurizma.slice(0, 4).map((vrsta, index) => (
                  <div key={index} className="tourism-type-card">
                    <div className="type-icon">
                      {vrsta.toLowerCase().includes('planin') ? '⛰️' : 
                       vrsta.toLowerCase().includes('prenočit') ? '🛏️' : 
                       vrsta.toLowerCase().includes('obisk') ? '👥' : '📊'}
                    </div>
                    <div className="type-name">{vrsta}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Število Prenočitev */}
          {prenocitveSample.length > 0 && koce.length > 0 && (
            <div className="tourism-section full-width">
              <h2>
                <TrendingUp size={24} />
                Število Prenočitev po Kočah
              </h2>
              <div className="nocitve-bars">
                {prenocitveSample.slice(0, 15).map((nocitve, index) => {
                  const maxNocitve = Math.max(...prenocitveSample);
                  const percentage = (nocitve / maxNocitve) * 100;
                  return (
                    <div key={index} className="nocitve-bar-item">
                      <div className="nocitve-label">
                        {koce[index] || `Koča ${index + 1}`}
                      </div>
                      <div className="nocitve-bar-container">
                        <div 
                          className="nocitve-bar-fill" 
                          style={{ width: `${percentage}%` }}
                        >
                          <span className="nocitve-value">{nocitve.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {prenocitveSample.length > 15 && (
                  <div className="nocitve-bar-item" style={{ opacity: 0.6 }}>
                    <div className="nocitve-label">
                      ... in še {prenocitveSample.length - 15} koč
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tourism;