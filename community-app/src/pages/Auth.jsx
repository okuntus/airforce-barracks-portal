import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle, ArrowLeft, Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import GhanaAirForceLogo from '../assets/images.jpg';
import './Auth.css';

export default function Auth() {
  const [mode, setMode] = useState('welcome'); // welcome | login | signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const reset = (nextMode) => {
    setError('');
    setEmail('');
    setPassword('');
    setFullName('');
    setConfirmPassword('');
    setShowPassword(false);
    setMode(nextMode);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Email and password are required'); return; }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password || !confirmPassword) { setError('All fields are required'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setLoading(true);
    try {
      await register(email, password, fullName);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left Panel — Branding */}
      <motion.div
        className="auth-branding"
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="branding-content">
          <motion.div
            className="logo-container"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img src={GhanaAirForceLogo} alt="Ghana Air Force Logo" className="logo-image" />
          </motion.div>

          <motion.h1
            className="branding-title"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Airforce Information Portal
          </motion.h1>

          <motion.p
            className="branding-subtitle"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Secure Access Portal
          </motion.p>

          <motion.p
            className="branding-descriptor"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.36 }}
          >
            Military Community Management System
          </motion.p>

          <motion.div
            className="security-badge"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Lock size={15} strokeWidth={2} />
            <span>256-bit Encrypted Session</span>
          </motion.div>

          <div className="animated-particles">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="particle"
                animate={{ y: [0, -28, 0], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right Panel — Auth Forms */}
      <div className="auth-panel">

        {/* Welcome */}
        {mode === 'welcome' && (
          <motion.div
            className="auth-card welcome-card"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="welcome-title">Welcome</h2>
            <p className="welcome-subtitle">Sign in to your account or create a new one to access the portal</p>
            <div className="welcome-buttons">
              <motion.button className="btn btn-primary" onClick={() => setMode('login')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                Log In
              </motion.button>
              <motion.button className="btn btn-secondary" onClick={() => setMode('signup')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                Create Account
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Login */}
        {mode === 'login' && (
          <motion.div
            className="auth-card login-card"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="card-header">
              <button className="back-button" onClick={() => reset('welcome')}>
                <ArrowLeft size={15} strokeWidth={2} /> Back
              </button>
              <h2>Log In</h2>
            </div>

            <form onSubmit={handleLogin} className="auth-form">
              {error && (
                <motion.div className="error-message" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                  <AlertTriangle size={14} strokeWidth={2} /> {error}
                </motion.div>
              )}

              <div className="form-group">
                <label htmlFor="login-email">Email Address</label>
                <input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required autoComplete="email" />
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <div className="password-input-wrapper">
                  <input id="login-password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required autoComplete="current-password" />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(v => !v)} title={showPassword ? 'Hide' : 'Show'}>
                    {showPassword ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
                  </button>
                </div>
              </div>

              <motion.button type="submit" className="btn btn-primary btn-block" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                {loading ? <><Loader2 size={16} strokeWidth={2} className="spin" /> Logging in...</> : 'Log In'}
              </motion.button>

              <p className="auth-switch">
                Don't have an account?{' '}
                <button type="button" className="link-button" onClick={() => reset('signup')}>Create one</button>
              </p>
            </form>
          </motion.div>
        )}

        {/* Sign Up */}
        {mode === 'signup' && (
          <motion.div
            className="auth-card signup-card"
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="card-header">
              <button className="back-button" onClick={() => reset('welcome')}>
                <ArrowLeft size={15} strokeWidth={2} /> Back
              </button>
              <h2>Create Account</h2>
            </div>

            <form onSubmit={handleSignup} className="auth-form">
              {error && (
                <motion.div className="error-message" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                  <AlertTriangle size={14} strokeWidth={2} /> {error}
                </motion.div>
              )}

              <div className="form-group">
                <label htmlFor="signup-name">Full Name</label>
                <input id="signup-name" type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Flight Lieutenant Mensah" required autoComplete="name" />
              </div>

              <div className="form-group">
                <label htmlFor="signup-email">Email Address</label>
                <input id="signup-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required autoComplete="email" />
              </div>

              <div className="form-group">
                <label htmlFor="signup-password">Password</label>
                <div className="password-input-wrapper">
                  <input id="signup-password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" required autoComplete="new-password" />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(v => !v)} title={showPassword ? 'Hide' : 'Show'}>
                    {showPassword ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="signup-confirm">Confirm Password</label>
                <div className="password-input-wrapper">
                  <input id="signup-confirm" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat your password" required autoComplete="new-password" />
                </div>
              </div>

              <motion.button type="submit" className="btn btn-primary btn-block" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                {loading ? <><Loader2 size={16} strokeWidth={2} className="spin" /> Creating account...</> : 'Create Account'}
              </motion.button>

              <p className="auth-switch">
                Already have an account?{' '}
                <button type="button" className="link-button" onClick={() => reset('login')}>Log in</button>
              </p>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
