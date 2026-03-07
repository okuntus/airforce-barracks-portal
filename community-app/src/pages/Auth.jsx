import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  AlertTriangle,
  ArrowLeft,
  Eye,
  EyeOff,
  FlaskConical,
  Loader2,
  Lock,
  ShieldCheck,
  UserCircle2
} from 'lucide-react';
import GhanaAirForceLogo from '../assets/images.jpg';
import './Auth.css';

export default function Auth() {
  const [authMode, setAuthMode] = useState('welcome'); // welcome, login, signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { demoLogin } = useAuth();
  const navigate = useNavigate();

  const DEMO_ACCOUNTS = {
    'user@demo.com': { password: 'password', role: 'user' },
    'admin@demo.com': { password: 'password', role: 'admin' }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const account = DEMO_ACCOUNTS[email];
      if (account && account.password === password) {
        demoLogin({ email, role: account.role });
        navigate('/');
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      setError(error.message || 'Login failed');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!fullName || !email || !username || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // Demo mode signup - just login as new user
      demoLogin({ 
        email, 
        role: 'user',
        name: fullName,
        username: username
      });
      navigate('/');
    } catch (error) {
      setError(error.message || 'Sign up failed');
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail, role) => {
    demoLogin({ 
      email: demoEmail, 
      role: role
    });
    navigate('/');
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div className="auth-container">
      {/* Left Panel - Branding */}
      <motion.div 
        className="auth-branding"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="branding-content">
          {/* Air Force Logo/Insignia */}
          <motion.div 
            className="logo-container"
            animate={{ 
              y: [0, -10, 0],
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <img 
              src={GhanaAirForceLogo} 
              alt="Ghana Air Force Logo" 
              className="logo-image"
            />
          </motion.div>

          {/* Title and Subtitle */}
          <motion.h1 
            className="branding-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Air Force Barracks
          </motion.h1>

          <motion.p 
            className="branding-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Secure Access Portal
          </motion.p>

          <motion.p
            className="branding-descriptor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.36, duration: 0.5 }}
          >
            Military Community Management System
          </motion.p>

          {/* Security Indicator */}
          <motion.div 
            className="security-badge"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <span className="security-icon"><Lock size={16} strokeWidth={2} /></span>
            <span>256-bit Encrypted Session</span>
          </motion.div>

          {/* Animated Background Elements */}
          <div className="animated-particles">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="particle"
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 3 + i,
                  repeat: Infinity,
                  delay: i * 0.5
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right Panel - Authentication */}
      <div className="auth-panel">
        {authMode === 'welcome' && (
          <motion.div
            key="welcome"
            className="auth-card welcome-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="welcome-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
            >
              <motion.h2 
                className="welcome-title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Welcome
              </motion.h2>

              <motion.p 
                className="welcome-subtitle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Sign in to your community account or create a new one
              </motion.p>

              <motion.div 
                className="welcome-buttons"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <motion.button
                  className="btn btn-primary"
                  onClick={() => setAuthMode('login')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Log In
                </motion.button>

                <motion.button
                  className="btn btn-secondary"
                  onClick={() => setAuthMode('signup')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign Up
                </motion.button>
              </motion.div>

              {/* Demo Mode Section */}
              <motion.div 
                className="demo-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="demo-label"><FlaskConical size={14} strokeWidth={2} /> Demo Mode</p>
                <p className="demo-description">Try the system with demo credentials</p>
                
                <div className="demo-buttons">
                  <motion.button
                    className="demo-btn user-demo"
                    onClick={() => handleQuickDemo('user@demo.com', 'user')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="demo-icon"><UserCircle2 size={20} strokeWidth={2} /></span>
                    <span>User Demo</span>
                  </motion.button>

                  <motion.button
                    className="demo-btn admin-demo"
                    onClick={() => handleQuickDemo('admin@demo.com', 'admin')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="demo-icon"><ShieldCheck size={20} strokeWidth={2} /></span>
                    <span>Admin Demo</span>
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {authMode === 'login' && (
          <motion.div
            key="login"
            className="auth-card login-card"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="card-header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <button
                className="back-button"
                onClick={() => {
                  setAuthMode('welcome');
                  setError('');
                }}
              >
                <ArrowLeft size={15} strokeWidth={2} /> Back
              </button>
              <h2>Log In</h2>
            </motion.div>

            <form onSubmit={handleLogin} className="auth-form">
              {error && (
                <motion.div
                  className="error-message"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span className="error-icon"><AlertTriangle size={14} strokeWidth={2} /></span>
                  {error}
                </motion.div>
              )}

              <motion.div 
                className="form-group"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <label htmlFor="login-email">Email or Username</label>
                <input
                  id="login-email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@demo.com"
                  required
                />
              </motion.div>

              <motion.div 
                className="form-group"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                <label htmlFor="login-password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
                  </button>
                </div>
              </motion.div>

              <motion.div 
                className="form-options"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember me
                </label>
                <a href="#forgot" className="forgot-password">
                  Forgot password?
                </a>
              </motion.div>

              <motion.button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                {loading ? (
                  <span className="loading-spinner"><Loader2 size={16} strokeWidth={2} /> Logging in...</span>
                ) : (
                  'Log In'
                )}
              </motion.button>

              <motion.p 
                className="auth-switch"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setError('');
                  }}
                  className="link-button"
                >
                  Sign Up
                </button>
              </motion.p>
            </form>
          </motion.div>
        )}

        {authMode === 'signup' && (
          <motion.div
            key="signup"
            className="auth-card signup-card"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="card-header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <button
                className="back-button"
                onClick={() => {
                  setAuthMode('welcome');
                  setError('');
                }}
              >
                <ArrowLeft size={15} strokeWidth={2} /> Back
              </button>
              <h2>Create Account</h2>
            </motion.div>

            <form onSubmit={handleSignup} className="auth-form">
              {error && (
                <motion.div
                  className="error-message"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span className="error-icon"><AlertTriangle size={14} strokeWidth={2} /></span>
                  {error}
                </motion.div>
              )}

              <motion.div 
                className="form-group"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <label htmlFor="signup-name">Full Name</label>
                <input
                  id="signup-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Smith"
                  required
                />
              </motion.div>

              <motion.div 
                className="form-group"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                <label htmlFor="signup-email">Email</label>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                />
              </motion.div>

              <motion.div 
                className="form-group"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <label htmlFor="signup-username">Username</label>
                <input
                  id="signup-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johnsmith"
                  required
                />
              </motion.div>

              <motion.div 
                className="form-group"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                <label htmlFor="signup-password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
                  </button>
                </div>
              </motion.div>

              <motion.div 
                className="form-group"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <label htmlFor="signup-confirm">Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="signup-confirm"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
                  </button>
                </div>
              </motion.div>

              <motion.button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
              >
                {loading ? (
                  <span className="loading-spinner"><Loader2 size={16} strokeWidth={2} /> Creating account...</span>
                ) : (
                  'Create Account'
                )}
              </motion.button>

              <motion.p 
                className="auth-switch"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setError('');
                  }}
                  className="link-button"
                >
                  Log In
                </button>
              </motion.p>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
