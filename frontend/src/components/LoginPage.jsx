import React, { useState } from 'react';
import axios from 'axios';
import { Truck, Shield, Mail, Lock, Eye, EyeOff, ChevronRight, User, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';

const LoginPage = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [driverName, setDriverName] = useState('');
  const [truckId, setTruckId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isSignup) {
        // --- SIGNUP LOGIC ---
        if (!driverName || !truckId || !email || !password) {
            setError('Please fill all fields.');
            setLoading(false);
            return;
        }
        const truckRegex = /^LPK-\d{4}$/;
        if (!truckRegex.test(truckId)) {
            setError('Truck ID must start with "LPK-" followed by 4 digits.');
            setLoading(false);
            return;
        }

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            await axios.post(`${apiUrl}/api/register/`, {
                email,
                password,
                driver_name: driverName,
                truck_id: truckId
            });
            alert('Account created successfully! You can now login.');
            setIsSignup(false);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Try again.');
        } finally {
            setLoading(false);
        }
    } else {
        // --- LOGIN LOGIC ---
        if (!email || !password) {
            setError('Please enter your credentials.');
            setLoading(false);
            return;
        }

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const resp = await axios.post(`${apiUrl}/api/login/`, {
                email,
                password
            });
            onLogin(resp.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid email or password.');
        } finally {
            setLoading(false);
        }
    }
  };

  return (
    <div className="login-container">
      {/* Real Map Background */}
      <div className="login-map-bg">
        <MapContainer 
            center={[20, 0]} 
            zoom={2} 
            style={{ height: '100%', width: '100%' }} 
            zoomControl={false} 
            attributionControl={false}
            dragging={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            touchZoom={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
        </MapContainer>
        <div className="map-overlay-light"></div>
      </div>

      {/* Left Hero Section */}
      <div className="login-hero">
        <div className="hero-content">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="hero-logo-box"
          >
            <Truck size={42} color="white" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hero-title"
          >
            Drive<span>Ledger</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="hero-subtitle"
          >
            Smart ELD & Fleet Intelligence Simulator.
          </motion.p>
          <div className="hero-line"></div>
        </div>
        <div className="hero-gradient-overlay"></div>
      </div>

      {/* Right Form Section */}
      <div className="login-form-side" style={{ paddingTop: isSignup ? '100px' : '140px' }}>
        <div className="login-header-nav">
            <span className="nav-link" onClick={() => { setIsSignup(false); setError(''); }}>Login</span>
            <button className="get-started-btn" onClick={() => { setIsSignup(true); setError(''); }}>Get Started</button>
        </div>

        <motion.div 
          key={isSignup ? 'signup' : 'login'}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="login-card"
        >
          <h2>{isSignup ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="secure-access">{isSignup ? 'DRIVER REGISTRATION' : 'SECURE ACCESS'}</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '10px 15px', borderRadius: 10, fontSize: 11, fontWeight: 700, marginBottom: 20, border: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'center' }}
                >
                    <AlertCircle size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    {error}
                </motion.div>
            )}

            {isSignup && (
              <>
                <div className="auth-group">
                  <label>DRIVER NAME</label>
                  <div className="auth-input-wrapper">
                    <User size={18} className="input-icon" />
                    <input 
                      type="text" 
                      placeholder="Enter your name" 
                      value={driverName}
                      onChange={(e) => { setDriverName(e.target.value); setError(''); }}
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div className="auth-group">
                  <label>TRUCK ID (LPK-XXXX)</label>
                  <div className="auth-input-wrapper">
                    <Truck size={18} className="input-icon" />
                    <input 
                      type="text" 
                      placeholder="LPK-2921" 
                      value={truckId}
                      onChange={(e) => { setTruckId(e.target.value); setError(''); }}
                      autoComplete="off"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="auth-group">
              <label>EMAIL</label>
              <div className="auth-input-wrapper">
                <Mail size={18} className="input-icon" />
                <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="Enter your email" 
                    autoComplete="off"
                />
              </div>
            </div>

            <div className="auth-group">
              <label>SECURE KEY</label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="input-icon" />
                <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="Enter your password" 
                    autoComplete="new-password"
                />
                <div className="eye-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
            </div>

            <button className="login-submit-btn" type="submit">
                {isSignup ? 'REGISTER' : 'LOGIN'}
            </button>

            <p className="auth-footer">
                {isSignup ? 'Already have an account?' : 'New to DriveLedger?'} 
                <span onClick={() => { setIsSignup(!isSignup); setError(''); }}>
                    {isSignup ? ' LOGIN' : ' SIGN UP'}
                </span>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
