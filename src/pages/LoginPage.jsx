import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import GlassCard from '../components/shared/GlassCard';
import CrescentIcon from '../components/shared/CrescentIcon';
import LoadingSpinner from '../components/shared/LoadingSpinner';

const ARABESQUE = `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C9A84C' fill-opacity='0.04'%3E%3Cpath d='M20 0l4 8h8l-6 6 2 9-8-5-8 5 2-9-6-6h8z'/%3E%3C/g%3E%3C/svg%3E")`;

const inputBase = {
  width: '100%',
  padding: '12px 16px',
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(201,168,76,0.3)',
  borderRadius: '8px',
  color: '#F5EDD6',
  fontSize: '0.9rem',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  outline: 'none',
  boxSizing: 'border-box',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);

  const focusStyle = {
    border: '1px solid rgba(201,168,76,0.8)',
    boxShadow: '0 0 0 2px rgba(201,168,76,0.2)',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
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
      background: 'var(--color-navy)',
      backgroundImage: ARABESQUE,
      backgroundRepeat: 'repeat',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      gap: '24px',
    }}>
      {/* Logo + Title */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <CrescentIcon size={48} color="#C9A84C" animated />
        <h1 style={{
          fontFamily: "'Cinzel Decorative', serif",
          color: '#C9A84C',
          fontSize: '2.5rem',
          margin: 0,
          letterSpacing: '0.06em',
        }}>
          MasjidTV
        </h1>
        <p style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          color: '#F5EDD6',
          fontSize: '0.9rem',
          margin: 0,
          opacity: 0.7,
        }}>
          Sistem InfoTV Islamik
        </p>
      </div>

      {/* Login form */}
      <GlassCard style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Email */}
          <div>
            <label style={{ display: 'block', color: '#C9A84C', fontSize: '0.8rem', marginBottom: '6px', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '0.05em' }}>
              E-MEL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
              required
              autoComplete="email"
              placeholder="nama@contoh.com"
              style={{ ...inputBase, ...(emailFocus ? focusStyle : {}) }}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', color: '#C9A84C', fontSize: '0.8rem', marginBottom: '6px', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '0.05em' }}>
              KATA LALUAN
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPassFocus(true)}
                onBlur={() => setPassFocus(false)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                style={{ ...inputBase, paddingRight: '44px', ...(passFocus ? focusStyle : {}) }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(245,237,214,0.5)', fontSize: '16px', padding: '4px',
                }}
                title={showPassword ? 'Sembunyikan' : 'Tunjukkan'}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p style={{
              color: '#f87171',
              fontSize: '0.85rem',
              margin: 0,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              padding: '8px 12px',
              background: 'rgba(248,113,113,0.1)',
              borderRadius: '6px',
              border: '1px solid rgba(248,113,113,0.3)',
            }}>
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? 'rgba(201,168,76,0.5)' : '#C9A84C',
              color: '#050E1A',
              border: 'none',
              borderRadius: '8px',
              height: '48px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: '0.95rem',
              letterSpacing: '0.08em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background 0.2s',
            }}
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Log Masuk'}
          </button>
        </form>
      </GlassCard>

      {/* Back link */}
      <Link
        to="/"
        style={{
          color: '#C9A84C',
          fontSize: '0.85rem',
          textDecoration: 'none',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          opacity: 0.8,
        }}
      >
        ← Kembali ke InfoTV
      </Link>
    </div>
  );
}
