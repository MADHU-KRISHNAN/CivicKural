import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiService, { UserRole } from '../services/api';

export const LoginScreen: React.FC = () => {
  const [portalRole, setPortalRole] = useState<UserRole>('citizen');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [department, setDepartment] = useState('Sanitation Oversight');
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = (location.state as any)?.from;

  // Set default emails based on portal
  useEffect(() => {
    if (mode === 'login') {
      if (portalRole === 'citizen') setEmail('citizen@example.com');
      else if (portalRole === 'staff') setEmail('rajesh.mod@civickural.gov.in');
      else if (portalRole === 'admin') setEmail('admin@civickural.gov.in');
    } else {
      setEmail('');
    }
  }, [portalRole, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please provide a valid email address');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }

    if (mode === 'register' && !name.trim()) {
      setErrorMessage('Please provide your full name');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await apiService.login(email.trim(), portalRole, password);
        if (res.success && res.data) {
          const userRole = res.data.user.role || res.data.user.userType || 'citizen';
          const target = redirectPath || (userRole === 'admin' ? '/admin' : userRole === 'staff' ? '/staff' : '/dashboard');
          navigate(target, { replace: true });
        } else {
          setErrorMessage(res.error || 'Authentication failed. Please check your credentials.');
        }
      } else {
        const res = await apiService.register({
          name: name.trim(),
          email: email.trim(),
          password,
          role: portalRole,
          userType: portalRole,
          department: portalRole === 'staff' || portalRole === 'admin' ? department : undefined,
        });

        if (res.success && res.data) {
          const userRole = res.data.user.role || res.data.user.userType || 'citizen';
          const target = redirectPath || (userRole === 'admin' ? '/admin' : userRole === 'staff' ? '/staff' : '/dashboard');
          navigate(target, { replace: true });
        } else {
          setErrorMessage(res.error || 'Registration failed. Email may already be in use.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setErrorMessage('');
    const demoEmail = portalRole === 'admin' ? 'admin@civickural.gov.in' : portalRole === 'staff' ? 'rajesh.mod@civickural.gov.in' : 'citizen@example.com';
    try {
      const res = await apiService.login(demoEmail, portalRole, 'password123'); // Assume password123 for demo
      if (res.success && res.data) {
        const userRole = res.data.user.role || res.data.user.userType || 'citizen';
        const target = redirectPath || (userRole === 'admin' ? '/admin' : userRole === 'staff' ? '/staff' : '/dashboard');
        navigate(target, { replace: true });
      } else {
        setErrorMessage(res.error || 'Demo login failed.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  const getPortalConfig = () => {
    switch (portalRole) {
      case 'admin':
        return {
          title: 'Administrator Portal',
          accentColor: '#8b5cf6',
          icon: '🛡️',
          desc: 'System Configuration & Analytics'
        };
      case 'staff':
        return {
          title: 'Staff Portal',
          accentColor: '#f59e0b',
          icon: '👷',
          desc: 'Ward Queue & Issue Resolution'
        };
      case 'citizen':
      default:
        return {
          title: 'Citizen Portal',
          accentColor: '#0284c7',
          icon: '👤',
          desc: 'Report & Track Issues'
        };
    }
  };

  const config = getPortalConfig();

  return (
    <div style={styles.container}>
      <div style={styles.cardWrapper}>
        <div style={styles.header}>
          <div style={{ fontSize: '42px', marginBottom: '8px' }}>🏛️</div>
          <h1 style={styles.title}>CivicKural</h1>
          <p style={styles.subtitle}>AI-Powered Civic Governance Platform</p>
        </div>

        {/* Portal Selection Tabs */}
        <div style={styles.portalTabs}>
          <button
            onClick={() => { setPortalRole('citizen'); setMode('login'); setErrorMessage(''); }}
            style={{ ...styles.portalTab, ...(portalRole === 'citizen' ? { ...styles.portalTabActive, borderColor: '#0284c7', color: '#0284c7' } : {}) }}
          >
            👤 Citizen
          </button>
          <button
            onClick={() => { setPortalRole('staff'); setMode('login'); setErrorMessage(''); }}
            style={{ ...styles.portalTab, ...(portalRole === 'staff' ? { ...styles.portalTabActive, borderColor: '#f59e0b', color: '#f59e0b' } : {}) }}
          >
            👷 Staff
          </button>
          <button
            onClick={() => { setPortalRole('admin'); setMode('login'); setErrorMessage(''); }}
            style={{ ...styles.portalTab, ...(portalRole === 'admin' ? { ...styles.portalTabActive, borderColor: '#8b5cf6', color: '#8b5cf6' } : {}) }}
          >
            🛡️ Admin
          </button>
        </div>

        <div style={{ ...styles.card, borderTop: `4px solid ${config.accentColor}` }}>
          
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
             <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>
               {config.icon} {config.title}
             </h2>
             <p style={{ fontSize: '13px', color: '#94a3b8' }}>{config.desc}</p>
          </div>

          {/* Mode Switcher - Only for Citizen */}
          {portalRole === 'citizen' && (
            <div style={styles.toggleContainer}>
              <button
                type="button"
                style={{
                  ...styles.toggleBtn,
                  ...(mode === 'login' ? { ...styles.toggleBtnActive, backgroundColor: config.accentColor } : {}),
                }}
                onClick={() => {
                  setMode('login');
                  setErrorMessage('');
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                style={{
                  ...styles.toggleBtn,
                  ...(mode === 'register' ? { ...styles.toggleBtnActive, backgroundColor: config.accentColor } : {}),
                }}
                onClick={() => {
                  setMode('register');
                  setErrorMessage('');
                }}
              >
                Create Account
              </button>
            </div>
          )}

          {errorMessage && (
            <div style={styles.errorAlert}>
              <span>⚠️</span> <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            {mode === 'register' && (
              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="name-input">Full Name</label>
                <input
                  id="name-input"
                  style={styles.input}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  disabled={loading}
                  required
                />
              </div>
            )}

            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="email-input">Email Address</label>
              <input
                id="email-input"
                style={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                disabled={loading}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="password-input">Password</label>
              <input
                id="password-input"
                style={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              style={{
                ...styles.submitBtn,
                backgroundColor: config.accentColor,
                ...(loading ? styles.buttonDisabled : {}),
              }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : mode === 'login' ? `Sign In to ${config.title}` : 'Register Account'}
            </button>
          </form>

          {/* Quick Demo Shortcuts */}
          <div style={styles.demoSection}>
            <p style={styles.demoTitle}>⚡ One-Click Demo Access</p>
            <div style={styles.demoBtnGroup}>
              <button
                type="button"
                style={{ ...styles.demoBtn, borderColor: config.accentColor, color: config.accentColor }}
                onClick={handleDemoLogin}
                disabled={loading}
              >
                One-Click {config.title} Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '24px',
    boxSizing: 'border-box',
    width: '100%',
  },
  cardWrapper: {
    maxWidth: '460px',
    width: '100%',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '24px',
    textAlign: 'center',
  },
  title: {
    fontSize: '36px',
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: '4px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#94a3b8',
  },
  portalTabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },
  portalTab: {
    flex: 1,
    padding: '12px 0',
    backgroundColor: '#1e293b',
    border: '2px solid transparent',
    borderRadius: '12px',
    color: '#94a3b8',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  portalTabActive: {
    backgroundColor: '#0f172a',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    padding: '32px 28px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
  },
  toggleContainer: {
    display: 'flex',
    backgroundColor: '#0f172a',
    borderRadius: '10px',
    padding: '4px',
    marginBottom: '24px',
  },
  toggleBtn: {
    flex: 1,
    padding: '10px 0',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  toggleBtnActive: {
    color: '#ffffff',
  },
  errorAlert: {
    backgroundColor: '#450a0a',
    border: '1px solid #991b1b',
    color: '#fca5a5',
    padding: '12px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '18px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '18px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: '6px',
  },
  input: {
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '12px 14px',
    fontSize: '15px',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
  },
  submitBtn: {
    padding: '14px 0',
    borderRadius: '8px',
    border: 'none',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '6px',
    marginBottom: '20px',
    transition: 'all 0.2s ease',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  demoSection: {
    borderTop: '1px solid #334155',
    paddingTop: '18px',
    textAlign: 'center',
  },
  demoTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: '12px',
  },
  demoBtnGroup: {
    display: 'flex',
    gap: '10px',
  },
  demoBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid',
    backgroundColor: 'transparent',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

export default LoginScreen;