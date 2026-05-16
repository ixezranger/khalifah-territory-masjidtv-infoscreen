export const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL || '';

export function getR2Url(key) {
  return `${R2_PUBLIC_URL}/${key}`;
}

export function buildR2Key(userId, type, filename) {
  // type: 'slider' | 'audio/zikir' | 'audio/quran' | 'audio/nasheed' | 'thumbnails'
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `masjidtv/${userId}/${type}/${Date.now()}_${sanitized}`;
}

export async function uploadToR2(file, r2Key, onProgress) {
  // Never expose R2 secret keys to the browser — uses Supabase Edge Function for presigned URL
  // Edge Function endpoint: /functions/v1/get-upload-url

  try {
    // Step 1: Get presigned URL from Edge Function
    const { supabase } = await import('./supabase');
    const { data: { session } } = await supabase.auth.getSession();

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-upload-url`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ key: r2Key, contentType: file.type }),
      }
    );

    if (!response.ok) throw new Error('Failed to get presigned URL');
    const { presignedUrl } = await response.json();

    // Step 2: Upload directly to R2 using presigned URL
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          resolve(getR2Url(r2Key));
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      });
      xhr.addEventListener('error', () => reject(new Error('Upload error')));
      xhr.open('PUT', presignedUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  } catch (error) {
    console.error('R2 upload error:', error);
    throw error;
  }
}

export async function deleteFromR2(key) {
  // TODO: Call Supabase Edge Function to delete from R2
  console.warn('deleteFromR2: Edge Function not yet implemented for key:', key);
}
