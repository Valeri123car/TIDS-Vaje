import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mountain, Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Login from '../Login/Login';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="container">
          <div className="navbar-content">
            <Link to="/" className="navbar-logo">
              <Mountain size={32} />
              <span>PEAK</span>
            </Link>

            <button className="navbar-toggle" onClick={toggleMenu}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <ul className={`navbar-menu ${isOpen ? 'active' : ''}`}>
              <li>
                <Link to="/" onClick={() => setIsOpen(false)}>
                  Domov
                </Link>
              </li>
              <li>
                <Link to="/map" onClick={() => setIsOpen(false)}>
                  Zemljevid
                </Link>
              </li>
              <li>
                <Link to="/tourism" onClick={() => setIsOpen(false)}>
                  Turizem
                </Link>
              </li>
              
              {isAuthenticated ? (
                <>
                  <li>
                    <Link to="/profile" onClick={() => setIsOpen(false)}>
                      Profil
                    </Link>
                  </li>
                  <li className="navbar-user">
                    <span className="user-name">
                      <User size={18} />
                      {user?.name}
                    </span>
                    <button onClick={handleLogout} className="logout-btn">
                      <LogOut size={18} />
                      Odjava
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <button 
                    onClick={() => {
                      setShowLogin(true);
                      setIsOpen(false);
                    }} 
                    className="login-btn"
                  >
                    Prijava
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <Login isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
};

export default Navbar;
