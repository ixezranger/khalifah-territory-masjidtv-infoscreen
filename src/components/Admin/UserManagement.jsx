import { useState, useEffect } from 'react';
import { Users, RefreshCw, ChevronDown, ChevronUp, ShieldCheck, UserX, UserCheck, Shield } from 'lucide-react';
import { Card, Btn, Badge, Alert, Empty, Row, C } from './ui';
import useStore from '../../store/useStore';
import { getAllProfiles, supabase } from '../../lib/supabase';

function Avatar({ name, size = 36 }) {
  const letter = (name || 'A')[0].toUpperCase();
  const colors = ['#1174ff','#7547ff','#0ea5e9','#10b981','#f59e0b','#ef4444'];
  const bg = colors[letter.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: size/3, flexShrink: 0,
      background: `linear-gradient(135deg,${bg},${bg}aa)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontWeight: 700, fontSize: size * 0.38,
      boxShadow: `0 2px 8px ${bg}44`,
    }}>{letter}</div>
  );
}

export default function UserManagement() {
  const { user } = useStore();
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [email,      setEmail]      = useState('');
  const [pass,       setPass]       = useState('');
  const [fullName,   setFullName]   = useState('');
  const [role,       setRole]       = useState('user');
  const [creating,   setCreating]   = useState(false);
  const [msg,        setMsg]        = useState('');
  const [msgType,    setMsgType]    = useState('info');

  const flash = (text, type = 'success') => { setMsg(text); setMsgType(type); setTimeout(() => setMsg(''), 3000); };

  const loadUsers = async () => {
    setLoading(true);
    const { data } = await getAllProfiles();
    if (data) setUsers(data);
    setLoading(false);
  };
  useEffect(() => { loadUsers(); }, []);

  const handleToggleActive = async u => {
    await supabase.from('profiles').update({ is_active: !u.is_active }).eq('id', u.id);
    await loadUsers();
    flash(`${u.full_name || 'Pengguna'} ${!u.is_active ? 'diaktifkan' : 'dinyahaktifkan'}`);
  };

  const handleToggleRole = async u => {
    const nr = u.role === 'admin' ? 'user' : 'admin';
    await supabase.from('profiles').update({ role: nr }).eq('id', u.id);
    await loadUsers();
    flash(`Peranan ${u.full_name || 'pengguna'} ditukar ke ${nr}`);
  };

  const handleCreateUser = () => {
    setCreating(true);
    flash('Untuk mencipta pengguna, gunakan Supabase Dashboard → Authentication → Users.', 'warning');
    setCreating(false);
  };

  return (
    <div style={{ maxWidth: 860 }}>
      {msg && <Alert type={msgType}>{msg}</Alert>}

      {/* Users table */}
      <Card title={`Senarai Pengguna (${users.length})`} icon={Users} accent={C.blue}
        action={
          <Btn variant="ghost" size="sm" onClick={loadUsers}>
            <RefreshCw size={13} />
            Muat Semula
          </Btn>
        }
      >
        {loading ? (
          <Empty icon="⏳" text="Memuatkan..." />
        ) : users.length === 0 ? (
          <Empty icon="👥" text="Tiada pengguna dijumpai" />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {/* Mobile: cards; Desktop: table */}
            <div style={{ display: 'none' }} className="user-cards">
              {users.map(u => (
                <div key={u.id} style={{
                  padding: '14px', marginBottom: 10, borderRadius: 12,
                  background: 'rgba(17,116,255,0.04)', border: `1px solid ${C.line}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <Avatar name={u.full_name || u.email} />
                    <div>
                      <div style={{ fontWeight: 700, color: C.ink, fontSize: '0.875rem' }}>{u.full_name || '—'}</div>
                      <div style={{ fontSize: '0.75rem', color: C.muted }}>{u.email || '—'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Badge color={u.role==='admin' ? C.blue : C.muted}>{u.role||'user'}</Badge>
                    <Badge color={u.is_active!==false ? C.green : C.red}>
                      {u.is_active!==false ? 'Aktif' : 'Tidak Aktif'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.line}` }}>
                  {['Pengguna','Peranan','Masjid','Status','Tindakan'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', fontSize: '0.75rem', fontWeight: 700,
                      color: C.muted, textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: `1px solid ${C.line}` }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(17,116,255,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  >
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={u.full_name || u.email} size={32} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.855rem', color: C.ink }}>{u.full_name||'—'}</div>
                          <div style={{ fontSize: '0.75rem', color: C.faint }}>{u.email||'—'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Badge color={u.role==='admin' ? C.blue : C.muted}>{u.role||'user'}</Badge>
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.82rem', color: C.muted, maxWidth: 130 }}>
                      <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'block' }}>
                        {u.masjid_name||'—'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Badge color={u.is_active!==false ? C.green : C.red}>
                        {u.is_active!==false ? '● Aktif' : '○ Tidak Aktif'}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {u.id === user?.id ? (
                        <span style={{ fontSize: '0.75rem', color: C.faint }}>Anda</span>
                      ) : (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Btn variant="ghost" size="sm" onClick={() => handleToggleActive(u)}>
                            {u.is_active!==false ? <UserX size={12}/> : <UserCheck size={12}/>}
                            {u.is_active!==false ? 'Nyahaktif' : 'Aktif'}
                          </Btn>
                          <Btn variant="secondary" size="sm" onClick={() => handleToggleRole(u)}>
                            {u.role==='admin' ? <Shield size={12}/> : <ShieldCheck size={12}/>}
                            {u.role==='admin' ? '→ User' : '→ Admin'}
                          </Btn>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create user */}
      <Card title="Cipta Akaun Baharu" icon={Users} accent={C.violet}
        action={
          <Btn variant="ghost" size="sm" onClick={() => setShowCreate(v => !v)}>
            {showCreate ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
            {showCreate ? 'Tutup' : 'Tunjuk'}
          </Btn>
        }
      >
        {!showCreate ? (
          <p style={{ color: C.faint, fontSize: '0.82rem' }}>Klik "Tunjuk" untuk mencipta akaun baharu.</p>
        ) : (
          <>
            <Alert type="warning">
              ⚠️ Mencipta pengguna memerlukan <code>service_role</code> key — sila gunakan <strong>Supabase Dashboard → Authentication → Users</strong>.
            </Alert>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 16 }}>
              <div><label style={{ fontSize:'0.78rem', fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:6 }}>E-mel</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="pengguna@email.com" className="ms-input" /></div>
              <div><label style={{ fontSize:'0.78rem', fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:6 }}>Kata Laluan</label>
                <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" className="ms-input" /></div>
              <div><label style={{ fontSize:'0.78rem', fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:6 }}>Nama Penuh</label>
                <input type="text" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Nama penuh" className="ms-input" /></div>
              <div><label style={{ fontSize:'0.78rem', fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:6 }}>Peranan</label>
                <select value={role} onChange={e=>setRole(e.target.value)} className="ms-input">
                  <option value="user">Pengguna</option>
                  <option value="admin">Admin</option>
                </select></div>
            </div>
            <Btn onClick={handleCreateUser} disabled={creating}>{creating ? 'Mencipta...' : 'Cipta Akaun'}</Btn>
          </>
        )}
      </Card>
    </div>
  );
}
