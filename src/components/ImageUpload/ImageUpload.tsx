'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudUpload, AlertCircle, Loader2 } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { ImagePreview } from './ImagePreview';
import { UploadResult } from './UploadResult';
import { cn } from '@/utils/cn';
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '@/utils/validators';

export function ImageUpload() {
  const {
    file,
    previewUrl,
    uploadState,
    progress,
    result,
    error,
    handleFileSelect,
    uploadFile,
    resetState,
  } = useImageUpload('/api/upload');

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        handleFileSelect(acceptedFiles[0]);
      }
    },
    [handleFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
    },
    maxSize: MAX_FILE_SIZE_BYTES,
    maxFiles: 1,
    multiple: false,
    disabled: uploadState === 'uploading' || uploadState === 'success',
  });

  return (
    <div className="w-full max-w-lg mx-auto p-6 md:p-8 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 rounded-3xl shadow-2xl">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
          Upload Image
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Securely save your images straight to Google Drive
        </p>
      </div>

      <AnimatePresence mode="wait">
        {uploadState === 'success' && result ? (
          <UploadResult key="result" result={result} onReset={resetState} />
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg flex items-start gap-3">
                    <AlertCircle className="shrink-0 text-red-500 mt-0.5" size={18} />
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dropzone Area */}
            {!file ? (
              <div
                {...getRootProps()}
                className={cn(
                  "relative group cursor-pointer transition-all duration-300 ease-out rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-12 text-center",
                  isDragActive
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                    : isDragReject
                    ? "border-red-500 bg-red-50 dark:bg-red-500/10"
                    : "border-gray-300 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                )}
              >
                <input {...getInputProps()} />
                <div className="w-16 h-16 mb-4 rounded-full bg-indigo-50 dark:bg-gray-800 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform duration-300">
                  <CloudUpload size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Drag & drop your image here
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  or click to choose from your computer
                </p>
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  <span className="text-xs px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                    JPG, PNG, WEBP
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                    Up to {MAX_FILE_SIZE_MB}MB
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <ImagePreview
                  file={file}
                  previewUrl={previewUrl!}
                  onRemove={resetState}
                  disabled={uploadState === 'uploading'}
                />

                {uploadState === 'uploading' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span className="text-indigo-600 dark:text-indigo-400">Uploading...</span>
                      <span className="text-gray-500">{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "easeOut" }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={uploadFile}
                    disabled={uploadState === 'uploading'}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300",
                      uploadState === 'uploading'
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                        : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]"
                    )}
                  >
                    {uploadState === 'uploading' ? (
                      <>
                         <Loader2 size={18} className="animate-spin" />
                         Processing
                      </>
                    ) : (
                      <>
                        <CloudUpload size={18} />
                        Confirm Upload
                      </>
                    )}
                  </button>
                  {uploadState !== 'uploading' && (
                    <button
                      type="button"
                      onClick={resetState}
                      className="py-3 px-4 rounded-xl font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
