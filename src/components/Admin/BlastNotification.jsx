import { useState, useEffect } from 'react';
import GlassCard from '../shared/GlassCard';
import useStore from '../../store/useStore';
import { getActiveBlastNotifications, upsertBlastNotification } from '../../lib/supabase';

const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: '8px',
  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(201,168,76,0.3)',
  color: '#F5EDD6', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '14px',
  outline: 'none', boxSizing: 'border-box',
};
const btnPrimary = {
  background: '#C9A84C', color: '#050E1A', border: 'none',
  borderRadius: '8px', padding: '10px 20px', cursor: 'pointer',
  fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: '14px',
  width: '100%',
};
const btnSecondary = {
  background: 'transparent', color: '#C9A84C',
  border: '1px solid rgba(201,168,76,0.4)',
  borderRadius: '8px', padding: '6px 14px', cursor: 'pointer',
  fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '13px',
};
const labelStyle = {
  color: '#C9A84C', fontSize: '13px', display: 'block',
  marginBottom: '6px', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600,
};

export default function BlastNotification() {
  const { user, blastNotifications, setBlastNotifications } = useStore();
  const [blasts, setBlasts] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');
  const [expiresAt, setExpiresAt] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const loadBlasts = async () => {
    const { data } = await getActiveBlastNotifications();
    if (data) {
      setBlasts(data);
      setBlastNotifications(data);
    }
  };

  useEffect(() => { loadBlasts(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = async () => {
    if (!user?.id || !title.trim() || !message.trim()) {
      setError('Tajuk dan mesej diperlukan.');
      return;
    }
    setSending(true);
    setError('');
    const { data, error: sendErr } = await upsertBlastNotification({
      title: title.trim(),
      message: message.trim(),
      target,
      expires_at: expiresAt || null,
      created_by: user.id,
      is_active: true,
    });
    if (sendErr) {
      setError(sendErr.message || 'Gagal menghantar pemberitahuan.');
    } else if (data) {
      setTitle('');
      setMessage('');
      setTarget('all');
      setExpiresAt('');
      setSent(true);
      setTimeout(() => setSent(false), 3000);
      await loadBlasts();
    }
    setSending(false);
  };

  const handleDeactivate = async (blast) => {
    await upsertBlastNotification({ ...blast, is_active: false });
    await loadBlasts();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Tiada had';
    return new Date(dateStr).toLocaleString('ms-MY', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div>
      {/* Create form */}
      <GlassCard>
        <h3 style={{ fontFamily: "'Cinzel Decorative', serif", color: '#C9A84C', fontSize: '1rem', margin: '0 0 20px 0' }}>
          Hantar Pemberitahuan Baharu
        </h3>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Tajuk *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Tajuk pemberitahuan"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Mesej *</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Kandungan pemberitahuan..."
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Sasaran</label>
          <div style={{ display: 'flex', gap: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#F5EDD6', fontSize: '14px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              <input
                type="radio"
                value="all"
                checked={target === 'all'}
                onChange={() => setTarget('all')}
                style={{ accentColor: '#C9A84C' }}
              />
              Semua Pengguna
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#F5EDD6', fontSize: '14px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              <input
                type="radio"
                value="specific"
                checked={target === 'specific'}
                onChange={() => setTarget('specific')}
                style={{ accentColor: '#C9A84C' }}
              />
              Pengguna Tertentu
            </label>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Tamat Tempoh (pilihan)</label>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={e => setExpiresAt(e.target.value)}
            style={{ ...inputStyle, colorScheme: 'dark' }}
          />
        </div>

        {error && (
          <div style={{ color: '#f87171', fontSize: '13px', marginBottom: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {error}
          </div>
        )}

        {sent && (
          <div style={{
            marginBottom: '12px', padding: '10px 16px',
            background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
            borderRadius: '8px', color: '#4ade80', fontSize: '13px',
            fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: 'center',
          }}>
            Pemberitahuan dihantar ✓
          </div>
        )}

        <button onClick={handleSend} disabled={sending || !title.trim() || !message.trim()} style={{ ...btnPrimary, opacity: sending || !title.trim() || !message.trim() ? 0.6 : 1 }}>
          {sending ? 'Menghantar...' : '🔔 Hantar Pemberitahuan'}
        </button>
      </GlassCard>

      {/* Active blasts list */}
      {blasts.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontFamily: "'Cinzel Decorative', serif", color: '#C9A84C', fontSize: '1rem', margin: '0 0 16px 0' }}>
            Pemberitahuan Aktif ({blasts.length})
          </h3>
          {blasts.map(blast => (
            <GlassCard key={blast.id} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{
                    color: '#C9A84C', fontWeight: 700, fontSize: '15px',
                    fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: '6px',
                  }}>
                    {blast.title}
                  </div>
                  <div style={{
                    color: '#F5EDD6', fontSize: '13px', fontFamily: "'Plus Jakarta Sans', sans-serif",
                    marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {blast.message?.length > 100 ? blast.message.slice(0, 100) + '...' : blast.message}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{
                      background: blast.target === 'all' ? 'rgba(13,79,79,0.4)' : 'rgba(201,168,76,0.15)',
                      color: blast.target === 'all' ? '#5eead4' : '#C9A84C',
                      borderRadius: '4px', padding: '2px 8px', fontSize: '11px',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}>
                      {blast.target === 'all' ? 'Semua' : 'Tertentu'}
                    </span>
                    <span style={{ color: 'rgba(245,237,214,0.45)', fontSize: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Tamat: {formatDate(blast.expires_at)}
                    </span>
                  </div>
                </div>
                <button onClick={() => handleDeactivate(blast)} style={btnSecondary}>
                  Nyahaktif
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
