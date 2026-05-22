import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Plus, Gauge } from 'lucide-react';
import { Card, Btn, Alert, Empty, Row, DragHandle, Badge, C } from './ui';
import useStore from '../../store/useStore';
import { getTickerMessages, upsertTickerMessage, deleteTickerMessage, updateFeatureSettings } from '../../lib/supabase';

export default function TickerManager() {
  const { user, featureSettings, setFeatureSettings, setTickerMessages } = useStore();
  const [messages,     setMessages]     = useState([]);
  const [newMessage,   setNewMessage]   = useState('');
  const [tickerSpeed,  setTickerSpeed]  = useState(featureSettings?.ticker_speed || 50);
  const [savingSpeed,  setSavingSpeed]  = useState(false);
  const [saved,        setSaved]        = useState(false);
  const dragIndex = useRef(null);

  const load = async () => {
    if (!user?.id) return;
    const { data } = await getTickerMessages(user.id);
    if (data) { setMessages(data); setTickerMessages(data); }
  };
  useEffect(() => { load(); }, [user?.id]); // eslint-disable-line
  useEffect(() => { setTickerSpeed(featureSettings?.ticker_speed || 50); }, [featureSettings?.ticker_speed]);

  const handleAdd = async () => {
    if (!user?.id || !newMessage.trim()) return;
    await upsertTickerMessage({ message: newMessage.trim(), user_id: user.id, display_order: messages.length, is_active: true });
    setNewMessage(''); await load();
  };
  const handleDelete = async id => { await deleteTickerMessage(id); await load(); };
  const handleToggle = async msg => { await upsertTickerMessage({ ...msg, is_active: !msg.is_active }); await load(); };
  const handleReorder = async drop => {
    if (dragIndex.current === null || dragIndex.current === drop) return;
    const arr = [...messages]; const [m] = arr.splice(dragIndex.current, 1); arr.splice(drop, 0, m);
    setMessages(arr);
    for (let i = 0; i < arr.length; i++) if (arr[i].display_order !== i) await upsertTickerMessage({ ...arr[i], display_order: i });
    dragIndex.current = null; await load();
  };
  const handleSaveSpeed = async () => {
    if (!user?.id) return;
    setSavingSpeed(true);
    const { data } = await updateFeatureSettings(user.id, { ticker_speed: tickerSpeed });
    if (data) { setFeatureSettings(data); setSaved(true); setTimeout(() => setSaved(false), 2000); }
    setSavingSpeed(false);
  };

  return (
    <div style={{ maxWidth: 680 }}>

      {/* Add message */}
      <Card title="Tambah Mesej Ticker" icon={MessageSquare} accent={C.amber}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key==='Enter' && handleAdd()}
            placeholder="Masukkan mesej ticker..." className="ms-input"
            style={{ flex: 1 }}
          />
          <Btn onClick={handleAdd} disabled={!newMessage.trim()}>
            <Plus size={14} /> Tambah
          </Btn>
        </div>
      </Card>

      {/* Messages list */}
      <Card title={`Mesej Ticker`} icon={MessageSquare} accent={C.blue}
        action={<Badge color={C.blue}>{messages.length}</Badge>}
      >
        {messages.length === 0 ? (
          <Empty icon="📢" text="Tiada mesej lagi" sub="Tambah mesej pertama anda di atas" />
        ) : messages.map((msg, i) => (
          <Row key={msg.id} last={i === messages.length-1}
            draggable onDragStart={() => { dragIndex.current = i; }}
            onDragOver={e => e.preventDefault()} onDrop={() => handleReorder(i)}
          >
            <DragHandle />
            <span style={{ flex: 1, fontSize: '0.875rem', color: C.ink, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {msg.message}
            </span>
            <Badge color={msg.is_active ? C.green : C.faint}>
              {msg.is_active ? 'Aktif' : 'Sembunyi'}
            </Badge>
            <Btn variant="ghost" size="sm" onClick={() => handleToggle(msg)}>
              {msg.is_active ? 'Sembunyi' : 'Aktif'}
            </Btn>
            <Btn variant="danger" size="sm" onClick={() => handleDelete(msg.id)}>✕</Btn>
          </Row>
        ))}
      </Card>

      {/* Speed */}
      <Card title="Kelajuan Ticker" icon={Gauge} accent={C.cyan}>
        {saved && <Alert type="success">✓ Kelajuan disimpan</Alert>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <input type="range" min={1} max={100} value={tickerSpeed}
            onChange={e => setTickerSpeed(Number(e.target.value))}
            style={{ flex: 1, accentColor: C.blue }}
          />
          <span style={{ minWidth: 40, fontWeight: 700, color: C.blue, textAlign: 'right' }}>{tickerSpeed}</span>
        </div>
        <Btn onClick={handleSaveSpeed} disabled={savingSpeed} size="sm">
          {savingSpeed ? 'Menyimpan...' : 'Simpan Kelajuan'}
        </Btn>
      </Card>
    </div>
  );
}
