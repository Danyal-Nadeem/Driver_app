import React from 'react';
import {
  Truck, ShieldCheck, MapPin, Clock, ArrowRight,
  Activity, FileText, Sparkles, Globe, Shield, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import './LandingPage.css';

const LandingPage = ({ onNavigateToAuth }) => {
  // Common animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="landing-container">
      {/* Background Decor */}
      <div className="landing-glow-bg">
        <div className="glow-circle blue-glow"></div>
        <div className="glow-circle indigo-glow"></div>
        <div className="glow-particle p1"></div>
        <div className="glow-particle p2"></div>
        <div className="glow-particle p3"></div>
        <div className="glow-particle p4"></div>
        <div className="glow-particle p5"></div>
      </div>
      <div className="grid-overlay"></div>

      {/* Header / Navigation */}
      <header className="landing-header">
        <div className="landing-logo">
          <div className="landing-logo-icon">
            <Truck size={20} color="white" />
          </div>
          <h2>Drive<span>Ledger</span></h2>
        </div>

        <nav className="landing-nav">
          <a href="#features">Features</a>
          <a href="#hos-rules">HOS Rules</a>
          <a href="#compliance">Compliance</a>
          <a href="#demo">Preview</a>
        </nav>

        <div className="landing-auth-actions">
          <button className="btn-text" onClick={() => onNavigateToAuth(false)}>Login</button>
          <button className="btn-primary" onClick={() => onNavigateToAuth(true)}>
            Get Started <ArrowRight size={14} style={{ marginLeft: 6 }} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero-section">
        <div className="hero-text-content">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="hero-badge"
          >
            <Sparkles size={12} color="#3b82f6" />
            <span>Next-Gen Smart ELD Simulator</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="hero-main-title"
          >
            Precision Fleet Intelligence <br />
            & <span>HOS Compliance</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hero-description"
          >
            A high-fidelity trip planner and simulator built to enforce Hours of Service (HOS) rules, automatically detect fueling stops, optimize global routing, and generate compliance-ready ELD log sheets instantly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hero-buttons"
          >
            <button className="btn-primary-large" onClick={() => onNavigateToAuth(true)}>
              Launch Simulator <ArrowRight size={18} style={{ marginLeft: 8 }} />
            </button>
            <button className="btn-secondary-large" onClick={() => onNavigateToAuth(false)}>
              Driver Sign In
            </button>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="quick-stats"
          >
            <motion.div variants={fadeInUp} className="stat-card">
              <h3>11<span>h</span></h3>
              <p>Max Drive Limit</p>
            </motion.div>
            <div className="stat-divider"></div>
            <motion.div variants={fadeInUp} className="stat-card">
              <h3>10<span>h</span></h3>
              <p>Off-Duty Reset</p>
            </motion.div>
            <div className="stat-divider"></div>
            <motion.div variants={fadeInUp} className="stat-card">
              <h3>70<span>h</span></h3>
              <p>8-Day Cycle</p>
            </motion.div>
          </motion.div>
        </div>

        {/* Dashboard Mockup / Visual */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hero-visual-wrapper"
        >
          <div className="dashboard-mockup">
            <div className="mockup-header">
              <div className="mockup-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <div className="mockup-address">
                <Globe size={12} color="#475569" />
                <span>driveledger-logistics.com/dashboard</span>
              </div>
            </div>

            <div className="mockup-content">
              {/* Sidebar Mockup */}
              <div className="mockup-sidebar">
                <div className="mockup-logo-square"></div>
                <div className="mockup-menu-item active"></div>
                <div className="mockup-menu-item"></div>
                <div className="mockup-menu-item"></div>
                <div className="mockup-menu-item" style={{ marginTop: 'auto' }}></div>
              </div>

              {/* Main App Workspace Mockup */}
              <div className="mockup-main">
                <div className="mockup-dashboard-header">
                  <div className="mockup-title-skeleton"></div>
                  <div className="mockup-profile-skeleton"></div>
                </div>

                <div className="mockup-grid">
                  <div className="mockup-panel">
                    <div className="skeleton-title"></div>
                    <div className="skeleton-input"></div>
                    <div className="skeleton-input"></div>
                    <div className="skeleton-input"></div>
                    <div className="skeleton-button"></div>
                  </div>

                  <div className="mockup-map">
                    <div className="map-route-line"></div>
                    <div className="map-marker-mockup start"><span>P</span></div>
                    <div className="map-marker-mockup end"><span>D</span></div>
                    <div className="map-marker-mockup stop"><span>⛽</span></div>

                    <div className="map-hud">
                      <div className="hud-metric">
                        <Activity size={10} color="#2563eb" />
                        <span className="metric-skeleton"></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Log Mini-Graph Mockup */}
                <div className="mockup-logs-tray">
                  <div className="mini-log-card">
                    <div className="mini-log-header"></div>
                    <div className="mini-log-graph">
                      <div className="graph-line off-duty"></div>
                      <div className="graph-line sleeper"></div>
                      <div className="graph-line driving"></div>
                      <div className="graph-line on-duty"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="landing-features-section">
        <div className="section-header">
          <h2>Engineered for Modern Logistics</h2>
          <p>Everything a driver or dispatcher needs to simulate complex route schedules with 100% compliance accuracy.</p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="features-grid"
        >
          <motion.div variants={fadeInUp} className="feature-card">
            <div className="feature-icon-box">
              <Globe size={24} color="#3b82f6" />
            </div>
            <h3>Intelligent Geocoding</h3>
            <p>Integrated with Nominatim & OSRM APIs to resolve locations instantly and build precise, real-world route geometries globally.</p>
          </motion.div>

          <motion.div variants={fadeInUp} className="feature-card">
            <div className="feature-icon-box">
              <Clock size={24} color="#3b82f6" />
            </div>
            <h3>HOS Rule Engine</h3>
            <p>Simulates real-world limits including 11h driving bounds, 30-min breaks, and 70hr/8day cycle balances automatically.</p>
          </motion.div>

          <motion.div variants={fadeInUp} className="feature-card">
            <div className="feature-icon-box">
              <ShieldCheck size={24} color="#3b82f6" />
            </div>
            <h3>Automated Fuel Logs</h3>
            <p>Injects mandatory 30-minute fueling stops every 1,000 miles, reflecting accurate fuel usage and stopover behaviors.</p>
          </motion.div>

          <motion.div variants={fadeInUp} className="feature-card">
            <div className="feature-icon-box">
              <FileText size={24} color="#3b82f6" />
            </div>
            <h3>Visual ELD Outputs</h3>
            <p>Generates interactive, industry-standard daily logs with continuous grid graphs representing Off Duty, Sleeper Berth, Driving, and On Duty statuses.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Compliance / Rules breakdown */}
      <section id="hos-rules" className="landing-rules-section">
        <div className="rules-content">
          <div className="rules-text">
            <h2>Fully Compliant HOS Logic</h2>
            <p>
              Our simulation engine strictly obeys property-carrying driver regulations set by transportation safety authorities. We calculate duty cycles so you stay safe and free of warnings.
            </p>

            <div className="rules-list">
              <div className="rule-item">
                <div className="rule-bullet"></div>
                <div>
                  <h4>11-Hour Driving Limit</h4>
                  <p>Drivers cannot exceed 11 hours of active steering time without a reset period.</p>
                </div>
              </div>

              <div className="rule-item">
                <div className="rule-bullet"></div>
                <div>
                  <h4>10-Hour Consecutive Off-Duty</h4>
                  <p>A full 10-hour block off-duty or in sleeper berth resets the daily driving limit.</p>
                </div>
              </div>

              <div className="rule-item">
                <div className="rule-bullet"></div>
                <div>
                  <h4>30-Minute Break</h4>
                  <p>Drivers must take a consecutive 30-minute rest break after 8 hours of cumulative driving.</p>
                </div>
              </div>

              <div className="rule-item">
                <div className="rule-bullet"></div>
                <div>
                  <h4>70-Hour / 8-Day Cycle</h4>
                  <p>Tracks and prevents duty status progression once the cumulative 70-hour limit is reached within an 8-day rolling window.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rules-visual">
            <div className="compliance-gauge-card">
              <div className="gauge-header">
                <h3>ELD Status Monitor</h3>
                <span className="gauge-status-badge">ONLINE</span>
              </div>
              <div className="gauge-indicator">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" className="gauge-track" />
                  <circle cx="50" cy="50" r="40" className="gauge-progress" />
                </svg>
                <div className="gauge-label-inner">
                  <h4>100%</h4>
                  <p>Compliant</p>
                </div>
              </div>
              <div className="gauge-footer">
                <div className="gauge-metric-item">
                  <span className="metric-dot green"></span>
                  <div>
                    <span className="lbl">Violations</span>
                    <span className="val">0 detected</span>
                  </div>
                </div>
                <div className="gauge-metric-item">
                  <span className="metric-dot blue"></span>
                  <div>
                    <span className="lbl">HOS Health</span>
                    <span className="val">Optimal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="landing-cta-section">
        <div className="cta-box">
          <div className="cta-glow"></div>
          <h2>Ready to simulate your first trip?</h2>
          <p>Create a secure driver profile, enter your truck details, and start simulating logs in seconds.</p>
          <button className="btn-primary-large" onClick={() => onNavigateToAuth(true)}>
            Start Free Registration <ArrowRight size={18} style={{ marginLeft: 8 }} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo-icon">
              <Truck size={16} color="white" />
            </div>
            <h3>Drive<span>Ledger</span></h3>
          </div>
          <p>Smart ELD Log Simulator & Hours of Service Rule Engine.</p>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} DriveLedger Logistics. All rights reserved.</p>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
