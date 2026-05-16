import { useState, useRef, useCallback } from 'react';
import { uploadToR2, buildR2Key } from '../../lib/r2';
import useGoogleDrive from '../../hooks/useGoogleDrive';
import LoadingSpinner from './LoadingSpinner';

const ACCEPT_MAP = {
  image: 'image/*',
  video: 'video/*',
  audio: 'audio/*',
};

const MIME_ICONS = {
  image: '🖼️',
  video: '🎬',
  audio: '🎵',
};

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Upload state machine ──────────────────────────────────────────
// idle → selected → uploading → done → error

export default function MediaUploader({
  accept = 'image',
  userId,
  uploadPath,
  onUploadComplete,
  onProgress,
  maxSizeMB = 100,
}) {
  const [uploadState, setUploadState] = useState('idle'); // idle|selected|uploading|done|error
  const [selectedFile, setSelectedFile] = useState(null);
  const [progressPct, setProgressPct] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);

  const fileInputRef = useRef(null);

  const drive = useGoogleDrive();

  const handleFile = useCallback((file) => {
    if (!file) return;
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrorMsg(`File exceeds ${maxSizeMB} MB limit`);
      setUploadState('error');
      return;
    }
    setSelectedFile(file);
    setUploadState('selected');
    setErrorMsg('');
  }, [maxSizeMB]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleInputChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !userId) return;
    setUploadState('uploading');
    setProgressPct(0);

    try {
      const key = buildR2Key(userId, uploadPath || accept, selectedFile.name);
      const url = await uploadToR2(selectedFile, key, (pct) => {
        setProgressPct(pct);
        onProgress?.(pct);
      });
      setUploadState('done');
      onUploadComplete?.({ url, key, filename: selectedFile.name, type: accept });
    } catch (err) {
      setErrorMsg(err.message || 'Upload failed');
      setUploadState('error');
    }
  }, [selectedFile, userId, uploadPath, accept, onProgress, onUploadComplete]);

  const handleReset = useCallback(() => {
    setUploadState('idle');
    setSelectedFile(null);
    setProgressPct(0);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const openDriveModal = useCallback(async () => {
    setShowDriveModal(true);
    if (drive.isConnected && !drive.files.length) {
      await drive.browseRoot();
    }
  }, [drive]);

  const handleDriveFileSelect = useCallback((file) => {
    setShowDriveModal(false);
    const url = `https://drive.google.com/uc?id=${file.id}&export=download`;
    onUploadComplete?.({
      url,
      key: null,
      filename: file.name,
      type: accept,
      gdriveId: file.id,
    });
  }, [accept, onUploadComplete]);

  const isError = uploadState === 'error';
  const borderColor = isError ? '#ef4444' : isDragOver ? '#C9A84C' : 'rgba(201,168,76,0.4)';

  return (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      {/* ── Option A: Local Upload ── */}
      <div style={{ flex: 1, minWidth: '220px' }}>
        <p style={{ color: '#C9A84C', fontSize: '12px', marginBottom: '8px', fontWeight: 600 }}>
          LOCAL UPLOAD
        </p>

        {/* Drop zone */}
        <div
          onClick={() => uploadState === 'idle' && fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${borderColor}`,
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            cursor: uploadState === 'idle' ? 'pointer' : 'default',
            background: isDragOver ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.03)',
            transition: 'all 0.2s ease',
            minHeight: '120px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {uploadState === 'idle' && (
            <>
              <span style={{ fontSize: '28px' }}>{MIME_ICONS[accept] || '📎'}</span>
              <span style={{ color: 'rgba(245,237,214,0.6)', fontSize: '13px' }}>
                Drag & drop or click to select
              </span>
              <span style={{ color: 'rgba(245,237,214,0.4)', fontSize: '11px' }}>
                Max {maxSizeMB} MB
              </span>
            </>
          )}

          {uploadState === 'selected' && selectedFile && (
            <>
              <span style={{ fontSize: '24px' }}>{MIME_ICONS[accept] || '📎'}</span>
              <span style={{ color: '#F5EDD6', fontSize: '13px', wordBreak: 'break-all' }}>
                {selectedFile.name}
              </span>
              <span style={{ color: 'rgba(245,237,214,0.5)', fontSize: '11px' }}>
                {formatBytes(selectedFile.size)}
              </span>
            </>
          )}

          {uploadState === 'uploading' && (
            <div style={{ width: '100%' }}>
              <LoadingSpinner size="sm" text={`Uploading… ${progressPct}%`} />
              <div style={{
                marginTop: '12px', height: '6px', borderRadius: '3px',
                background: 'rgba(255,255,255,0.1)', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: '3px',
                  background: '#C9A84C',
                  width: `${progressPct}%`,
                  transition: 'width 0.2s ease',
                }} />
              </div>
            </div>
          )}

          {uploadState === 'done' && (
            <>
              <span style={{ fontSize: '28px' }}>✅</span>
              <span style={{ color: '#4ade80', fontSize: '13px' }}>Upload complete!</span>
            </>
          )}

          {uploadState === 'error' && (
            <>
              <span style={{ fontSize: '28px' }}>❌</span>
              <span style={{ color: '#f87171', fontSize: '13px' }}>{errorMsg}</span>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_MAP[accept]}
          style={{ display: 'none' }}
          onChange={handleInputChange}
        />

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          {uploadState === 'selected' && (
            <button onClick={handleUpload} style={btnStyle('#C9A84C', '#050E1A')}>
              Upload
            </button>
          )}
          {(uploadState === 'selected' || uploadState === 'done' || uploadState === 'error') && (
            <button onClick={handleReset} style={btnStyle('transparent', '#C9A84C', 'rgba(201,168,76,0.4)')}>
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ── Option B: Google Drive ── */}
      <div style={{ flex: 1, minWidth: '220px' }}>
        <p style={{ color: '#C9A84C', fontSize: '12px', marginBottom: '8px', fontWeight: 600 }}>
          GOOGLE DRIVE
        </p>
        <div style={{
          border: '2px dashed rgba(201,168,76,0.25)',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          minHeight: '120px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          background: 'rgba(255,255,255,0.03)',
        }}>
          <span style={{ fontSize: '28px' }}>📁</span>
          <button onClick={openDriveModal} style={btnStyle('#0D4F4F', '#C9A84C')}>
            Import from Google Drive
          </button>
          <span style={{ color: 'rgba(245,237,214,0.4)', fontSize: '11px' }}>
            Connects to your Google account
          </span>
        </div>
      </div>

      {/* ── Google Drive Modal ── */}
      {showDriveModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(5,14,26,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: 'rgba(13,79,79,0.95)',
            border: '1px solid rgba(201,168,76,0.3)',
            borderRadius: '16px',
            padding: '24px',
            width: '100%', maxWidth: '480px',
            maxHeight: '70vh', display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: '#C9A84C', fontFamily: "'Cinzel Decorative', serif", fontSize: '16px', margin: 0 }}>
                Google Drive
              </h3>
              <button onClick={() => setShowDriveModal(false)} style={{ ...btnStyle('transparent', '#F5EDD6'), fontSize: '18px', padding: '0 8px' }}>
                ✕
              </button>
            </div>

            {!drive.isConnected ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <p style={{ color: 'rgba(245,237,214,0.7)', marginBottom: '16px', fontSize: '14px' }}>
                  Connect your Google Drive to browse files
                </p>
                <button
                  onClick={drive.connect}
                  disabled={drive.isLoading}
                  style={btnStyle('#C9A84C', '#050E1A')}
                >
                  {drive.isLoading ? 'Connecting…' : 'Connect Google Drive'}
                </button>
              </div>
            ) : drive.isLoading ? (
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <LoadingSpinner size="md" text="Loading files…" />
              </div>
            ) : (
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {drive.error && (
                  <p style={{ color: '#f87171', fontSize: '13px', marginBottom: '12px' }}>{drive.error}</p>
                )}

                {/* Folders */}
                {drive.folders.map((folder) => (
                  <div
                    key={folder.id}
                    onClick={() => drive.browseTo(folder.id)}
                    style={driveItemStyle}
                  >
                    <span style={{ fontSize: '20px' }}>📂</span>
                    <span style={{ color: '#F5EDD6', fontSize: '13px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {folder.name}
                    </span>
                  </div>
                ))}

                {/* Files */}
                {drive.files.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => handleDriveFileSelect(file)}
                    style={driveItemStyle}
                  >
                    {file.thumbnailLink ? (
                      <img src={file.thumbnailLink} alt="" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }} />
                    ) : (
                      <span style={{ fontSize: '20px' }}>{MIME_ICONS[accept] || '📄'}</span>
                    )}
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ color: '#F5EDD6', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {file.name}
                      </div>
                      {file.size && (
                        <div style={{ color: 'rgba(245,237,214,0.45)', fontSize: '11px' }}>
                          {formatBytes(Number(file.size))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {!drive.folders.length && !drive.files.length && (
                  <p style={{ color: 'rgba(245,237,214,0.5)', textAlign: 'center', fontSize: '13px', padding: '24px 0' }}>
                    No files found
                  </p>
                )}
              </div>
            )}

            {drive.isConnected && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button onClick={drive.browseRoot} style={btnStyle('transparent', '#C9A84C', 'rgba(201,168,76,0.3)')}>
                  🏠 Root
                </button>
                <button onClick={drive.refresh} style={btnStyle('transparent', '#C9A84C', 'rgba(201,168,76,0.3)')}>
                  🔄 Refresh
                </button>
                <button
                  onClick={() => drive.filterByType(accept)}
                  style={btnStyle('rgba(201,168,76,0.15)', '#C9A84C', 'rgba(201,168,76,0.3)')}
                >
                  Filter {accept}s
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function btnStyle(bg, color, borderColor) {
  return {
    background: bg,
    color,
    border: `1px solid ${borderColor || color}`,
    borderRadius: '8px',
    padding: '7px 14px',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    transition: 'opacity 0.2s',
  };
}

const driveItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px',
  borderRadius: '8px',
  cursor: 'pointer',
  marginBottom: '4px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(201,168,76,0.1)',
  transition: 'background 0.15s',
};
