import React, { useState, useEffect } from 'react';
import Hero from '../../components/hero/Hero';
import Stats from '../../../src/components/stats/Stats';
import TrailList from '../../../src/components/trailsList/TrailList';
import Loading from '../../../src/components/Loading/Load';
import { trailsAPI } from '../../api/api';
import './Home.css';

const Home = () => {
  const [trails, setTrails] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    avgDistance: 0,
    avgAscent: 0,
    avgDuration: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load trails and stats in parallel
      const [trailsResponse, statsResponse] = await Promise.all([
        trailsAPI.getAll(),
        trailsAPI.getStats()
      ]);

      setTrails(trailsResponse.data);
      setStats(statsResponse.data);
      setError(null);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Napaka pri nalaganju podatkov. Preveri ali backend teče.');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="home">
        <Hero />
        <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--danger)' }}>⚠️ {error}</h2>
          <button 
            onClick={loadData}
            style={{
              marginTop: '2rem',
              padding: '1rem 2rem',
              background: 'var(--primary)',
              color: 'white',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Poskusi znova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <Hero />
      <Stats stats={stats} loading={loading} />
      
      {loading ? (
        <Loading />
      ) : (
        <TrailList trails={trails} />
      )}
    </div>
  );
};

export default Home;