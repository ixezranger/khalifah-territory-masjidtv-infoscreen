const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

let gapiInited = false;
let gisInited = false;
let tokenClient = null;

export async function initGoogleDrive() {
  return new Promise((resolve) => {
    const script1 = document.createElement('script');
    script1.src = 'https://apis.google.com/js/api.js';
    script1.onload = () => {
      window.gapi.load('client', async () => {
        await window.gapi.client.init({
          apiKey: GOOGLE_API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
        if (gisInited) resolve(true);
      });
    };
    document.body.appendChild(script1);

    const script2 = document.createElement('script');
    script2.src = 'https://accounts.google.com/gsi/client';
    script2.onload = () => {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: '',
      });
      gisInited = true;
      if (gapiInited) resolve(true);
    };
    document.body.appendChild(script2);
  });
}

export function connectGoogleDrive() {
  return new Promise((resolve, reject) => {
    if (!tokenClient) { reject(new Error('Google Drive not initialized')); return; }
    tokenClient.callback = (resp) => {
      if (resp.error) { reject(resp); return; }
      resolve(resp);
    };
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

export async function listDriveFiles(folderId = 'root', mimeFilter = null) {
  let q = `'${folderId}' in parents and trashed = false`;
  if (mimeFilter) q += ` and mimeType contains '${mimeFilter}'`;

  const response = await window.gapi.client.drive.files.list({
    q,
    fields: 'files(id, name, mimeType, size, thumbnailLink, modifiedTime)',
    pageSize: 100,
    orderBy: 'modifiedTime desc',
  });
  return response.result.files || [];
}

export async function getDriveFolders(parentId = 'root') {
  const response = await window.gapi.client.drive.files.list({
    q: `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id, name)',
    pageSize: 50,
  });
  return response.result.files || [];
}

export function getDriveDownloadUrl(fileId) {
  const token = window.gapi.client.getToken();
  return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&access_token=${token.access_token}`;
}

export function isGoogleDriveReady() {
  return gapiInited && gisInited && window.gapi?.client?.getToken() !== null;
}
