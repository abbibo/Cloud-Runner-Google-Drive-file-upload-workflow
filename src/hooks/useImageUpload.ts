import { useState, useCallback } from 'react';
import axios from 'axios';
import { MAX_FILE_SIZE_MB, isValidImageFormat, isValidSize } from '../utils/validators';

export interface UploadResponse {
  success: boolean;
  fileName: string;
  fileId: string;
  driveLink: string;
  uploadedAt: string;
  error?: string;
}

export type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export function useImageUpload(endpoint: string = '/api/upload') {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setUploadState('idle');
    setProgress(0);
    setResult(null);
    setError(null);
  }, [previewUrl]);

  const handleFileSelect = useCallback((selectedFile: File) => {
    resetState();

    if (!isValidImageFormat(selectedFile)) {
      setError('Invalid file format. Please upload JPG, PNG, or WEBP.');
      return;
    }

    if (!isValidSize(selectedFile)) {
      setError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  }, [resetState]);

  const uploadFile = useCallback(async () => {
    if (!file) {
      setError('No file selected.');
      return;
    }

    setUploadState('uploading');
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post<UploadResponse>(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          }
        },
      });

      if (response.data.success) {
        setUploadState('success');
        setResult(response.data);
      } else {
        throw new Error(response.data.error || 'Upload failed');
      }
    } catch (err: any) {
      setUploadState('error');
      setError(err.response?.data?.error || err.message || 'An error occurred during upload.');
    }
  }, [file, endpoint]);

  return {
    file,
    previewUrl,
    uploadState,
    progress,
    result,
    error,
    handleFileSelect,
    uploadFile,
    resetState
  };
}
