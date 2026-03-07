import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui';
import GhanaAirForceLogo from '../assets/images.jpg';
import './Login.css';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, register, demoLogin } = useAuth();
  const navigate = useNavigate();

  const DEMO_ACCOUNTS = {
    'user@demo.com': { password: 'password', role: 'user' },
    'admin@demo.com': { password: 'password', role: 'admin' }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check if credentials are valid
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Demo mode - use local authentication
      if (isDemoMode) {
        const account = DEMO_ACCOUNTS[email];
        if (account && account.password === password) {
          // Use demo login
          demoLogin({ email, role: account.role });
          navigate('/');
        } else {
          throw new Error('Invalid email or password');
        }
      } else {
        // Real Firebase authentication
        if (isLogin) {
          await login(email, password);
        } else {
          await register(email, password);
        }
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(
        error.message || 
        (error.code === 'auth/invalid-credential'
          ? 'Invalid email or password'
          : error.code === 'auth/email-already-in-use'
          ? 'Email already in use'
          : error.code === 'auth/weak-password'
          ? 'Password should be at least 6 characters'
          : 'Failed to ' + (isLogin ? 'login' : 'register'))
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (email, password) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <img src={GhanaAirForceLogo} alt="Ghana Air Force Logo" className="login-logo" />
          </div>
          <h1>Airforce Barracks Portal</h1>
          <p className="tagline">🔐 Secure Access Portal</p>
          <div className="subtitle-divider"></div>
          <p className="subtitle">🏢 Military Community Management System</p>
          <p className="subtitle-description">Connecting personnel, managing events, sharing announcements</p>
          {isDemoMode && (
            <div className="demo-badge">
              🧪 DEMO MODE
            </div>
          )}
        </div>
        
        <div className="security-features">
          <div className="feature">
            <span className="feature-icon">🔒</span>
            <span className="feature-text">256-bit Encrypted Session</span>
          </div>
          <div className="feature">
            <span className="feature-icon">⚡</span>
            <span className="feature-text">Real-time Updates</span>
          </div>
          <div className="feature">
            <span className="feature-icon">👥</span>
            <span className="feature-text">Community Management</span>
          </div>
        </div>

        {!isDemoMode && (
          <div className="login-tabs">
            <button
              className={isLogin ? 'active' : ''}
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
            >
              Login
            </button>
            <button
              className={!isLogin ? 'active' : ''}
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
            >
              Register
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@airforce.mil"
              required
              autoComplete="email"
              aria-label="Email Address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete={isLogin ? "current-password" : "new-password"}
                aria-label="Password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex="-1"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              className="forgot-password"
              onClick={() => alert('Please contact your administrator to reset your password.')}
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <span className="loading-content">
                <span className="spinner"></span>
                Authenticating...
              </span>
            ) : (
              'Login'
            )}
          </Button>

          <div className="keyboard-hint">
            <span>💡 Tip: Press <kbd>Enter</kbd> to submit</span>
          </div>
        </form>

        <div className="login-info">
          <div className="demo-mode-info">
            <p><strong>✅ Demo Mode Enabled</strong></p>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              Firebase credentials not configured. Using demo authentication.<br/>
              Click demo accounts below to auto-fill credentials.
            </p>
          </div>

          <div className="demo-credentials">
            <p><strong>Demo Accounts:</strong></p>
            
            <button
              type="button"
              className="demo-account-btn user"
              onClick={() => handleDemoLogin('user@demo.com', 'password')}
              disabled={loading}
            >
              👤 User Account
              <span>user@demo.com</span>
            </button>

            <button
              type="button"
              className="demo-account-btn admin"
              onClick={() => handleDemoLogin('admin@demo.com', 'password')}
              disabled={loading}
            >
              👨‍💼 Admin Account
              <span>admin@demo.com</span>
            </button>
          </div>
        </div>

        <div className="login-footer">
          <p>© 2026 Ghana Air Force. All rights reserved.</p>
          <p className="version">Portal v1.0.0 | Secure Access System</p>
        </div>
      </div>
    </div>
  );
}
