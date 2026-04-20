import React from 'react';
import { FileImage, Trash2 } from 'lucide-react';
import { formatBytes } from '@/utils/formatters';

interface ImagePreviewProps {
  file: File;
  previewUrl: string;
  onRemove: () => void;
  disabled?: boolean;
}

export function ImagePreview({ file, previewUrl, onRemove, disabled = false }: ImagePreviewProps) {
  return (
    <div className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="aspect-[4/3] w-full bg-gray-100 dark:bg-gray-800/50 flex items-center justify-center relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={previewUrl} 
          alt={file.name} 
          className="object-contain w-full h-full max-h-[300px]"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none" />
        
        {!disabled && (
          <button
            onClick={onRemove}
            type="button"
            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-red-50 text-gray-700 hover:text-red-500 rounded-full shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            title="Remove file"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
      
      <div className="p-4 flex items-center gap-3 bg-white dark:bg-gray-900">
        <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-500">
          <FileImage size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {file.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatBytes(file.size)}
          </p>
        </div>
      </div>
    </div>
  );
}
