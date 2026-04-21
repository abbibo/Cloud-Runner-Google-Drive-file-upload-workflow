import { ImageUpload } from '@/components/ImageUpload/ImageUpload';
import { DocumentationSection } from '@/components/Documentation/DocumentationSection';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
      {/* Background Ornaments */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Upload Section */}
      <section className="flex flex-col items-center justify-center p-4 pt-16 pb-10">
        <div className="w-full relative z-10 flex flex-col items-center">
          <div className="text-center mb-10 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Drive Upload Workflow API
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
              Share images with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
                Precision
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              A production-ready React component demonstrating secure direct uploads to Google Drive
              with smooth animations and comprehensive validation.
            </p>
          </div>
          <ImageUpload />
        </div>
      </section>

      {/* Divider */}
      <div className="w-full max-w-6xl mx-auto px-4">
        <div className="border-t border-white/10 dark:border-gray-800" />
      </div>

      {/* Documentation Section */}
      <section className="px-4 pb-20">
        <DocumentationSection />
      </section>
    </main>
  );
}
