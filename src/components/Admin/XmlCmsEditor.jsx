/**
 * XmlCmsEditor.jsx
 * Unified CMS editor that reads/writes config.xml via GitHub API.
 * Covers: Profile, Appearance, Slider, Ticker, Hadith, Features.
 */
import { useState, useEffect } from 'react';
import {
  Building2, Palette, Images, MessageSquare, BookOpen,
  Settings, Plus, Trash2, Save, RefreshCw, GripVertical,
  AlertCircle, CheckCircle, Image, Globe, Sliders,
} from 'lucide-react';
import { Card, Btn, Alert, Toggle, TabBar, Field, C } from './ui';
import { hasPat, fetchXmlFile, saveToXml,
         patchProfile, patchAppearance, patchTicker,
         patchHadith, patchSlider, patchFeatures } from '../../lib/githubXml';
import { ZONES } from '../../hooks/useWaktuSolat';

/* ── Shared save state hook ─────────────────────────────────── */
function useSave() {
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null); // 'ok' | 'error'
  const [msg,    setMsg]    = useState('');

  const run = async (patchFn, commitMsg) => {
    setSaving(true); setResult(null); setMsg('');
    try {
      await saveToXml(patchFn, commitMsg);
      setResult('ok');
      setMsg('✓ Disimpan & deploy sedang berjalan (~30 saat)');
    } catch (e) {
      setResult('error');
      setMsg(e.message || 'Ralat semasa menyimpan');
    } finally {
      setSaving(false);
      setTimeout(() => setResult(null), 5000);
    }
  };

  return { saving, result, msg, run };
}

/* ── SaveBar component ──────────────────────────────────────── */
function SaveBar({ saving, result, msg, onSave, label = 'Simpan' }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', marginTop:4 }}>
      <Btn onClick={onSave} disabled={saving} size="md">
        {saving ? <><RefreshCw size={13} style={{animation:'spin 0.8s linear infinite'}}/> Menyimpan...</>
                : <><Save size={13}/> {label}</>}
      </Btn>
      {result === 'ok'    && <span style={{ fontSize:'0.82rem', color: C.green, display:'flex', alignItems:'center', gap:5 }}><CheckCircle size={13}/> {msg}</span>}
      {result === 'error' && <span style={{ fontSize:'0.82rem', color: C.red,   display:'flex', alignItems:'center', gap:5 }}><AlertCircle  size={13}/> {msg}</span>}
    </div>
  );
}

/* ── Image URL input with preview ──────────────────────────── */
function ImgUrlField({ label, hint, value, onChange }) {
  return (
    <Field label={label} hint={hint}>
      <input type="url" value={value} onChange={e => onChange(e.target.value)}
        placeholder="https://yourdomain.com/image.jpg"
        className="ms-input" style={{ marginBottom: value ? 10 : 0 }} />
      {value && (
        <img src={value} alt="Preview" onError={e => e.target.style.display='none'}
          style={{ width:'100%', maxHeight:90, objectFit:'cover', borderRadius:10,
                   border:`1px solid ${C.line}`, display:'block' }} />
      )}
    </Field>
  );
}

/* ══════════════════════════════════════════════════════════════
   SECTION: PROFILE
   ══════════════════════════════════════════════════════════════ */
