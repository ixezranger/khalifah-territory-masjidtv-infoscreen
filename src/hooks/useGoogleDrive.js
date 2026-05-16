import { useState, useEffect, useCallback } from 'react';
import {
  initGoogleDrive,
  connectGoogleDrive,
  listDriveFiles,
  getDriveFolders,
  isGoogleDriveReady,
} from '../lib/googleDrive';

const MIME_FILTERS = {
  image: 'image/',
  video: 'video/',
  audio: 'audio/',
};

export default function useGoogleDrive() {
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState('root');
  const [activeTypeFilter, setActiveTypeFilter] = useState(null);

  useEffect(() => {
    initGoogleDrive()
      .then(() => {
        setIsInitialized(true);
        if (isGoogleDriveReady()) {
          setIsConnected(true);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to initialize Google Drive');
      });
  }, []);

  const browseTo = useCallback(async (folderId, mimeFilter = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedFiles, fetchedFolders] = await Promise.all([
        listDriveFiles(folderId, mimeFilter),
        getDriveFolders(folderId),
      ]);
      setFiles(fetchedFiles);
      setFolders(fetchedFolders);
      setCurrentFolderId(folderId);
    } catch (err) {
      setError(err.message || 'Failed to browse Google Drive');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await connectGoogleDrive();
      setIsConnected(true);
      await browseTo('root', activeTypeFilter ? MIME_FILTERS[activeTypeFilter] : null);
    } catch (err) {
      setError(err.message || 'Failed to connect to Google Drive');
    } finally {
      setIsLoading(false);
    }
  }, [browseTo, activeTypeFilter]);

  const browseRoot = useCallback(() => {
    setActiveTypeFilter(null);
    browseTo('root', null);
  }, [browseTo]);

  const filterByType = useCallback((type) => {
    setActiveTypeFilter(type);
    const mimeFilter = type ? MIME_FILTERS[type] : null;
    browseTo(currentFolderId, mimeFilter);
  }, [browseTo, currentFolderId]);

  const refresh = useCallback(() => {
    const mimeFilter = activeTypeFilter ? MIME_FILTERS[activeTypeFilter] : null;
    browseTo(currentFolderId, mimeFilter);
  }, [browseTo, currentFolderId, activeTypeFilter]);

  return {
    isConnected,
    isInitialized,
    isLoading,
    error,
    files,
    folders,
    currentFolderId,
    connect,
    browseTo,
    browseRoot,
    filterByType,
    refresh,
  };
}
