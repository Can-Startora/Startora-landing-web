import { useState, useEffect } from 'react';
import { Mail, User, Lock, Sparkles, LogOut, Key, CheckCircle2, AlertCircle, Cpu, Award } from 'lucide-react';
import { API_BASE_URL } from '../config';
import '../styles/ContributorPortal.css';

export default function ContributorPortal() {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [githubHandle, setGithubHandle] = useState('');
  const [password, setPassword] = useState('');
  const [primarySkill, setPrimarySkill] = useState('Developer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);
  const [tokenSimulated, setTokenSimulated] = useState('');

  // Password strength calculation
  const [strength, setStrength] = useState({ score: 0, label: 'None', color: 'rgba(255,255,255,0.06)' });

  useEffect(() => {
    // Load logged-in user if exists
    const storedUser = localStorage.getItem('startora_contributor');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('startora_contributor');
      }
    }
  }, []);

  const handlePasswordChange = (val) => {
    setPassword(val);
    if (!val) {
      setStrength({ score: 0, label: 'None', color: 'rgba(255,255,255,0.06)' });
      return;
    }
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[a-z]/.test(val)) score++;
    if (/\d/.test(val)) score++;
    if (/[@$!%*?&#]/.test(val)) score++;

    if (score <= 1) {
      setStrength({ score: 1, label: 'Weak', color: '#f87171' });
    } else if (score === 2) {
      setStrength({ score: 2, label: 'Fair', color: '#fbbf24' });
    } else if (score === 3) {
      setStrength({ score: 3, label: 'Good', color: '#38bdf8' });
    } else {
      setStrength({ score: 4, label: 'Strong & Secure', color: '#34d399' });
    }
  };

  // Client-side XSS prevention
  const cleanInput = (str) => {
    if (typeof str !== 'string') return '';
    return str.replace(/<[^>]*>/g, '').trim();
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const cleanEmail = cleanInput(email).toLowerCase();
    const cleanGithub = cleanInput(githubHandle);

    // Validate inputs
    if (!cleanEmail) {
      setError('Please provide a valid email address.');
      setLoading(false);
      return;
    }

    if (!isLogin && !cleanGithub) {
      setError('GitHub handle is required for contributors.');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    // Force strong password for registration
    if (!isLogin && strength.score < 4) {
      setError('Password does not meet safety requirements. It must contain uppercase, lowercase, digits, and special characters.');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? '/api/users/login' : '/api/users/register';
      const bodyData = isLogin
        ? { email: cleanEmail, password }
        : { email: cleanEmail, githubHandle: cleanGithub, password, skills: [primarySkill] };

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      if (isLogin) {
        // Logged in
        setUser(data.user);
        localStorage.setItem('startora_contributor', JSON.stringify(data.user));
        setSuccess('Authentication successful! Welcome to the contributor circle.');
        // Reset form
        setEmail('');
        setPassword('');
      } else {
        // Registered successfully, redirect to login
        setSuccess('Contributor account registered successfully! Please log in.');
        setIsLogin(true);
        setPassword('');
        setStrength({ score: 0, label: 'None', color: 'rgba(255,255,255,0.06)' });
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('startora_contributor');
    setTokenSimulated('');
    setSuccess('');
    setError('');
  };

  const simulateTokenGeneration = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = 'st_sandbox_';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTokenSimulated(token);
  };

  return (
    <section id="contribute-portal" className="contribute-portal-section">
      <div className="section-header">
        <div className="portal-badge animate-float">
          <Award className="w-3.5 h-3.5 text-cyan-400" />
          <span>Join the Circle</span>
        </div>
        <h2 className="section-title text-gradient">Want to be a Contributor?</h2>
        <p className="section-description">
          Take part in shaping Startora. Fork our repository, pick up open issues, and register your contributor profile to claim on-chain validation.
        </p>
      </div>

      <div className="portal-grid" style={{ maxWidth: '500px', margin: '0 auto' }}>
        {user ? (
          /* Logged In Dashboard View */
          <div className="portal-card glass animate-scaleUp" style={{ padding: '40px', borderRadius: '24px', textAlign: 'center', position: 'relative' }}>
            <div className="success-icon-wrapper" style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', marginBottom: '20px' }}>
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <h3 style={{ fontSize: '24px', color: '#fff', marginBottom: '8px' }}>Contributor Profile Activated</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', maxWidth: '400px', margin: '0 auto 30px' }}>
              Welcome back, <span style={{ color: 'var(--neon-teal)', fontWeight: '600' }}>{user.githubHandle}</span>! Your profile is connected with the primary track: <span style={{ color: 'var(--neon-violet)', fontWeight: '600' }}>{user.skills?.[0] || 'Developer'}</span>.
            </p>

            <div className="token-generator-box glass" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', maxWidth: '500px', margin: '0 auto 24px', textAlign: 'left' }}>
              <h4 style={{ fontSize: '15px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Cpu className="w-4 h-4 text-cyan-400" /> Sandbox Access Tools
              </h4>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.5', marginBottom: '16px' }}>
                Generate your ephemeral sandbox credential token to hook local command shells or commit feeds directly to the Startora blockchain simulator.
              </p>
              
              {tokenSimulated ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '8px', padding: '10px 14px', alignItems: 'center', justifyContent: 'space-between' }}>
                    <code style={{ fontSize: '11px', color: 'var(--neon-teal)', wordBreak: 'break-all' }}>{tokenSimulated}</code>
                  </div>
                  <span style={{ fontSize: '10px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles className="w-3 h-3" /> Ephemeral token successfully generated for on-chain sandbox validation!
                  </span>
                </div>
              ) : (
                <button onClick={simulateTokenGeneration} className="btn-primary cursor-target" style={{ fontSize: '12px', padding: '8px 16px', width: 'auto' }}>
                  <Key className="w-3.5 h-3.5" /> Generate Sandbox Token
                </button>
              )}
            </div>

            <button onClick={handleLogout} className="btn-secondary cursor-target" style={{ fontSize: '12px', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px', margin: '0 auto' }}>
              <LogOut className="w-3.5 h-3.5" /> Logout profile
            </button>
          </div>
        ) : (
          /* Login/Register Form View */
          <div className="portal-card glass" style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', overflow: 'hidden' }}>
            {/* Tab switchers */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.15)' }}>
              <button 
                type="button"
                onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
                className="cursor-target"
                style={{
                  flex: 1,
                  padding: '16px',
                  background: !isLogin ? 'rgba(255,255,255,0.03)' : 'none',
                  border: 'none',
                  color: !isLogin ? '#fff' : 'rgba(255,255,255,0.4)',
                  fontWeight: '600',
                  fontSize: '14px',
                  borderBottom: !isLogin ? '2px solid var(--neon-teal)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                Create Contributor Account
              </button>
              <button 
                type="button"
                onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
                className="cursor-target"
                style={{
                  flex: 1,
                  padding: '16px',
                  background: isLogin ? 'rgba(255,255,255,0.03)' : 'none',
                  border: 'none',
                  color: isLogin ? '#fff' : 'rgba(255,255,255,0.4)',
                  fontWeight: '600',
                  fontSize: '14px',
                  borderBottom: isLogin ? '2px solid var(--neon-teal)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                Sign In
              </button>
            </div>

            <div style={{ padding: '32px' }}>
              <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Email address */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="portal-email" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: '600', textAlign: 'left' }}>Email Address</label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px 14px', gap: '10px' }}>
                    <Mail className="w-4 h-4 text-cyan-400/50" />
                    <input 
                      id="portal-email"
                      type="email"
                      placeholder="e.g. builder@startora.org"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      style={{ background: 'none', border: 'none', color: '#fff', outline: 'none', fontSize: '13px', width: '100%' }}
                    />
                  </div>
                </div>

                {/* GitHub Handle (Register Only) */}
                {!isLogin && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }} className="animate-fadeIn">
                    <label htmlFor="portal-github" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: '600', textAlign: 'left' }}>GitHub Handle</label>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px 14px', gap: '10px' }}>
                      <User className="w-4 h-4 text-cyan-400/50" />
                      <input 
                        id="portal-github"
                        type="text"
                        placeholder="e.g. Manvikamboz"
                        value={githubHandle}
                        onChange={e => setGithubHandle(e.target.value)}
                        required={!isLogin}
                        style={{ background: 'none', border: 'none', color: '#fff', outline: 'none', fontSize: '13px', width: '100%' }}
                      />
                    </div>
                  </div>
                )}

                {/* Password & Strength Indicator */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="portal-password" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: '600', textAlign: 'left' }}>Password</label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px 14px', gap: '10px' }}>
                    <Lock className="w-4 h-4 text-cyan-400/50" />
                    <input 
                      id="portal-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => handlePasswordChange(e.target.value)}
                      required
                      style={{ background: 'none', border: 'none', color: '#fff', outline: 'none', fontSize: '13px', width: '100%' }}
                    />
                  </div>

                  {/* Password strength meter visual bar */}
                  {!isLogin && password && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {[1, 2, 3, 4].map((i) => (
                          <div 
                            key={i} 
                            style={{ 
                              flex: 1, 
                              height: '4px', 
                              borderRadius: '2px', 
                              background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.08)',
                              transition: 'background 0.3s'
                            }} 
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: '10px', color: strength.color, textAlign: 'left', fontWeight: '500' }}>
                        Security: {strength.label} (Needs 8+ characters, uppercase, lowercase, numbers & symbols)
                      </span>
                    </div>
                  )}
                </div>

                {/* Primary Skill Category (Register Only) */}
                {!isLogin && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }} className="animate-fadeIn">
                    <label htmlFor="portal-skill" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: '600', textAlign: 'left' }}>Primary Track</label>
                    <select
                      id="portal-skill"
                      value={primarySkill}
                      onChange={e => setPrimarySkill(e.target.value)}
                      style={{
                        background: 'rgba(3, 7, 18, 0.7)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        padding: '10px 14px',
                        color: '#fff',
                        fontSize: '13px',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="Developer">Developer (Coding & Systems)</option>
                      <option value="Designer">Designer (Interface & WebGL)</option>
                      <option value="Operator">Operator (Growth & Strategy)</option>
                      <option value="Researcher">Researcher (Academic & AI)</option>
                    </select>
                  </div>
                )}

                {/* Error Banner */}
                {error && (
                  <div style={{ display: 'flex', gap: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '12px', padding: '10px 14px', color: '#f87171', fontSize: '12px', textAlign: 'left' }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Success Banner */}
                {success && (
                  <div style={{ display: 'flex', gap: '8px', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.25)', borderRadius: '12px', padding: '10px 14px', color: '#34d399', fontSize: '12px', textAlign: 'left' }}>
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                {/* Submit button */}
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary cursor-target"
                  style={{ width: '100%', marginTop: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                  {loading ? 'Processing...' : isLogin ? 'Sign In as Contributor' : 'Register Profile'}
                  <Sparkles className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
