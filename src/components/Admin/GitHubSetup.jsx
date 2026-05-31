import { useState } from 'react';
import { Key, CheckCircle, AlertCircle, ExternalLink, Trash2 } from 'lucide-react';import { Card, Btn, Alert, C } from './ui';
import { getPat, setPat, clearPat, hasPat, fetchXmlFile } from '../../lib/githubXml';

export default function GitHubSetup() {
  const [token,   setToken]   = useState(getPat());
  const [status,  setStatus]  = useState(hasPat() ? 'saved' : 'idle');
  const [testing, setTesting] = useState(false);
  const [msg,     setMsg]     = useState('');

  // On first visit, show instructions to enter token
  // Admin goes to Tetapan GitHub → enters PAT → clicks Uji & Simpan

  const handleSave = async () => {
    if (!token.trim()) return;
    setPat(token.trim());
    setTesting(true); setMsg('');
    try {
      await fetchXmlFile();
      setStatus('ok');
      setMsg('✓ Token sah — config.xml berjaya dibaca');
    } catch (e) {
      setStatus('error');
      setMsg(`✗ ${e.message}`);
    }
    setTesting(false);
  };

  const handleClear = () => {
    clearPat(); setToken(''); setStatus('idle'); setMsg('');
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <Card title="GitHub Personal Access Token" icon={Key} accent={C.blue}>

        {/* Status banner */}
        {status === 'ok'    && <Alert type="success">Token aktif — CMS boleh menyimpan ke config.xml</Alert>}
        {status === 'error' && <Alert type="error">{msg}</Alert>}
        {status === 'saved' && !msg && <Alert type="info">Token tersimpan. Klik "Uji & Simpan" untuk mengesahkan.</Alert>}

        <p style={{ fontSize:'0.85rem', color: C.muted, marginBottom:16, lineHeight:1.6 }}>
          Token ini membenarkan CMS menyimpan data terus ke fail <code>config.xml</code> dalam repositori GitHub.
          Perubahan akan aktif dalam <strong>~30 saat</strong> selepas disimpan.
        </p>

        {/* How to get token */}
        <div style={{
          padding:'12px 14px', borderRadius:12, marginBottom:18,
          background:`${C.blue}08`, border:`1px solid ${C.blue}20`,
          fontSize:'0.82rem', color: C.sub, lineHeight:1.7,
        }}>
          <strong style={{ color: C.blue, display:'block', marginBottom:4 }}>Cara dapatkan token:</strong>
          1. Pergi ke <a href="https://github.com/settings/tokens/new" target="_blank" rel="noreferrer"
               style={{ color: C.blue, fontWeight:600 }}>
               github.com/settings/tokens/new <ExternalLink size={11} style={{verticalAlign:'middle'}}/>
             </a><br/>
          2. Nota: <em>MasjidTV CMS</em><br/>
          3. Expiration: pilih <strong>No expiration</strong> (atau 1 year)<br/>
          4. Scopes: tick <strong>repo</strong> (full control)<br/>
          5. Klik <strong>Generate token</strong> → salin token → tampal di bawah
        </div>

        {/* Token input */}
        <div style={{ display:'flex', gap:8, marginBottom:12 }}>
          <input
            type="password"
            value={token}
            onChange={e => setToken(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            className="ms-input"
            style={{ flex:1, fontFamily:'monospace', fontSize:'0.85rem' }}
          />
          <Btn onClick={handleSave} disabled={testing || !token.trim()} size="md">
            {testing ? 'Menguji...' : 'Uji & Simpan'}
          </Btn>
          {hasPat() && (
            <Btn variant="danger" size="md" onClick={handleClear}>
              <Trash2 size={13}/>
            </Btn>
          )}
        </div>

        {msg && status !== 'error' && (
          <p style={{ fontSize:'0.82rem', color: C.green, display:'flex', alignItems:'center', gap:6 }}>
            <CheckCircle size={14}/> {msg}
          </p>
        )}

        <p style={{ fontSize:'0.75rem', color: C.faint, marginTop:12, lineHeight:1.5 }}>
          🔒 Token disimpan dalam <code>localStorage</code> pelayar anda sahaja — tidak dihantar ke mana-mana pelayan selain GitHub.
        </p>
      </Card>

      {/* Status panel */}
      <Card title="Maklumat Repositori" icon={Key} accent={C.muted}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, fontSize:'0.82rem' }}>
          {[
            ['Repositori',   'ixezranger / khalifah-territory-masjidtv-infoscreen'],
            ['Cawangan',     'main'],
            ['Fail Config',  'public/config.xml'],
            ['Deploy',       'GitHub Actions (~30s selepas commit)'],
          ].map(([k,v]) => (
            <div key={k} style={{ padding:'10px 12px', borderRadius:10, background:`${C.blue}06`, border:`1px solid ${C.line}` }}>
              <div style={{ fontSize:'0.72rem', fontWeight:700, color: C.faint, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3 }}>{k}</div>
              <div style={{ color: C.ink, fontWeight:500, wordBreak:'break-all' }}>{v}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
