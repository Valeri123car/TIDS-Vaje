import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../frontend/src/context/AuthContext';  
import Navbar from '../frontend/src/components/navbar/Navbar';
import Home from '../frontend/src/pages/home/Home';
import '../frontend/src/app.css';
import Map from '../frontend/src/pages/map/Map';
import Profile from './src/pages/profile/profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/map" element={<Map />} /> 
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;