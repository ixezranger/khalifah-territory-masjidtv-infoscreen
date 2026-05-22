import { useState, useEffect } from 'react';
import { Bell, Send, X } from 'lucide-react';
import { Card, Field, Btn, Badge, Alert, Empty, Row, C } from './ui';
import useStore from '../../store/useStore';
import { getActiveBlastNotifications, upsertBlastNotification } from '../../lib/supabase';

export default function BlastNotification() {
  const { user, setBlastNotifications } = useStore();
  const [blasts,    setBlasts]    = useState([]);
  const [title,     setTitle]     = useState('');
  const [message,   setMessage]   = useState('');
  const [target,    setTarget]    = useState('all');
  const [expires,   setExpires]   = useState('');
  const [sending,   setSending]   = useState(false);
  const [sent,      setSent]      = useState(false);
  const [error,     setError]     = useState('');

  const load = async () => {
    const { data } = await getActiveBlastNotifications();
    if (data) { setBlasts(data); setBlastNotifications(data); }
  };
  useEffect(() => { load(); }, []); // eslint-disable-line

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) { setError('Tajuk dan mesej diperlukan.'); return; }
    setSending(true); setError('');
    const { data, error: e } = await upsertBlastNotification({
      title: title.trim(), message: message.trim(), target,
      expires_at: expires || null, created_by: user?.id, is_active: true,
    });
    if (e) setError(e.message || 'Gagal menghantar.');
    else if (data) { setTitle(''); setMessage(''); setTarget('all'); setExpires(''); setSent(true); setTimeout(()=>setSent(false),3000); await load(); }
    setSending(false);
  };

  const handleDeactivate = async blast => { await upsertBlastNotification({ ...blast, is_active: false }); await load(); };

  const fmt = d => d ? new Date(d).toLocaleString('ms-MY',{ day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit' }) : 'Tiada had';

  return (
    <div style={{ maxWidth: 680 }}>

      {/* Compose */}
      <Card title="Hantar Pemberitahuan Baharu" icon={Bell} accent={C.purple}>
        {error && <Alert type="error">{error}</Alert>}
        {sent  && <Alert type="success">✓ Pemberitahuan berjaya dihantar</Alert>}

        <Field label="Tajuk" required>
          <input type="text" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Tajuk pemberitahuan" className="ms-input" />
        </Field>

        <Field label="Mesej" required>
          <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Kandungan pemberitahuan..." rows={3}
            className="ms-input" style={{ resize:'vertical', width:'100%' }} />
        </Field>

        <Field label="Sasaran">
          <div style={{ display:'flex', gap:16 }}>
            {[['all','Semua Pengguna'],['specific','Pengguna Tertentu']].map(([v,l]) => (
              <label key={v} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:'0.875rem', color: C.ink, fontWeight: target===v ? 600 : 400 }}>
                <input type="radio" value={v} checked={target===v} onChange={()=>setTarget(v)} style={{ accentColor: C.blue }} />
                {l}
              </label>
            ))}
          </div>
        </Field>

        <Field label="Tamat Tempoh (pilihan)">
          <input type="datetime-local" value={expires} onChange={e=>setExpires(e.target.value)} className="ms-input" style={{ colorScheme:'light' }} />
        </Field>

        <Btn onClick={handleSend} disabled={sending || !title.trim() || !message.trim()} style={{ marginTop: 4 }}>
          <Send size={14} />
          {sending ? 'Menghantar...' : 'Hantar Pemberitahuan'}
        </Btn>
      </Card>

      {/* Active blasts */}
      {blasts.length > 0 && (
        <Card title={`Pemberitahuan Aktif`} icon={Bell} accent={C.red}
          action={<Badge color={C.red}>{blasts.length}</Badge>}
        >
          {blasts.map((b, i) => (
            <Row key={b.id} last={i===blasts.length-1}>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: C.ink, marginBottom: 3 }}>{b.title}</div>
                <div style={{ fontSize: '0.8rem', color: C.muted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom: 4 }}>
                  {b.message?.slice(0, 90)}{b.message?.length > 90 ? '…' : ''}
                </div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  <Badge color={b.target==='all' ? C.cyan : C.amber}>
                    {b.target==='all' ? 'Semua' : 'Tertentu'}
                  </Badge>
                  <span style={{ fontSize:'0.72rem', color: C.faint }}>Tamat: {fmt(b.expires_at)}</span>
                </div>
              </div>
              <Btn variant="danger" size="sm" onClick={() => handleDeactivate(b)}>
                <X size={12} /> Nyahaktif
              </Btn>
            </Row>
          ))}
        </Card>
      )}
    </div>
  );
}
