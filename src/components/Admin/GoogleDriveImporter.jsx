import { useState } from 'react';
import GlassCard from '../shared/GlassCard';
import LoadingSpinner from '../shared/LoadingSpinner';
import useGoogleDrive from '../../hooks/useGoogleDrive';
import useStore from '../../store/useStore';
import {
  logGdriveImport, updateGdriveImportStatus,
  upsertSliderItem, upsertAudioItem,
} from '../../lib/supabase';
import { getDriveDownloadUrl } from '../../lib/googleDrive';

const btnPrimary = {
  background: '#C9A84C', color: '#050E1A', border: 'none',
  borderRadius: '8px', padding: '10px 20px', cursor: 'pointer',
  fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: '14px',
};
const btnSecondary = {
  background: 'transparent', color: '#C9A84C',
  border: '1px solid rgba(201,168,76,0.4)',
  borderRadius: '8px', padding: '8px 14px', cursor: 'pointer',
  fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '13px',
};

const TYPE_FILTERS = [
  { id: null, label: 'Semua' },
  { id: 'image', label: 'Imej' },
  { id: 'video', label: 'Video' },
  { id: 'audio', label: 'Audio' },
];

function getMimeIcon(mimeType) {
  if (!mimeType) return '📄';
  if (mimeType.includes('image')) return '🖼️';
  if (mimeType.includes('video')) return '🎬';
  if (mimeType.includes('audio')) return '🎵';
  if (mimeType.includes('folder')) return '📂';
  return '📄';
}

function formatBytes(bytes) {
  if (!bytes) return '';
  const n = Number(bytes);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function GoogleDriveImporter({ onImportComplete }) {
  const { user } = useStore();
  const drive = useGoogleDrive();
  const [importStatuses, setImportStatuses] = useState({});

  const setStatus = (fileId, status) => {
    setImportStatuses(prev => ({ ...prev, [fileId]: status }));
  };

  const handleConnect = async () => {
    await drive.connect();
  };

  const handleImport = async (file) => {
    if (!user?.id) return;
    setStatus(file.id, 'importing');

    const importType = file.mimeType?.includes('audio') ? 'audio' : 'slider';

    let logId = null;
    try {
      const { data: logData } = await logGdriveImport({
        user_id: user.id,
        file_id: file.id,
        file_name: file.name,
        import_type: importType,
        status: 'importing',
      });
      logId = logData?.id;

      const downloadUrl = getDriveDownloadUrl(file.id);

      if (importType === 'audio') {
        await upsertAudioItem({
          title: file.name,
          audio_url: downloadUrl,
          source_gdrive_id: file.id,
          user_id: user.id,
          category: 'zikir',
          storage_provider: 'gdrive',
          is_active: true,
        });
      } else {
        await upsertSliderItem({
          media_url: downloadUrl,
          media_type: 'image',
          title: file.name,
          user_id: user.id,
          storage_provider: 'gdrive',
          is_active: true,
        });
      }

      if (logId) {
        await updateGdriveImportStatus(logId, 'done', downloadUrl);
      }

      setStatus(file.id, 'done');
      onImportComplete && onImportComplete();
    } catch (err) {
      if (logId) {
        await updateGdriveImportStatus(logId, 'error', null, err.message || 'Unknown error');
      }
      setStatus(file.id, 'error');
    }
  };

  const filterStyle = (active) => ({
    padding: '6px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '12px',
    border: 'none',
    background: active ? '#C9A84C' : 'rgba(255,255,255,0.06)',
    color: active ? '#050E1A' : 'rgba(245,237,214,0.6)',
    fontWeight: active ? 600 : 400,
  });

  if (!drive.isConnected) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
        <button onClick={handleConnect} disabled={drive.isLoading} style={{ ...btnPrimary, marginBottom: '12px' }}>
          {drive.isLoading ? 'Menyambung...' : 'Sambungkan Google Drive'}
        </button>
        <p style={{ color: 'rgba(245,237,214,0.5)', fontSize: '13px', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: '8px 0 0' }}>
          Sambungkan akaun Google anda untuk mengimport fail
        </p>
        {drive.error && (
          <p style={{ color: '#f87171', fontSize: '13px', fontFamily: "'Plus Jakarta Sans', sans-serif", marginTop: '8px' }}>
            {drive.error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Top bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ color: 'rgba(245,237,214,0.6)', fontSize: '13px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {drive.currentFolderId === 'root' ? '📁 Drive' : '📂 Folder'}
        </span>

        <div style={{ display: 'flex', gap: '4px' }}>
          {TYPE_FILTERS.map(f => (
            <button
              key={String(f.id)}
              onClick={() => drive.filterByType(f.id)}
              style={filterStyle(false)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button onClick={drive.refresh} style={btnSecondary}>
          🔄 Muat Semula
        </button>

        {drive.currentFolderId !== 'root' && (
          <button onClick={drive.browseRoot} style={btnSecondary}>
            ← Kembali ke Root
          </button>
        )}
      </div>

      {drive.isLoading && (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <LoadingSpinner size="md" text="Memuatkan fail..." />
        </div>
      )}

      {drive.error && (
        <p style={{ color: '#f87171', fontSize: '13px', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: '12px' }}>
          {drive.error}
        </p>
      )}

      {!drive.isLoading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {/* Folders */}
          {drive.folders.map(folder => (
            <GlassCard
              key={folder.id}
              style={{ padding: '12px', cursor: 'pointer' }}
              onClick={() => drive.browseTo(folder.id)}
            >
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>📂</div>
              <div style={{
                color: '#F5EDD6', fontSize: '13px', fontFamily: "'Plus Jakarta Sans', sans-serif",
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '8px',
              }}>
                {folder.name}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); drive.browseTo(folder.id); }}
                style={{ ...btnSecondary, padding: '4px 10px', fontSize: '12px' }}
              >
                Buka →
              </button>
            </GlassCard>
          ))}

          {/* Files */}
          {drive.files.map(file => {
            const status = importStatuses[file.id] || 'idle';
            return (
              <GlassCard key={file.id} style={{ padding: '12px' }}>
                {file.thumbnailLink ? (
                  <img
                    src={file.thumbnailLink}
                    alt=""
                    style={{ width: '100%', height: '60px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }}
                  />
                ) : (
                  <div style={{
                    width: '100%', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '28px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', marginBottom: '8px',
                  }}>
                    {getMimeIcon(file.mimeType)}
                  </div>
                )}

                <div style={{
                  color: '#F5EDD6', fontSize: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif",
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px',
                }}>
                  {file.name}
                </div>
                {file.size && (
                  <div style={{ color: 'rgba(245,237,214,0.4)', fontSize: '11px', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: '8px' }}>
                    {formatBytes(file.size)}
                  </div>
                )}

                {status === 'idle' && (
                  <button onClick={() => handleImport(file)} style={{ ...btnPrimary, padding: '6px 12px', fontSize: '12px' }}>
                    Import
                  </button>
                )}
                {status === 'importing' && (
                  <span style={{ color: '#C9A84C', fontSize: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>⏳ Mengimport...</span>
                )}
                {status === 'done' && (
                  <span style={{ color: '#4ade80', fontSize: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>✓ Selesai</span>
                )}
                {status === 'error' && (
                  <span style={{ color: '#f87171', fontSize: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>✗ Ralat</span>
                )}
              </GlassCard>
            );
          })}

          {drive.folders.length === 0 && drive.files.length === 0 && !drive.isLoading && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0' }}>
              <p style={{ color: 'rgba(245,237,214,0.5)', fontSize: '14px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Tiada fail dijumpai
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
