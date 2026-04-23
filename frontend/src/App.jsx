import React, { useState, useRef } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  LayoutDashboard, Truck, Map as MapIcon, 
  Settings, History, Bell, User, Clock,
  Navigation, CheckCircle, AlertCircle, Info, Calendar,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LogSheet from './components/LogSheet';
import L from 'leaflet';
import LoginPage from './components/LoginPage';

// Leaflet Icon Fix
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Time Marker Icon
const createTimeIcon = (label) => L.divIcon({
  html: `<div style="background: white; border: 2px solid #2563eb; color: #2563eb; font-weight: 800; font-size: 10px; padding: 2px 6px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); white-space: nowrap;">${label}</div>`,
  className: 'time-marker',
  iconSize: [0, 0],
  iconAnchor: [15, 10]
});

function RecenterMap({ position }) {
  const map = useMap();
  if (position) map.setView(position, 6);
  return null;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState({
    current_location: 'Lahore',
    pickup_location: 'Multan',
    dropoff_location: 'Karachi',
    cycle_used: '40',
    start_time: new Date().toISOString().slice(0, 16),
    driver_name: 'Danyal Nadeem',
    truck_number: 'LPK-2921',
    carrier_name: 'DriveLedger Logistics'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);

  const handleSimulate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${apiUrl}/api/simulate-trip/`, formData);
      setResult(response.data);
    } catch (err) {
      alert('Simulation failed. Check city names.');
    } finally {
      setLoading(false);
    }
  };

  const [editError, setEditError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [activeField, setActiveField] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef(null);

  const handleLocationChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (value.length > 0) {
        setIsSearching(true);
        setActiveField(field);
        
        searchTimeout.current = setTimeout(async () => {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&addressdetails=1&limit=5`);
                const data = await response.json();
                
                const globalCities = data.map(item => {
                    const addr = item.address;
                    const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || '';
                    const country = addr.country || '';
                    
                    if (city && country) return `${city}, ${country}`;
                    return item.display_name.split(',').slice(0, 2).join(', '); // Fallback
                });
                
                // Filter unique and non-empty
                const uniqueCities = [...new Set(globalCities)].filter(c => c.length > 2);
                setSuggestions(uniqueCities);
            } catch (error) {
                console.error("Error fetching locations:", error);
            } finally {
                setIsSearching(false);
            }
        }, 500); // 500ms debounce
    } else {
        setSuggestions([]);
        setActiveField(null);
    }
  };

  const selectSuggestion = (field, city) => {
    setFormData(prev => ({ ...prev, [field]: city }));
    setSuggestions([]);
    setActiveField(null);
  };

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogin = (userData) => {
    if (userData) {
      setFormData(prev => ({
        ...prev,
        driver_name: userData.driverName,
        truck_number: userData.truckId
      }));
    }
    setIsLoggedIn(true);
  };

  const handleSaveProfile = () => {
    const truckRegex = /^LPK-\d{4}$/;
    if (!truckRegex.test(formData.truck_number)) {
        setEditError('Truck ID must be LPK-XXXX (e.g., LPK-2921)');
        return;
    }
    setEditError('');
    setShowEditModal(false);
  };

  const confirmLogout = () => {
    setIsLoggedIn(false);
    setShowLogoutModal(false);
    setShowProfileMenu(false);
  };

  return (
    <AnimatePresence mode="wait">
      {!isLoggedIn ? (
        <LoginPage key="login" onLogin={handleLogin} />
      ) : (
        <motion.div 
            key="dashboard"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="app-layout"
        >
          {/* Sidebar */}
          <nav className="sidebar">
            <div className="nav-icon" style={{ background: '#161d2a', marginBottom: 30, borderRadius: 12 }}>
                <Truck size={22} color="white" />
            </div>
            <div className="nav-icon active"><LayoutDashboard size={22} /></div>
            <div className="nav-icon"><MapIcon size={22} /></div>
            <div className="nav-icon"><History size={22} /></div>
            <div style={{ marginTop: 'auto' }}>
                <div className="nav-icon"><Settings size={22} /></div>
            </div>
          </nav>

          <div className="main-wrapper">
            <header className="top-header">
              <div className="header-left">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.5px', color: 'white', margin: 0, lineHeight: 1 }}>
                        Drive<span style={{ color: '#3b82f6' }}>Ledger</span>
                    </h2>
                    <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, marginTop: 6, letterSpacing: '1px' }}>SMART FLEET INTELLIGENCE</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 8 }}>
                    <User size={16} /> <span>{formData.driver_name}</span>
                </div>
                <Bell size={20} />
                <button onClick={() => setIsLoggedIn(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <History size={20} />
                </button>
                
                {/* Profile Section */}
                <div style={{ position: 'relative' }}>
                    <div 
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        style={{ width: 32, height: 32, borderRadius: 16, background: '#475569', overflow: 'hidden', cursor: 'pointer', border: '2px solid rgba(255,255,255,0.1)' }}
                    >
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.driver_name}`} alt="avatar" />
                    </div>

                    <AnimatePresence>
                        {showProfileMenu && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="profile-dropdown"
                            >
                                <div className="dropdown-item" onClick={() => { setShowEditModal(true); setShowProfileMenu(false); }}>
                                    <User size={16} /> Edit Profile
                                </div>
                                <div className="dropdown-divider"></div>
                                <div className="dropdown-item logout-btn" onClick={() => setShowLogoutModal(true)}>
                                    <AlertCircle size={16} /> Sign Out
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
              </div>
            </header>

            {/* Map */}
            <div className="map-fullscreen">
              <MapContainer center={[30.3753, 69.3451]} zoom={5} style={{ height: '100%', width: '100%' }} zoomControl={false} attributionControl={false}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
                {result && (
                  <>
                    <RecenterMap position={[result.locations.pickup.lat, result.locations.pickup.lon]} />
                    
                    {/* Full Route Path */}
                    {result.route.to_pickup && (
                      <Polyline positions={result.route.to_pickup.coordinates.map(c => [c[1], c[0]])} color="#94a3b8" weight={4} dashArray="5, 10" />
                    )}
                    <Polyline positions={result.route.to_dropoff.coordinates.map(c => [c[1], c[0]])} color="#3b82f6" weight={5} opacity={0.8} />
                    
                     {/* Google Maps Style Time Markers */}
                    {result.time_markers.map((tm, idx) => (
                      <Marker key={`tm-${idx}`} position={[tm.lat, tm.lon]} icon={L.divIcon({
                        className: 'google-maps-marker',
                        html: `<div style="position: relative; display: flex; flex-direction: column; align-items: flex-start; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); transform: translate(30px, -10px);">
                                <div style="background: #161d2a; color: white; padding: 6px 12px; border-radius: 8px; font-weight: 700; font-size: 13px; white-space: nowrap; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
                                  ${tm.label}
                                </div>
                                <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #161d2a; margin-top: -1px; margin-left: -12px; transform: translateX(-15px);"></div>
                               </div>`,
                        iconSize: [120, 40],
                        iconAnchor: [5, 39]
                      })} />
                    ))}

                    {/* Stop & Fueling Markers */}
                    {result.stop_markers.map((stop, idx) => (
                      <Marker key={`stop-${idx}`} position={[stop.lat, stop.lon]} icon={L.divIcon({
                        className: 'stop-marker',
                        html: `<div style="background: ${stop.type === 'fuel' ? '#f59e0b' : '#ef4444'}; color: white; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 900; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 5px; white-space: nowrap;">
                                <span style="font-size: 14px;">${stop.type === 'fuel' ? '⛽' : '🛑'}</span>
                                ${stop.remark}
                              </div>`,
                        iconSize: [140, 30],
                        iconAnchor: [70, 15]
                      })} />
                    ))}

                    {/* Custom Start/Pickup/Dropoff Markers */}
                    <Marker position={[result.locations.current.lat, result.locations.current.lon]} icon={L.divIcon({
                      className: 'start-marker',
                      html: `<div style="background: #3b82f6; color: white; padding: 8px; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.4); border: 2px solid white; display: flex; align-items: center; justify-content: center;">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-5h-7v7h3Z"/><path d="M13 9h4"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
                             </div>`,
                      iconSize: [40, 40],
                      iconAnchor: [20, 20]
                    })} />

                    <Marker position={[result.locations.dropoff.lat, result.locations.dropoff.lon]} icon={L.divIcon({
                      className: 'end-marker',
                      html: `<div style="background: #ef4444; width: 24px; height: 36px; border-radius: 50% 50% 50% / 40% 40% 60% 60%; position: relative; box-shadow: 0 4px 12px rgba(0,0,0,0.4); border: 2px solid white; display: flex; align-items: center; justify-content: center;">
                              <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
                             </div>`,
                      iconSize: [24, 36],
                      iconAnchor: [12, 36]
                    })} />
                  </>
                )}
              </MapContainer>
            </div>

            {/* Floating Controls */}
            <div className="floating-panel">
              <h3 style={{ marginBottom: 15, fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}><Navigation size={18} /> Trip Planner</h3>
              <form onSubmit={handleSimulate}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                        <label className="input-label">Driver Name</label>
                        <input className="custom-input" value={formData.driver_name} readOnly style={{ background: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }} />
                    </div>
                    <div>
                        <label className="input-label">Truck #</label>
                        <input className="custom-input" value={formData.truck_number} readOnly style={{ background: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }} />
                    </div>
                </div>
                
                <label className="input-label">Carrier Name</label>
                <input className="custom-input" value={formData.carrier_name} onChange={e => setFormData({...formData, carrier_name: e.target.value})} />

                <div style={{ borderTop: '1px solid #f1f5f9', margin: '8px 0', paddingTop: 8 }}>
                    <label className="input-label">Origin / Pickup / Dropoff</label>
                    
                    {/* Origin Input */}
                    <div style={{ position: 'relative' }}>
                        <input className="custom-input" value={formData.current_location} placeholder="Origin" onChange={e => handleLocationChange('current_location', e.target.value)} />
                        {activeField === 'current_location' && (suggestions.length > 0 || isSearching) && (
                            <div className="suggestions-dropdown">
                                {isSearching ? (
                                    <div className="suggestion-item" style={{ color: '#64748b', fontStyle: 'italic' }}>Searching...</div>
                                ) : (
                                    suggestions.map((city, idx) => (
                                        <div 
                                            key={idx} 
                                            className="suggestion-item" 
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                selectSuggestion('current_location', city);
                                            }}
                                        >
                                            {city}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Pickup Input */}
                    <div style={{ position: 'relative' }}>
                        <input className="custom-input" value={formData.pickup_location} placeholder="Pickup" onChange={e => handleLocationChange('pickup_location', e.target.value)} />
                        {activeField === 'pickup_location' && (suggestions.length > 0 || isSearching) && (
                            <div className="suggestions-dropdown">
                                {isSearching ? (
                                    <div className="suggestion-item" style={{ color: '#64748b', fontStyle: 'italic' }}>Searching...</div>
                                ) : (
                                    suggestions.map((city, idx) => (
                                        <div 
                                            key={idx} 
                                            className="suggestion-item" 
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                selectSuggestion('pickup_location', city);
                                            }}
                                        >
                                            {city}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Dropoff Input */}
                    <div style={{ position: 'relative' }}>
                        <input className="custom-input" value={formData.dropoff_location} placeholder="Drop-off" onChange={e => handleLocationChange('dropoff_location', e.target.value)} />
                        {activeField === 'dropoff_location' && (suggestions.length > 0 || isSearching) && (
                            <div className="suggestions-dropdown">
                                {isSearching ? (
                                    <div className="suggestion-item" style={{ color: '#64748b', fontStyle: 'italic' }}>Searching...</div>
                                ) : (
                                    suggestions.map((city, idx) => (
                                        <div 
                                            key={idx} 
                                            className="suggestion-item" 
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                selectSuggestion('dropoff_location', city);
                                            }}
                                        >
                                            {city}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ marginTop: 8 }}>
                    <label className="input-label">Cycle Used (Hrs)</label>
                    <input className="custom-input" type="number" value={formData.cycle_used} onChange={e => setFormData({...formData, cycle_used: e.target.value})} />
                </div>
                <div style={{ marginTop: 8 }}>
                    <label className="input-label">Trip Start Time</label>
                    <input className="custom-input" type="datetime-local" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
                </div>

                <button className="action-btn" type="submit" disabled={loading} style={{ marginTop: 10 }}>
                  {loading ? 'Simulating...' : 'Generate Simulation & Logs'}
                </button>
              </form>

              {result && (
                <div style={{ marginTop: 15, padding: 12, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ color: '#64748b' }}>Total Distance:</span>
                        <span style={{ fontWeight: 800 }}>{result.summary.total_distance} mi</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 12 }}>
                        <span style={{ color: '#64748b' }}>Drive Time:</span>
                        <span style={{ fontWeight: 800 }}>{result.summary.total_driving_time}h</span>
                    </div>
                </div>
              )}
            </div>

            {/* Status Badges */}
            <div className="status-badges">
              <div className="badge"><Clock size={14} color="#ef4444" /> HOS Watch</div>
              <div className="badge"><div style={{ width: 8, height: 8, borderRadius: 4, background: '#22c55e' }} /> Active Simulation</div>
            </div>

            {/* Logs Tray */}
            <AnimatePresence>
              {result && (
                <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="logs-overlay">
                  {result.daily_logs.map(day => (
                    <div key={day.date} className="log-sheet-mini" onClick={() => setSelectedLog(day)} style={{ cursor: 'pointer', overflow: 'hidden' }}>
                      <div style={{ padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: 11, fontWeight: 800 }}>{day.date}</span>
                        <span style={{ fontSize: 10, color: '#2563eb' }}>Detail ✕</span>
                      </div>
                      <LogSheet logData={day} isMini driverName={formData.driver_name} truckNumber={formData.truck_number} carrierName={formData.carrier_name} />
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Modal */}
          <AnimatePresence>
            {selectedLog && result && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" onClick={() => setSelectedLog(null)}
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)' }}>
                
                {/* Navigation Controls */}
                {(() => {
                  const currentIndex = result.daily_logs.findIndex(l => l.date === selectedLog.date);
                  return (
                    <>
                      {currentIndex > 0 && (
                        <button onClick={(e) => { e.stopPropagation(); setSelectedLog(result.daily_logs[currentIndex - 1]); }} 
                          style={{ position: 'fixed', left: 40, background: 'white', border: 'none', borderRadius: '50%', width: 50, height: 50, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 1100 }}>
                          <ChevronLeft size={24} color="#1e293b" />
                        </button>
                      )}
                      
                      {currentIndex < result.daily_logs.length - 1 && (
                        <button onClick={(e) => { e.stopPropagation(); setSelectedLog(result.daily_logs[currentIndex + 1]); }} 
                          style={{ position: 'fixed', right: 40, background: 'white', border: 'none', borderRadius: '50%', width: 50, height: 50, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 1100 }}>
                          <ChevronRight size={24} color="#1e293b" />
                        </button>
                      )}
                    </>
                  );
                })()}

                <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} style={{ background: 'white', padding: 0, borderRadius: 16, width: '90%', maxWidth: '1000px', maxHeight: '90vh', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => setSelectedLog(null)} style={{ position: 'absolute', top: 18, right: 18, background: 'white', border: 'none', borderRadius: 20, width: 30, height: 30, cursor: 'pointer', fontWeight: 800, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 1100 }}>✕</button>
                  <div style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                      <LogSheet logData={selectedLog} driverName={formData.driver_name} truckNumber={formData.truck_number} carrierName={formData.carrier_name} />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Edit Profile Modal (Global Position) */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="profile-modal-backdrop"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }}
              className="profile-modal-card"
              onClick={e => e.stopPropagation()}
            >
              <button className="close-modal-btn" onClick={() => setShowEditModal(false)}>✕</button>
              <div className="profile-header-main">
                <div className="profile-initial-circle">
                    {formData.driver_name.charAt(0).toUpperCase()}
                </div>
                <h2>Your Profile</h2>
                <p className="manage-label">MANAGE ACCOUNT</p>
              </div>

              <div className="profile-form-new">
                {editError && (
                    <div className="edit-error-msg">{editError}</div>
                )}
                
                <div className="new-input-group">
                    <label>FULL NAME</label>
                    <input 
                        type="text" 
                        value={formData.driver_name} 
                        onChange={(e) => setFormData({...formData, driver_name: e.target.value})} 
                    />
                </div>

                <div className="new-input-group">
                    <label>TRUCK ID (LPK-XXXX)</label>
                    <input 
                        type="text" 
                        value={formData.truck_number} 
                        onChange={(e) => setFormData({...formData, truck_number: e.target.value})} 
                    />
                </div>

                <div className="modal-actions-row">
                    <button className="new-cancel-btn" onClick={() => { setShowEditModal(false); setEditError(''); }}>
                        CANCEL
                    </button>
                    <button className="new-save-btn" onClick={handleSaveProfile}>
                        SAVE
                    </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal (Global Position) */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="profile-modal-backdrop"
            onClick={() => setShowLogoutModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }}
              className="profile-modal-card logout-modal-card"
              onClick={e => e.stopPropagation()}
            >
              <div className="profile-header-main">
                <div className="profile-initial-circle logout-icon-circle">
                    <AlertCircle size={32} />
                </div>
                <h2>Sign Out</h2>
                <p className="manage-label">ARE YOU SURE?</p>
              </div>
              <div className="profile-form-box" style={{ gap: 12 }}>
                <button className="confirm-logout-btn" onClick={confirmLogout}>YES, SIGN OUT</button>
                <button className="cancel-logout-btn" onClick={() => setShowLogoutModal(false)}>CANCEL</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}

export default App;
