import { useState, useEffect, useRef } from 'react';
import GlassCard from '../shared/GlassCard';
import useStore from '../../store/useStore';
import {
  getTickerMessages, upsertTickerMessage, deleteTickerMessage,
  updateFeatureSettings,
} from '../../lib/supabase';

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
};

export default function TickerManager() {
  const { user, featureSettings, setFeatureSettings, tickerMessages, setTickerMessages } = useStore();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [tickerSpeed, setTickerSpeed] = useState(featureSettings?.ticker_speed || 50);
  const [savingSpeed, setSavingSpeed] = useState(false);
  const dragIndex = useRef(null);

  const loadMessages = async () => {
    if (!user?.id) return;
    const { data } = await getTickerMessages(user.id);
    if (data) {
      setMessages(data);
      setTickerMessages(data);
    }
  };

  useEffect(() => { loadMessages(); }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setTickerSpeed(featureSettings?.ticker_speed || 50);
  }, [featureSettings?.ticker_speed]);

  const handleAdd = async () => {
    if (!user?.id || !newMessage.trim()) return;
    const { data } = await upsertTickerMessage({
      message: newMessage.trim(),
      user_id: user.id,
      display_order: messages.length,
      is_active: true,
    });
    if (data) {
      setNewMessage('');
      await loadMessages();
    }
  };

  const handleDelete = async (id) => {
    await deleteTickerMessage(id);
    await loadMessages();
  };

  const handleToggleActive = async (msg) => {
    await upsertTickerMessage({ ...msg, is_active: !msg.is_active });
    await loadMessages();
  };

  const handleReorder = async (dropIndex) => {
    if (dragIndex.current === null || dragIndex.current === dropIndex) return;
    const reordered = [...messages];
    const [moved] = reordered.splice(dragIndex.current, 1);
    reordered.splice(dropIndex, 0, moved);
    setMessages(reordered);
    for (let i = 0; i < reordered.length; i++) {
      if (reordered[i].display_order !== i) {
        await upsertTickerMessage({ ...reordered[i], display_order: i });
      }
    }
    dragIndex.current = null;
    await loadMessages();
  };

  const handleSaveSpeed = async () => {
    if (!user?.id) return;
    setSavingSpeed(true);
    const { data } = await updateFeatureSettings(user.id, { ticker_speed: tickerSpeed });
    if (data) setFeatureSettings(data);
    setSavingSpeed(false);
  };

  return (
    <div>
      {/* Add form */}
      <GlassCard>
        <h3 style={{ fontFamily: "'Cinzel Decorative', serif", color: '#C9A84C', fontSize: '1rem', margin: '0 0 16px 0' }}>
          Tambah Mesej Ticker
        </h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Masukkan mesej ticker..."
            style={{ ...inputStyle, flex: 1 }}
          />
          <button onClick={handleAdd} disabled={!newMessage.trim()} style={{ ...btnPrimary, opacity: !newMessage.trim() ? 0.6 : 1, whiteSpace: 'nowrap' }}>
            + Tambah
          </button>
        </div>
      </GlassCard>

      {/* Messages list */}
      <GlassCard style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <h3 style={{ fontFamily: "'Cinzel Decorative', serif", color: '#C9A84C', fontSize: '1rem', margin: 0 }}>
            Mesej Ticker
          </h3>
          <span style={{
            background: 'rgba(201,168,76,0.15)', color: '#C9A84C',
            borderRadius: '12px', padding: '2px 10px', fontSize: '12px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            {messages.length}
          </span>
        </div>

        {messages.length === 0 && (
          <p style={{ color: 'rgba(245,237,214,0.5)', fontSize: '14px', fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: 'center', padding: '24px 0' }}>
            Tiada mesej lagi
          </p>
        )}

        {messages.map((msg, i) => (
          <div
            key={msg.id}
            draggable
            onDragStart={() => { dragIndex.current = i; }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleReorder(i)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 0',
              borderBottom: i < messages.length - 1 ? '1px solid rgba(201,168,76,0.1)' : 'none',
              cursor: 'grab',
            }}
          >
            <span style={{ color: 'rgba(245,237,214,0.3)', fontSize: '16px', cursor: 'grab', userSelect: 'none', flexShrink: 0 }}>⋮⋮</span>

            <span style={{
              flex: 1, color: '#F5EDD6', fontSize: '14px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {msg.message}
            </span>

            {/* Active toggle */}
            <div
              onClick={() => handleToggleActive(msg)}
              style={{
                width: '36px', height: '20px', borderRadius: '10px', cursor: 'pointer',
                background: msg.is_active ? '#C9A84C' : 'rgba(255,255,255,0.15)',
                position: 'relative', transition: 'background 0.2s', flexShrink: 0,
              }}
            >
              <div style={{
                position: 'absolute', top: '3px',
                left: msg.is_active ? '19px' : '3px',
                width: '14px', height: '14px', borderRadius: '7px',
                background: msg.is_active ? '#050E1A' : '#F5EDD6',
                transition: 'left 0.2s',
              }} />
            </div>

            <button
              onClick={() => handleDelete(msg.id)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.7)', fontSize: '16px', padding: '4px', flexShrink: 0 }}
            >
              🗑
            </button>
          </div>
        ))}
      </GlassCard>

      {/* Speed setting */}
      <GlassCard style={{ marginTop: '16px' }}>
        <h3 style={{ fontFamily: "'Cinzel Decorative', serif", color: '#C9A84C', fontSize: '1rem', margin: '0 0 16px 0' }}>
          Kelajuan Ticker
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <input
            type="range"
            min={1}
            max={100}
            value={tickerSpeed}
            onChange={e => setTickerSpeed(Number(e.target.value))}
            style={{ flex: 1, accentColor: '#C9A84C' }}
          />
          <span style={{ color: '#C9A84C', fontSize: '14px', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, minWidth: '40px' }}>
            {tickerSpeed}
          </span>
        </div>
        <button onClick={handleSaveSpeed} disabled={savingSpeed} style={{ ...btnPrimary, opacity: savingSpeed ? 0.7 : 1 }}>
          {savingSpeed ? 'Menyimpan...' : 'Simpan Kelajuan'}
        </button>
      </GlassCard>
    </div>
  );
}
