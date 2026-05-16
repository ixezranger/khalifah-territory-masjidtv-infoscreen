import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase, isDemoMode } from '../lib/supabase';
import GlassCard from '../components/shared/GlassCard';
import CrescentIcon from '../components/shared/CrescentIcon';
import LoadingSpinner from '../components/shared/LoadingSpinner';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isDemoMode) {
        setError('Demo Mode: Supabase belum dikonfigurasi. Sila setup .env untuk log masuk.');
        setLoading(false);
        return;
      }
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(authError.message || 'Log masuk gagal. Sila semak e-mel dan kata laluan.');
      } else {
        navigate('/admin');
      }
    } catch {
      setError('Ralat tidak dijangka. Sila cuba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
      backgroundSize: '32px 32px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      gap: 24,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <CrescentIcon size={48} color="var(--ms-blue)" animated />
        <h1 style={{
          fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)',
          margin: 0, letterSpacing: '-0.02em',
        }}>
          MasjidTV
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
          Sistem InfoTV Islamik
        </p>
      </div>

      {/* Login card */}
      <GlassCard style={{ width: '100%', maxWidth: 400 }} padding="40px">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{
              display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 600,
              color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              E-Mel
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="nama@contoh.com"
              className="ms-input"
            />
          </div>

          <div>
            <label style={{
              display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 600,
              color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              Kata Laluan
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="ms-input"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', fontSize: 16, padding: 4,
                }}
                title={showPassword ? 'Sembunyikan' : 'Tunjukkan'}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              color: 'var(--ms-red)', fontSize: '0.85rem',
              padding: '8px 12px', background: 'rgba(209,52,56,0.1)',
              borderRadius: 'var(--radius-sm)', border: '1px solid rgba(209,52,56,0.3)',
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="ms-btn" style={{
            height: 48, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {loading ? <LoadingSpinner size="sm" /> : 'Log Masuk'}
          </button>
        </form>
      </GlassCard>

      <Link to="/" style={{
        color: 'var(--ms-blue)', fontSize: '0.85rem', textDecoration: 'none',
      }}>
        ← Kembali ke InfoTV
      </Link>
    </div>
  );
}
