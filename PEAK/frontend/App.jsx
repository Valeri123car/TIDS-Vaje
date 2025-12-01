import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../frontend/src/context/AuthContext';  // 👈 IMPORT AuthProvider
import Navbar from '../frontend/src/components/navbar/Navbar';
import Home from '../frontend/src/pages/home/Home';
import '../frontend/src/app.css';

function App() {
  return (
    <AuthProvider>  {/* 👈 NE Context, ampak AuthProvider! */}
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/map" element={<div className="container" style={{padding: '4rem 2rem', textAlign: 'center'}}><h2>Zemljevid - kmalu na voljo</h2></div>} />
              <Route path="/profile" element={<div className="container" style={{padding: '4rem 2rem', textAlign: 'center'}}><h2>Profil - kmalu na voljo</h2></div>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;