function ProfileSection() {
  const { saving, result, msg, run } = useSave();
  const [name,  setName]  = useState('');
  const [desc,  setDesc]  = useState('');
  const [zone,  setZone]  = useState('WLY01');
  const [logo,  setLogo]  = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchXmlFile().then(({ content }) => {
      const p = new DOMParser().parseFromString(content, 'application/xml');
      const g = t => p.querySelector(t)?.textContent.trim() || '';
      setName(g('profile masjid_name'));
      setDesc(g('profile masjid_description'));
      setZone(g('profile zone_code') || 'WLY01');
      setLogo(g('appearance icon_url'));
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  const save = () => run(doc => {
    patchProfile(doc, { masjid_name: name, masjid_description: desc, zone_code: zone });
    patchAppearance(doc, { icon_url: logo });
  }, 'cms: update profil masjid & logo');

  if (!loaded) return <div style={{ color: C.muted, fontSize:'0.85rem' }}>Memuatkan...</div>;

  return (
    <div style={{ maxWidth:640 }}>
      <Card title="Profil Masjid" icon={Building2} accent={C.blue}>
        <Field label="Nama Masjid / Surau" required>
          <input type="text" value={name} onChange={e=>setName(e.target.value)}
            placeholder="cth: Masjid Al-Hidayah" className="ms-input"/>
        </Field>
        <Field label="Keterangan Ringkas">
          <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={3}
            placeholder="Keterangan ringkas tentang masjid..." className="ms-input"
            style={{resize:'vertical', width:'100%'}}/>
        </Field>
        <Field label="Zon Waktu Solat">
          <select value={zone} onChange={e=>setZone(e.target.value)} className="ms-input">
            {Object.entries(ZONES).map(([state, zones]) => (
              <optgroup key={state} label={state}>
                {Object.entries(zones).map(([code, lbl]) => (
                  <option key={code} value={code}>{code} — {lbl}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </Field>
        <ImgUrlField label="URL Logo / Ikon Masjid"
          hint="PNG/SVG latar telus disyorkan · 256×256px · kosongkan untuk ikon lalai 🕌"
          value={logo} onChange={setLogo}/>
        <SaveBar saving={saving} result={result} msg={msg} onSave={save}/>
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SECTION: APPEARANCE
   ══════════════════════════════════════════════════════════════ */
function AppearanceSection() {
  const { saving, result, msg, run } = useSave();
  const [bgUrl,   setBgUrl]   = useState('');
  const [opacity, setOpacity] = useState(40);
  const [loaded,  setLoaded]  = useState(false);

  useEffect(() => {
    fetchXmlFile().then(({ content }) => {
      const p = new DOMParser().parseFromString(content, 'application/xml');
      setBgUrl(p.querySelector('appearance background_image_url')?.textContent.trim() || '');
      setOpacity(Number(p.querySelector('appearance bg_overlay_opacity')?.textContent) || 40);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  const save = () => run(doc => patchAppearance(doc, {
    background_image_url: bgUrl, bg_overlay_opacity: opacity,
  }), 'cms: update latar belakang');

  if (!loaded) return <div style={{ color: C.muted, fontSize:'0.85rem' }}>Memuatkan...</div>;

  return (
    <div style={{ maxWidth:640 }}>
      <Card title="Imej Latar Belakang" icon={Palette} accent={C.violet}>
        <ImgUrlField label="URL Imej Latar" hint="JPG/PNG/WebP · kosongkan untuk gradient lalai"
          value={bgUrl} onChange={setBgUrl}/>
        <Field label={`Kegelapan Overlay: ${opacity}%`}
          hint="Nilai lebih tinggi = lebih gelap, teks lebih mudah dibaca">
          <input type="range" min={0} max={90} value={opacity}
            onChange={e=>setOpacity(Number(e.target.value))}
            style={{ width:'100%', accentColor: C.blue }}/>
          {/* Live swatch */}
          <div style={{
            marginTop:10, height:44, borderRadius:10, overflow:'hidden',
            position:'relative', border:`1px solid ${C.line}`,
            background: bgUrl ? `url(${bgUrl}) center/cover` : 'linear-gradient(135deg,#1a3a6b,#0f1f4a)',
          }}>
            <div style={{
              position:'absolute', inset:0, background:`rgba(0,0,0,${opacity/100})`,
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'white', fontSize:'0.75rem', fontWeight:600,
            }}>Pratonton Overlay</div>
          </div>
        </Field>
        <SaveBar saving={saving} result={result} msg={msg} onSave={save}/>
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SECTION: SLIDER
   ══════════════════════════════════════════════════════════════ */
function SliderSection() {
  const { saving, result, msg, run } = useSave();
  const [items,  setItems]  = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchXmlFile().then(({ content }) => {
      const doc = new DOMParser().parseFromString(content, 'application/xml');
      const parsed = [...doc.querySelectorAll('slider item')].map((el,i) => ({
        id: i, type: el.getAttribute('type')||'image',
        duration: Number(el.getAttribute('duration'))||8,
        title: el.querySelector('title')?.textContent||'',
        url:   el.querySelector('url')?.textContent||'',
        body:  el.querySelector('body')?.textContent||'',
        /* mode: 'image' if url exists, 'text' if no url */
        mode: el.querySelector('url')?.textContent?.trim() ? 'image' : 'text',
      }));
      setItems(parsed.length ? parsed : [{ id:0, type:'image', duration:8, title:'', url:'', body:'', mode:'image' }]);
      setLoaded(true);
    }).catch(() => { setItems([{ id:0, type:'image', duration:8, title:'', url:'', body:'', mode:'image' }]); setLoaded(true); });
  }, []);

  const add  = () => setItems(p => [...p, { id:Date.now(), type:'image', duration:8, title:'', url:'', body:'', mode:'image' }]);
  const del  = id => setItems(p => p.filter(x=>x.id!==id));
  const upd  = (id, k, v) => setItems(p => p.map(x => x.id===id ? {...x,[k]:v} : x));

  /* When switching mode, clear the irrelevant field */
  const setMode = (id, mode) => setItems(p => p.map(x =>
    x.id===id ? { ...x, mode, type: mode==='image' ? 'image' : 'text', url: mode==='text' ? '' : x.url } : x
  ));

  const save = () => run(doc => patchSlider(doc, items.map(x => ({
    type:     x.url?.trim() ? 'image' : 'text',
    duration: x.duration,
    title:    x.title,
    url:      x.url,
    body:     x.body,
  }))), 'cms: update slider');

  if (!loaded) return <div style={{ color: C.muted, fontSize:'0.85rem' }}>Memuatkan...</div>;

  return (
    <div style={{ maxWidth:720 }}>
      <Card title="Slider Tazkirah / Media" icon={Images} accent={C.cyan}
        action={<Btn variant="secondary" size="sm" onClick={add}><Plus size={13}/> Tambah Slaid</Btn>}>

        {items.map((item, i) => (
          <div key={item.id} style={{
            padding:'16px', marginBottom:14, borderRadius:14,
            background:`${C.blue}05`, border:`1px solid ${C.line}`,
          }}>
            {/* Slaid header */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <span style={{ fontSize:'0.75rem', fontWeight:800, color:C.faint }}>SLAID {i+1}</span>
              <div style={{ flex:1 }}/>
              {/* Duration */}
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <input type="number" value={item.duration} min={3} max={60}
                  onChange={e=>upd(item.id,'duration',Number(e.target.value))}
                  className="ms-input" style={{ width:60, padding:'5px 8px', textAlign:'center' }}/>
                <span style={{ fontSize:'0.72rem', color:C.faint }}>saat</span>
              </div>
              <Btn variant="danger" size="sm" onClick={()=>del(item.id)}><Trash2 size={12}/></Btn>
            </div>

            {/* Mode toggle — IMAGE or TEXT */}
            <div style={{
              display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:14,
              background:`${C.blue}07`, borderRadius:10, padding:4,
            }}>
              {[
                { id:'image', label:'🖼️ Imej / Banner', hint:'Guna URL gambar' },
                { id:'text',  label:'✍️ Teks / Tazkirah', hint:'Tulis kandungan' },
              ].map(opt => {
                const active = item.mode === opt.id;
                return (
                  <button key={opt.id} onClick={() => setMode(item.id, opt.id)} style={{
                    padding:'8px 10px', borderRadius:8, border:'none', cursor:'pointer', textAlign:'center',
                    background: active ? 'white' : 'transparent',
                    color: active ? C.blue : C.muted,
                    fontWeight: active ? 700 : 400,
                    fontSize:'0.82rem',
                    boxShadow: active ? `0 2px 8px ${C.blue}20` : 'none',
                    transition:'all 0.15s',
                  }}>
                    <div>{opt.label}</div>
                    <div style={{ fontSize:'0.7rem', opacity:0.7, marginTop:2 }}>{opt.hint}</div>
                  </button>
                );
              })}
            </div>

            {/* Title (always shown) */}
            <Field label="Tajuk Slaid">
              <input type="text" value={item.title} onChange={e=>upd(item.id,'title',e.target.value)}
                placeholder={item.mode==='image' ? 'Nama slaid (untuk rujukan)' : 'Tajuk tazkirah / pesanan'}
                className="ms-input"/>
            </Field>

            {/* IMAGE mode */}
            {item.mode === 'image' && (
              <Field label="URL Imej / Banner" hint="Salin URL terus dari hosting imej anda">
                <input type="url" value={item.url} onChange={e=>upd(item.id,'url',e.target.value)}
                  placeholder="https://yourdomain.com/banner.jpg"
                  className="ms-input" style={{ marginBottom: item.url ? 10 : 0 }}/>
                {item.url && (
                  <div style={{
                    width:'100%', aspectRatio:'16/5', borderRadius:10, overflow:'hidden',
                    border:`1px solid ${C.line}`, background:'#0a0a14',
                  }}>
                    <img src={item.url} alt="" onError={e=>e.target.style.display='none'}
                      style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
                  </div>
                )}
              </Field>
            )}

            {/* TEXT mode */}
            {item.mode === 'text' && (
              <Field label="Kandungan Tazkirah / Pesanan" hint="Sokongan baris baru (Enter untuk baris baru)">
                <textarea value={item.body} onChange={e=>upd(item.id,'body',e.target.value)}
                  rows={4} placeholder={"Jangan lupa, Allah sentiasa bersama kita.\n\nIngatlah, dengan mengingati Allah hati akan menjadi tenang.\n– Surah Ar-Ra'd (13:28)"}
                  className="ms-input" style={{ resize:'vertical', width:'100%', lineHeight:1.6 }}/>
                {/* Live preview */}
                {(item.title || item.body) && (
                  <div style={{
                    marginTop:10, borderRadius:10, overflow:'hidden',
                    background:'linear-gradient(135deg,rgba(10,18,80,.94),rgba(55,35,190,.88))',
                    padding:'14px 16px',
                  }}>
                    <div style={{ fontSize:'0.7rem', fontWeight:700, color:'rgba(255,255,255,.6)', marginBottom:6, letterSpacing:'0.06em' }}>PRATONTON</div>
                    {item.title && <div style={{ fontSize:'0.95rem', fontWeight:800, color:'white', marginBottom:6, lineHeight:1.2 }}>{item.title}</div>}
                    {item.body  && <div style={{ fontSize:'0.8rem', color:'rgba(255,255,255,.8)', lineHeight:1.5, whiteSpace:'pre-line' }}>{item.body}</div>}
                  </div>
                )}
              </Field>
            )}
          </div>
        ))}

        <SaveBar saving={saving} result={result} msg={msg} onSave={save}/>
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SECTION: TICKER
   ══════════════════════════════════════════════════════════════ */
function TickerSection() {
  const { saving, result, msg, run } = useSave();
  const [messages, setMessages] = useState([]);
  const [loaded,   setLoaded]   = useState(false);

  useEffect(() => {
    fetchXmlFile().then(({ content }) => {
      const doc = new DOMParser().parseFromString(content, 'application/xml');
      const msgs = [...doc.querySelectorAll('ticker message')].map(el => el.textContent);
      setMessages(msgs.length ? msgs : ['']);
      setLoaded(true);
    }).catch(() => { setMessages(['']); setLoaded(true); });
  }, []);

  const add = () => setMessages(p => [...p, '']);
  const del = i => setMessages(p => p.filter((_,j)=>j!==i));
  const upd = (i, v) => setMessages(p => p.map((x,j)=>j===i?v:x));
  const save = () => run(doc => patchTicker(doc, messages.filter(m=>m.trim())), 'cms: update ticker');

  if (!loaded) return <div style={{ color: C.muted, fontSize:'0.85rem' }}>Memuatkan...</div>;

  return (
    <div style={{ maxWidth:680 }}>
      <Card title="Mesej Info Ticker" icon={MessageSquare} accent={C.amber}
        action={<Btn variant="secondary" size="sm" onClick={add}><Plus size={13}/> Tambah</Btn>}>
        {messages.map((msg_, i) => (
          <div key={i} style={{ display:'flex', gap:8, marginBottom:10 }}>
            <input type="text" value={msg_} onChange={e=>upd(i,e.target.value)}
              placeholder={`Mesej ${i+1}…`} className="ms-input" style={{ flex:1 }}/>
            <Btn variant="danger" size="sm" onClick={()=>del(i)}><Trash2 size={12}/></Btn>
          </div>
        ))}
        <SaveBar saving={saving} result={result} msg={msg} onSave={save}/>
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SECTION: HADITH
   ══════════════════════════════════════════════════════════════ */
function HadithSection() {
  const { saving, result, msg, run } = useSave();
  const [items,  setItems]  = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchXmlFile().then(({ content }) => {
      const doc = new DOMParser().parseFromString(content, 'application/xml');
      const parsed = [...doc.querySelectorAll('hadith item')].map((el,i) => ({
        id: i,
        arabic:      el.querySelector('arabic')?.textContent      || '',
        translation: el.querySelector('translation')?.textContent || '',
        source:      el.querySelector('source')?.textContent      || '',
      }));
      setItems(parsed.length ? parsed : [{ id:0, arabic:'', translation:'', source:'' }]);
      setLoaded(true);
    }).catch(() => { setItems([{ id:0, arabic:'', translation:'', source:'' }]); setLoaded(true); });
  }, []);

  const add = () => setItems(p=>[...p,{id:Date.now(),arabic:'',translation:'',source:''}]);
  const del = id => setItems(p=>p.filter(x=>x.id!==id));
  const upd = (id,k,v) => setItems(p=>p.map(x=>x.id===id?{...x,[k]:v}:x));
  const save = () => run(doc => patchHadith(doc, items.filter(x=>x.translation.trim())), 'cms: update hadith');

  if (!loaded) return <div style={{ color: C.muted, fontSize:'0.85rem' }}>Memuatkan...</div>;

  return (
    <div style={{ maxWidth:720 }}>
      <Card title="Hadith & Kata Hikmah" icon={BookOpen} accent={C.amber}
        action={<Btn variant="secondary" size="sm" onClick={add}><Plus size={13}/> Tambah</Btn>}>
        {items.map((item,i) => (
          <div key={item.id} style={{
            padding:'16px', marginBottom:14, borderRadius:14,
            background:`${C.blue}05`, border:`1px solid ${C.line}`,
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <span style={{ fontSize:'0.75rem', fontWeight:800, color:C.faint }}>HADITH {i+1}</span>
              <Btn variant="danger" size="sm" onClick={()=>del(item.id)}><Trash2 size={12}/></Btn>
            </div>
            <Field label="Teks Arab">
              <textarea value={item.arabic} onChange={e=>upd(item.id,'arabic',e.target.value)}
                rows={2} dir="rtl" placeholder="اَلْحَدِيْث..."
                className="ms-input"
                style={{ fontFamily:"'Amiri',serif", fontSize:'1.05rem', color:C.blue,
                         lineHeight:1.8, resize:'vertical', width:'100%' }}/>
            </Field>
            <Field label="Terjemahan Melayu" required>
              <textarea value={item.translation} onChange={e=>upd(item.id,'translation',e.target.value)}
                rows={3} placeholder="Terjemahan hadith…"
                className="ms-input" style={{ resize:'vertical', width:'100%' }}/>
            </Field>
            <Field label="Sumber">
              <input type="text" value={item.source} onChange={e=>upd(item.id,'source',e.target.value)}
                placeholder="cth: Riwayat Bukhari No. 1" className="ms-input"/>
            </Field>
          </div>
        ))}
        <SaveBar saving={saving} result={result} msg={msg} onSave={save}/>
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SECTION: FEATURES
   ══════════════════════════════════════════════════════════════ */
function FeaturesSection() {
  const { saving, result, msg, run } = useSave();
  const [cfg,    setCfg]    = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchXmlFile().then(({ content }) => {
      const doc = new DOMParser().parseFromString(content, 'application/xml');
      const g = t => doc.querySelector(`features ${t}`)?.textContent.trim();
      setCfg({
        show_countdown: g('show_countdown') !== 'false',
        show_ticker:    g('show_ticker')    !== 'false',
        show_hadith:    g('show_hadith')    !== 'false',
        show_datetime:  g('show_datetime')  !== 'false',
        show_slider:    g('show_slider')    !== 'false',
        ticker_speed:   Number(g('ticker_speed')) || 50,
        hadith_rotation_minutes: Number(g('hadith_rotation_minutes')) || 5,
      });
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  const set = (k, v) => setCfg(p => ({ ...p, [k]: v }));
  const save = () => run(doc => patchFeatures(doc, cfg), 'cms: update tetapan ciri');

  if (!loaded) return <div style={{ color: C.muted, fontSize:'0.85rem' }}>Memuatkan...</div>;

  return (
    <div style={{ maxWidth:640 }}>
      <Card title="Tetapan Paparan" icon={Settings} accent={C.blue}>
        <Toggle value={!!cfg.show_countdown} onChange={v=>set('show_countdown',v)} label="Kiraan Mundur Solat"/>
        <Toggle value={!!cfg.show_ticker}    onChange={v=>set('show_ticker',v)}    label="Info Ticker"/>
        <Toggle value={!!cfg.show_hadith}    onChange={v=>set('show_hadith',v)}    label="Hadith & Kata Hikmah"/>
        <Toggle value={!!cfg.show_datetime}  onChange={v=>set('show_datetime',v)}  label="Tarikh & Masa"/>
        <Toggle value={!!cfg.show_slider}    onChange={v=>set('show_slider',v)}    label="Slider Tazkirah"/>
        <div style={{ padding:'12px 0', borderBottom:`1px solid ${C.line}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <span style={{ fontSize:'0.875rem', color:C.ink, fontWeight:500 }}>Kelajuan Ticker</span>
            <span style={{ fontWeight:700, color:C.blue }}>{cfg.ticker_speed}</span>
          </div>
          <input type="range" min={5} max={120} value={cfg.ticker_speed||50}
            onChange={e=>set('ticker_speed',Number(e.target.value))}
            style={{ width:'100%', accentColor:C.blue }}/>
        </div>
        <div style={{ padding:'12px 0', borderBottom:`1px solid ${C.line}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
            <span style={{ fontSize:'0.875rem', color:C.ink, fontWeight:500 }}>Putaran Hadith</span>
            <span style={{ fontWeight:700, color:C.blue }}>{cfg.hadith_rotation_minutes} min</span>
          </div>
          <input type="range" min={1} max={30} value={cfg.hadith_rotation_minutes||5}
            onChange={e=>set('hadith_rotation_minutes',Number(e.target.value))}
            style={{ width:'100%', accentColor:C.blue }}/>
        </div>
        <div style={{ paddingTop:16 }}>
          <SaveBar saving={saving} result={result} msg={msg} onSave={save}/>
        </div>
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN EDITOR — tabbed layout
   ══════════════════════════════════════════════════════════════ */
const TABS = [
  { id:'profile',    label:'Profil',      icon:'🕌' },
  { id:'appearance', label:'Latar & Logo', icon:'🖼' },
  { id:'slider',     label:'Slider',      icon:'📽' },
  { id:'ticker',     label:'Ticker',      icon:'📢' },
  { id:'hadith',     label:'Hadith',      icon:'📖' },
  { id:'features',   label:'Tetapan',     icon:'⚙️' },
];

export default function XmlCmsEditor() {
  const [active, setActive] = useState('profile');

  if (!hasPat()) {
    return (
      <Alert type="warning">
        ⚠️ Token GitHub belum ditetapkan. Sila pergi ke <strong>Tetapan GitHub</strong> dan masukkan PAT anda sebelum menggunakan editor ini.
      </Alert>
    );
  }

  return (
    <div>
      {/* Tab bar */}
      <div style={{
        display:'flex', gap:4, flexWrap:'wrap', marginBottom:20,
        background:`${C.blue}07`, border:`1px solid ${C.line}`,
        borderRadius:14, padding:5,
      }}>
        {TABS.map(tab => {
          const on = active === tab.id;
          return (
            <button key={tab.id} onClick={()=>setActive(tab.id)} style={{
              display:'inline-flex', alignItems:'center', gap:6,
              padding:'7px 14px', borderRadius:10, border:'none', cursor:'pointer',
              fontSize:'0.82rem', fontWeight: on?700:500,
              background: on ? 'white' : 'transparent',
              color: on ? C.blue : C.muted,
              boxShadow: on ? `0 2px 8px ${C.blue}20` : 'none',
              transition:'all 0.15s',
            }}>
              <span>{tab.icon}</span>{tab.label}
            </button>
          );
        })}
      </div>

      {active === 'profile'    && <ProfileSection/>}
      {active === 'appearance' && <AppearanceSection/>}
      {active === 'slider'     && <SliderSection/>}
      {active === 'ticker'     && <TickerSection/>}
      {active === 'hadith'     && <HadithSection/>}
      {active === 'features'   && <FeaturesSection/>}
    </div>
  );
}
