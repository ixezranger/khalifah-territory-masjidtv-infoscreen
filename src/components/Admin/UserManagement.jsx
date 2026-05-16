import { useState, useEffect } from 'react';
import GlassCard from '../shared/GlassCard';
import useStore from '../../store/useStore';
import { getAllProfiles, supabase } from '../../lib/supabase';

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
const btnSecondary = {
  background: 'transparent', color: '#C9A84C',
  border: '1px solid rgba(201,168,76,0.4)',
  borderRadius: '8px', padding: '6px 12px', cursor: 'pointer',
  fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '12px',
};
const labelStyle = {
  color: '#C9A84C', fontSize: '13px', display: 'block',
  marginBottom: '6px', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600,
};

const thStyle = {
  color: '#C9A84C', fontSize: '13px', fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontWeight: 600, padding: '10px 12px', textAlign: 'left',
  borderBottom: '1px solid rgba(201,168,76,0.3)',
};
const tdStyle = {
  color: '#F5EDD6', fontSize: '13px', fontFamily: "'Plus Jakarta Sans', sans-serif",
  padding: '10px 12px', borderBottom: '1px solid rgba(201,168,76,0.08)',
  verticalAlign: 'middle',
};

function RoleBadge({ role }) {
  const isAdmin = role === 'admin';
  return (
    <span style={{
      background: isAdmin ? 'rgba(201,168,76,0.2)' : 'rgba(13,79,79,0.4)',
      color: isAdmin ? '#C9A84C' : '#5eead4',
      borderRadius: '4px', padding: '2px 8px', fontSize: '11px',
      fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600,
    }}>
      {role || 'user'}
    </span>
  );
}

function StatusBadge({ isActive }) {
  return (
    <span style={{
      background: isActive ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.15)',
      color: isActive ? '#4ade80' : '#f87171',
      borderRadius: '4px', padding: '2px 8px', fontSize: '11px',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {isActive ? 'Aktif' : 'Tidak Aktif'}
    </span>
  );
}

export default function UserManagement() {
  const { user } = useStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('user');
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    const { data } = await getAllProfiles();
    if (data) setUsers(data);
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const handleToggleActive = async (u) => {
    await supabase.from('profiles')
      .update({ is_active: !u.is_active })
      .eq('id', u.id);
    await loadUsers();
  };

  const handleToggleRole = async (u) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    await supabase.from('profiles')
      .update({ role: newRole })
      .eq('id', u.id);
    await loadUsers();
  };

  const handleCreateUser = async () => {
    setCreating(true);
    setCreateMsg('');
    // Note: supabase.auth.admin.createUser() requires the service_role key,
    // which cannot be used from a browser client. This feature requires
    // a server-side endpoint or Supabase Edge Function.
    setCreateMsg('Untuk mencipta pengguna baharu, sila gunakan Supabase Dashboard atau Edge Function dengan service_role key.');
    setCreating(false);
  };

  return (
    <div>
      {/* Users Table */}
      <GlassCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontFamily: "'Cinzel Decorative', serif", color: '#C9A84C', fontSize: '1rem', margin: 0 }}>
            Senarai Pengguna ({users.length})
          </h3>
          <button onClick={loadUsers} style={btnSecondary}>
            🔄 Muat Semula
          </button>
        </div>

        {loading ? (
          <p style={{ color: 'rgba(245,237,214,0.5)', fontSize: '14px', fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: 'center', padding: '24px 0' }}>
            Memuatkan...
          </p>
        ) : users.length === 0 ? (
          <p style={{ color: 'rgba(245,237,214,0.5)', fontSize: '14px', fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: 'center', padding: '24px 0' }}>
            Tiada pengguna dijumpai
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Nama</th>
                  <th style={thStyle}>E-mel</th>
                  <th style={thStyle}>Peranan</th>
                  <th style={thStyle}>Masjid</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={tdStyle}>{u.full_name || u.display_name || '—'}</td>
                    <td style={tdStyle}>{u.email || '—'}</td>
                    <td style={tdStyle}><RoleBadge role={u.role} /></td>
                    <td style={tdStyle} title={u.masjid_name}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', maxWidth: '120px' }}>
                        {u.masjid_name || '—'}
                      </span>
                    </td>
                    <td style={tdStyle}><StatusBadge isActive={u.is_active !== false} /></td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {u.id !== user?.id && (
                          <>
                            <button onClick={() => handleToggleActive(u)} style={btnSecondary}>
                              {u.is_active !== false ? 'Nyahaktif' : 'Aktifkan'}
                            </button>
                            <button onClick={() => handleToggleRole(u)} style={btnSecondary}>
                              {u.role === 'admin' ? '→ User' : '→ Admin'}
                            </button>
                          </>
                        )}
                        {u.id === user?.id && (
                          <span style={{ color: 'rgba(245,237,214,0.35)', fontSize: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            (Anda)
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Create User */}
      <GlassCard style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showCreate ? '16px' : 0 }}>
          <h3 style={{ fontFamily: "'Cinzel Decorative', serif", color: '#C9A84C', fontSize: '1rem', margin: 0 }}>
            Cipta Akaun Baharu
          </h3>
          <button onClick={() => setShowCreate(!showCreate)} style={btnSecondary}>
            {showCreate ? '▲ Sembunyikan' : '▼ Tunjukkan'}
          </button>
        </div>

        {showCreate && (
          <div>
            <div style={{ padding: '12px 16px', marginBottom: '16px', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '8px' }}>
              <p style={{ color: 'rgba(245,237,214,0.7)', fontSize: '13px', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0 }}>
                ⚠️ Nota: Mencipta pengguna memerlukan <code style={{ color: '#C9A84C' }}>service_role</code> key Supabase yang tidak boleh digunakan dari browser. Sila gunakan Supabase Dashboard atau Edge Function.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={labelStyle}>E-mel</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="pengguna@email.com" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Kata Laluan</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Nama Penuh</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nama penuh" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Peranan</label>
                <select value={role} onChange={e => setRole(e.target.value)} style={inputStyle}>
                  <option value="user">Pengguna</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {createMsg && (
              <div style={{ color: 'rgba(245,237,214,0.7)', fontSize: '13px', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: '12px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                {createMsg}
              </div>
            )}

            <button onClick={handleCreateUser} disabled={creating} style={{ ...btnPrimary, opacity: creating ? 0.7 : 1 }}>
              {creating ? 'Mencipta...' : 'Cipta Akaun'}
            </button>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
