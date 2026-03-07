import { Ban, Loader2, ShieldAlert } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: 'var(--space-6)'
      }}>
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--glass-surface-heavy)',
          border: '1px solid var(--glass-border-strong)',
          boxShadow: 'var(--shadow-glow-soft)'
        }}>
          <Loader2 size={42} strokeWidth={1.8} style={{ color: 'var(--color-primary)', marginBottom: '12px' }} />
          <div style={{ color: 'var(--color-gray-600)', fontWeight: 600 }}>Loading secure session...</div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && userRole !== 'admin') {
    return (
      <div style={{
        padding: 'var(--space-8)',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <div style={{
          margin: '0 auto 16px',
          width: '72px',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '999px',
          background: 'rgba(255, 87, 87, 0.15)',
          border: '1px solid rgba(255, 87, 87, 0.25)'
        }}>
          <ShieldAlert size={34} strokeWidth={1.8} style={{ color: 'var(--color-error)' }} />
        </div>
        <h2 style={{ color: 'var(--color-error)', marginBottom: '8px' }}>Access Denied</h2>
        <p style={{ color: 'var(--color-gray-600)' }}>
          You don't have permission to access this page. Admin privileges required.
        </p>
        <a href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '24px',
          padding: '12px 24px',
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
          color: 'white',
          borderRadius: 'var(--radius-md)',
          textDecoration: 'none',
          fontWeight: 600
        }}>
          <Ban size={16} strokeWidth={2} />
          Return to Home
        </a>
      </div>
    );
  }

  return children;
}
