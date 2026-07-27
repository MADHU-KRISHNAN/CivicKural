import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiService, { UserRole } from '../services/api';

export const LoginScreen: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('citizen@example.com');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<UserRole>('citizen');
  const [department, setDepartment] = useState('Sanitation Oversight');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = (location.state as any)?.from;

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
        const res = await apiService.login(email.trim(), role, password);
        if (res.success && res.data) {
          const userRole = res.data.user.role || res.data.user.userType || 'citizen';
          const target = redirectPath || (userRole === 'admin' || userRole === 'staff' ? '/admin' : '/dashboard');
          navigate(target, { replace: true });
        } else {
          setErrorMessage(res.error || 'Authentication failed. Please check your credentials.');
        }
      } else {
        const res = await apiService.register({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          userType: role,
          department: role === 'staff' || role === 'admin' ? department : undefined,
        });

        if (res.success && res.data) {
          const userRole = res.data.user.role || res.data.user.userType || 'citizen';
          const target = redirectPath || (userRole === 'admin' || userRole === 'staff' ? '/admin' : '/dashboard');
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

  const handleDemoLogin = async (demoRole: UserRole) => {
    setLoading(true);
    setErrorMessage('');
    const demoEmail = demoRole === 'admin' ? 'admin@civickural.gov.in' : demoRole === 'staff' ? 'rajesh.mod@civickural.gov.in' : 'citizen@example.com';
    try {
      const res = await apiService.login(demoEmail, demoRole, 'CivicKural#2026!');
      if (res.success && res.data) {
        const target = redirectPath || (demoRole === 'admin' || demoRole === 'staff' ? '/admin' : '/dashboard');
        navigate(target, { replace: true });
      }
    } catch {
      setErrorMessage('Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.cardWrapper}>
        <div style={styles.header}>
          <div style={{ fontSize: '42px', marginBottom: '8px' }}>🏛️</div>
          <h1 style={styles.title}>CivicKural</h1>
          <p style={styles.subtitle}>AI-Powered Civic Governance &amp; Grievance Platform</p>
        </div>

        <div style={styles.card}>
          {/* Mode Switcher */}
          <div style={styles.toggleContainer}>
            <button
              type="button"
              style={{
                ...styles.toggleBtn,
                ...(mode === 'login' ? styles.toggleBtnActive : {}),
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
                ...(mode === 'register' ? styles.toggleBtnActive : {}),
              }}
              onClick={() => {
                setMode('register');
                setErrorMessage('');
              }}
            >
              Create Account
            </button>
          </div>

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

            {/* Account Role Selector */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Account Portal Role</label>
              <div style={styles.roleGrid}>
                <button
                  type="button"
                  style={{
                    ...styles.roleBtn,
                    ...(role === 'citizen' ? styles.roleBtnActive : {}),
                  }}
                  onClick={() => setRole('citizen')}
                >
                  <span>👤</span>
                  <span>Citizen</span>
                </button>

                <button
                  type="button"
                  style={{
                    ...styles.roleBtn,
                    ...(role === 'staff' ? styles.roleBtnActive : {}),
                  }}
                  onClick={() => setRole('staff')}
                >
                  <span>👷</span>
                  <span>Municipal Staff</span>
                </button>

                <button
                  type="button"
                  style={{
                    ...styles.roleBtn,
                    ...(role === 'admin' ? styles.roleBtnActive : {}),
                  }}
                  onClick={() => setRole('admin')}
                >
                  <span>🛡️</span>
                  <span>Administrator</span>
                </button>
              </div>
            </div>

            {(role === 'staff' || role === 'admin') && mode === 'register' && (
              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="department-input">Assigned Department</label>
                <select
                  id="department-input"
                  style={styles.input}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled={loading}
                >
                  <option value="Sanitation Oversight">Sanitation & Public Hygiene</option>
                  <option value="Utility Services">Service Delivery & Utilities</option>
                  <option value="Administrative Cell">Administrative & Civil Services</option>
                  <option value="Vigilance Bureau">Vigilance & Anti-Corruption</option>
                  <option value="Public Works Dept">Public Works & Infrastructure</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              style={{
                ...styles.submitBtn,
                ...(loading ? styles.buttonDisabled : {}),
              }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : mode === 'login' ? `Sign In as ${role.toUpperCase()}` : 'Register Account'}
            </button>
          </form>

          {/* Quick Demo Shortcuts */}
          <div style={styles.demoSection}>
            <p style={styles.demoTitle}>⚡ One-Click Demo Access</p>
            <div style={styles.demoBtnGroup}>
              <button
                type="button"
                style={styles.demoBtn}
                onClick={() => handleDemoLogin('citizen')}
                disabled={loading}
              >
                Login as Citizen
              </button>
              <button
                type="button"
                style={{ ...styles.demoBtn, backgroundColor: '#0f172a' }}
                onClick={() => handleDemoLogin('admin')}
                disabled={loading}
              >
                Login as Admin
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
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    padding: '32px 28px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
    border: '1px solid #334155',
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
    backgroundColor: '#0284c7',
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
  roleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
  },
  roleBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '10px 6px',
    borderRadius: '8px',
    border: '1px solid #334155',
    backgroundColor: '#0f172a',
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  roleBtnActive: {
    borderColor: '#0284c7',
    backgroundColor: '#0369a1',
    color: '#ffffff',
  },
  submitBtn: {
    backgroundColor: '#0284c7',
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
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #334155',
    backgroundColor: '#334155',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default LoginScreen;