import React from 'react';
import './loading.css';

const Load = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="mountain-loader">
          <div className="peak"></div>
          <div className="peak"></div>
          <div className="peak"></div>
        </div>
        <p>Nalagam podatke...</p>
      </div>
    </div>
  );
};

export default Load;