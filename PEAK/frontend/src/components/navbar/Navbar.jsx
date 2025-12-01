import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mountain, Menu, X } from 'lucide-react';
import './navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
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
              <Link to="/profile" onClick={() => setIsOpen(false)}>
                Profil
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;