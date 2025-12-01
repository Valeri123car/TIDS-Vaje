import React from 'react';
import { Mountain, TrendingUp, MapPin } from 'lucide-react';
import './hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-overlay"></div>
      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">
            Raziskuj Planinske Poti Slovenije
          </h1>
          <p className="hero-subtitle">
            Odkrijte več kot 30.000 planinskih poti, spremljajte svoj napredek in načrtujte naslednji pohod
          </p>
          <div className="hero-features">
            <div className="hero-feature">
              <MapPin size={24} />
              <span>Interaktivni zemljevid</span>
            </div>
            <div className="hero-feature">
              <Mountain size={24} />
              <span>Podrobni opisi poti</span>
            </div>
            <div className="hero-feature">
              <TrendingUp size={24} />
              <span>Sledenje napredku</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;