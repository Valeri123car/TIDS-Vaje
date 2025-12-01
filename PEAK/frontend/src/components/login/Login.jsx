import React, { useState } from 'react';
import { X, Mail, Lock, User, Mountain } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './login.css';

const Login = ({ isOpen, onClose }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLoginMode) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData.name, formData.email, formData.password);
      }

      if (result.success) {
        onClose();
        setFormData({ name: '', email: '', password: '' });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Nekaj je šlo narobe. Poskusite znova.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setFormData({ name: '', email: '', password: '' });
  };

  return (
    <div className="login-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="login-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="login-header">
          <Mountain size={40} className="login-logo" />
          <h2>{isLoginMode ? 'Dobrodošli nazaj' : 'Registracija'}</h2>
          <p>{isLoginMode ? 'Prijavite se v svoj račun' : 'Ustvarite nov račun'}</p>
        </div>

        {error && (
          <div className="login-error">
            <span>{error}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          {!isLoginMode && (
            <div className="form-group">
              <label htmlFor="name">
                <User size={20} />
                <span>Ime</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Janez Novak"
                value={formData.name}
                onChange={handleChange}
                required={!isLoginMode}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">
              <Mail size={20} />
              <span>Email</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="janez@primer.si"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <Lock size={20} />
              <span>Geslo</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="login-submit"
            disabled={loading}
          >
            {loading ? 'Nalagam...' : (isLoginMode ? 'Prijava' : 'Registracija')}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isLoginMode ? 'Nimate računa?' : 'Že imate račun?'}
            <button onClick={toggleMode}>
              {isLoginMode ? 'Registrirajte se' : 'Prijavite se'}
            </button>
          </p>
        </div>

        {isLoginMode && (
          <div className="demo-credentials">
            <p><strong>Demo račun:</strong></p>
            <p>Email: test@peak.si</p>
            <p>Geslo: test123</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;