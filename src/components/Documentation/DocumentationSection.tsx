'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Download,
  RefreshCw,
  Type,
  Hash,
  AlignLeft,
  FileImage,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCheck,
} from 'lucide-react';
import { FieldDocCard } from './FieldDocCard';
import type { FieldDoc, FieldCategory } from '@/config/fieldRegistry';

interface DocsResponse {
  success: boolean;
  generatedAt: string;
  totalFields: number;
  categories: Record<FieldCategory, number>;
  fieldsByCategory: Record<FieldCategory, FieldDoc[]>;
  allFields: FieldDoc[];
}

const CATEGORY_CONFIG: {
  key: FieldCategory;
  label: string;
  description: string;
  Icon: React.ElementType;
  accent: string;
}[] = [
  {
    key: 'image',
    label: 'Image / File Upload Fields',
    description: 'Binary uploads stored in Google Drive with GitHub metadata references',
    Icon: FileImage,
    accent: 'from-purple-500 to-pink-500',
  },
  {
    key: 'number',
    label: 'Number-Focused Fields',
    description: 'Numeric identifiers with strict digit-count validation',
    Icon: Hash,
    accent: 'from-amber-500 to-orange-500',
  },
  {
    key: 'letter',
    label: 'Letter-Focused Fields',
    description: 'Fields that accept only alphabetic characters',
    Icon: AlignLeft,
    accent: 'from-emerald-500 to-teal-500',
  },
  {
    key: 'text',
    label: 'Text Fields',
    description: 'General text inputs including email, URL, and free-form text',
    Icon: Type,
    accent: 'from-blue-500 to-cyan-500',
  },
];

export function DocumentationSection() {
  const [docs, setDocs] = useState<DocsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<FieldCategory>>(
    new Set(['image'])
  );
  const [copied, setCopied] = useState(false);

  const fetchDocs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/docs');
      const data: DocsResponse = await res.json();
      if (!data.success) throw new Error('API returned error');
      setDocs(data);
    } catch (err: any) {
      setError('Failed to load field documentation. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const toggleCategory = (cat: FieldCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const handleCopyAll = () => {
    if (!docs) return;
    const text = docs.allFields
      .map(
        (f) =>
          `Field: ${f.fieldName}\nLabel: ${f.label}\nType: ${f.inputType}\nRequired: ${f.required}\nCategory: ${f.category}\nValidation: ${f.description}\nStorage: ${f.storageDestination}\nExample: ${f.exampleValue}\n`
      )
      .join('\n---\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJSON = () => {
    if (!docs) return;
    const blob = new Blob([JSON.stringify(docs.allFields, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `field-documentation-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4">
      {/* Section Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-4">
          <BookOpen size={14} />
          Auto-Generated Documentation
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
          Field Documentation
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">
          Every field below is defined in the central field registry. Documentation is generated
          automatically — types, validation rules, storage paths, and examples are always in sync
          with the actual form.
        </p>

        {docs && (
          <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
            <Stat label="Total Fields" value={docs.totalFields} />
            <Stat label="Required" value={docs.allFields.filter((f) => f.required).length} />
            <Stat label="Image Uploads" value={docs.categories.image} />
            <Stat label="Generated" value={new Date(docs.generatedAt).toLocaleTimeString()} isText />
          </div>
        )}
      </div>

      {/* Toolbar */}
      {docs && (
        <div className="flex items-center justify-end gap-2 mb-6">
          <button
            onClick={fetchDocs}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors"
          >
            <RefreshCw size={13} /> Refresh
          </button>
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors"
          >
            {copied ? <CheckCheck size={13} className="text-green-400" /> : <Copy size={13} />}
            {copied ? 'Copied!' : 'Copy All'}
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-500 transition-colors"
          >
            <Download size={13} /> Export JSON
          </button>
        </div>
      )}

      {/* States */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-gray-400 text-sm">Generating field documentation…</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
          {error}
          <button onClick={fetchDocs} className="ml-3 underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {/* Category Sections */}
      {docs && (
        <div className="space-y-4">
          {CATEGORY_CONFIG.map(({ key, label, description, Icon, accent }) => {
            const fields = docs.fieldsByCategory[key] ?? [];
            const isOpen = expandedCategories.has(key);

            return (
              <div
                key={key}
                className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(key)}
                  className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${accent} opacity-90`}>
                      <Icon size={16} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-sm">{label}</h3>
                      <p className="text-gray-500 text-xs mt-0.5">{description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full bg-gradient-to-r ${accent} text-white`}>
                      {fields.length} fields
                    </span>
                    {isOpen ? (
                      <ChevronUp size={16} className="text-gray-400 group-hover:text-white transition-colors" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-400 group-hover:text-white transition-colors" />
                    )}
                  </div>
                </button>

                {/* Fields Grid */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 pt-0 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        {fields.map((field) => (
                          <FieldDocCard key={field.fieldName} field={field} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  isText,
}: {
  label: string;
  value: number | string;
  isText?: boolean;
}) {
  return (
    <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-center">
      <p className={`font-bold ${isText ? 'text-sm text-gray-300' : 'text-xl text-white'}`}>
        {value}
      </p>
      <p className="text-gray-500 text-xs">{label}</p>
    </div>
  );
}
