'use client';

import React from 'react';
import type { FieldDoc } from '@/config/fieldRegistry';
import { FileImage, Hash, Type, AlignLeft, CheckCircle2, XCircle } from 'lucide-react';

const CATEGORY_META = {
  text: { label: 'Text Field', Icon: Type, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
  number: { label: 'Number Field', Icon: Hash, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  letter: { label: 'Letter Field', Icon: AlignLeft, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  image: { label: 'Image / File Upload', Icon: FileImage, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
} as const;

interface FieldDocCardProps {
  field: FieldDoc;
}

export function FieldDocCard({ field }: FieldDocCardProps) {
  const meta = CATEGORY_META[field.category];
  const { Icon } = meta;

  return (
    <div className={`rounded-xl border p-4 ${meta.bg} transition-all duration-200 hover:scale-[1.01]`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`p-1.5 rounded-lg bg-white/5 ${meta.color}`}>
            <Icon size={14} />
          </span>
          <div>
            <code className="text-xs font-mono text-gray-200 bg-white/10 px-1.5 py-0.5 rounded">
              {field.fieldName}
            </code>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {field.required ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
              <CheckCircle2 size={10} /> Required
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-gray-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
              <XCircle size={10} /> Optional
            </span>
          )}
        </div>
      </div>

      {/* Label */}
      <p className="text-sm font-semibold text-white mb-3">{field.label}</p>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <DetailItem label="Input Type" value={field.inputType} />
        <DetailItem label="Category" value={meta.label} />
        <DetailItem
          label="Flags"
          value={[
            field.isTextFocused && 'Text',
            field.isNumberFocused && 'Number',
            field.isLetterFocused && 'Letter',
            field.isImageUpload && 'Upload',
          ]
            .filter(Boolean)
            .join(', ') || '—'}
        />
        <DetailItem label="Storage" value={field.storageDestination} truncate />
        {field.storagePath && (
          <DetailItem label="Path" value={`/${field.storagePath}/`} mono />
        )}
        <DetailItem label="Example" value={field.exampleValue} mono />
      </div>

      {/* Validation Rule */}
      {field.description && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-xs text-gray-400">
            <span className="font-semibold text-gray-300">Validation: </span>
            {field.description}
          </p>
        </div>
      )}
    </div>
  );
}

function DetailItem({
  label,
  value,
  mono,
  truncate,
}: {
  label: string;
  value: string;
  mono?: boolean;
  truncate?: boolean;
}) {
  return (
    <div>
      <p className="text-gray-500 text-[10px] uppercase tracking-wider font-medium mb-0.5">{label}</p>
      <p
        className={`text-gray-200 ${mono ? 'font-mono text-[11px]' : 'text-xs'} ${
          truncate ? 'truncate' : ''
        }`}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}
