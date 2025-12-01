import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import './App.css';

function App() {
  return (
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
  );
}

export default App;