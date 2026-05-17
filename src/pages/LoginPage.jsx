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
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      gap: 24,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <CrescentIcon size={52} color="#1174ff" animated />
        <h1 style={{
          fontSize: '2rem', fontWeight: 800, color: '#071942',
          margin: 0, letterSpacing: '-0.03em',
        }}>
          MasjidTV
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#3f568d', margin: 0 }}>
          Sistem InfoTV Islamik
        </p>
      </div>

      {/* Login card */}
      <div style={{
        width: '100%', maxWidth: 400,
        background: 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(26px)',
        WebkitBackdropFilter: 'blur(26px)',
        border: '1px solid rgba(255,255,255,0.7)',
        borderRadius: 32,
        boxShadow: '0 24px 80px rgba(18,40,91,.20)',
        padding: 40,
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{
              display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 600,
              color: '#3f568d', textTransform: 'uppercase', letterSpacing: '0.05em',
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
              color: '#3f568d', textTransform: 'uppercase', letterSpacing: '0.05em',
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
                  color: '#3f568d', fontSize: 16, padding: 4,
                }}
                title={showPassword ? 'Sembunyikan' : 'Tunjukkan'}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              color: '#DC2626', fontSize: '0.85rem',
              padding: '8px 12px', background: 'rgba(220,38,38,0.08)',
              borderRadius: 10, border: '1px solid rgba(220,38,38,0.2)',
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', height: 48,
            background: 'linear-gradient(135deg,#1174ff,#7547ff)',
            color: 'white', border: 'none', borderRadius: 16,
            fontSize: '0.875rem', fontWeight: 700, fontFamily: 'inherit',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {loading ? <LoadingSpinner size="sm" /> : 'Log Masuk'}
          </button>
        </form>
      </div>

      <Link to="/" style={{ color: '#1174ff', fontSize: '0.85rem', textDecoration: 'none' }}>
        ← Kembali ke InfoTV
      </Link>
    </div>
  );
}
