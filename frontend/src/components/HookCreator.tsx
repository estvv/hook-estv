import { useState } from 'react';
import { HookViewer } from './HookViewer';

export function HookCreator() {
  const [slug, setSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateHook = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/hooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const data = await response.json();
      setSlug(data.slug);
    } catch (error) {
      console.error('Failed to create hook:', error);
    } finally {
      setLoading(false);
    }
  };

  if (slug) {
    return <HookViewer slug={slug} onBack={() => setSlug(null)} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md w-full px-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">Hook</h1>
        </div>

        <button
          onClick={handleCreateHook}
          disabled={loading}
          className="w-full px-4 py-3 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Hook'}
        </button>

        <p className="text-neutral-400 text-xs text-center mt-4">
          Hooks auto-delete after 24 hours
        </p>
      </div>
    </div>
  );
}