import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { UploadResponse } from '@/hooks/useImageUpload';

interface UploadResultProps {
  result: UploadResponse;
  onReset: () => void;
}

export function UploadResult({ result, onReset }: UploadResultProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.driveLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl border border-emerald-100 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-900/10 text-center space-y-6"
    >
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 size={32} />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Upload Successful</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Your image has been saved to Google Drive
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 text-left space-y-4">
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">File Details</span>
          <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-200 truncate" title={result.fileName}>
            {result.fileName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Uploaded {new Date(result.uploadedAt).toLocaleString()}
          </p>
        </div>

        <div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Drive Link</span>
          <div className="mt-1 flex items-center gap-2">
            <input 
              type="text" 
              readOnly 
              value={result.driveLink}
              className="flex-1 text-sm bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button 
              onClick={handleCopy}
              className="p-2 bg-emerald-100/50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors flex-shrink-0"
              title="Copy to clipboard"
            >
              <Copy size={18} />
            </button>
            <a 
              href={result.driveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors flex-shrink-0 flex items-center gap-2"
            >
              <ExternalLink size={18} />
            </a>
          </div>
          {copied && (
            <p className="text-xs text-emerald-600 mt-2 font-medium">Link copied to clipboard!</p>
          )}
        </div>
      </div>

      <button
        onClick={onReset}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
      >
        <RefreshCw size={16} />
        Upload another file
      </button>
    </motion.div>
  );
}
