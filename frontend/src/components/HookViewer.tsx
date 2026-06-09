import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Props {
  slug: string;
  onBack: () => void;
}

interface Request {
  id: string;
  method: string;
  path: string;
  query: Record<string, string> | null;
  headers: Record<string, string>;
  body: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export function HookViewer({ slug, onBack }: Props) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);

  const hookUrl = `${window.location.origin}/hook/${slug}`;

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 2000);
    return () => clearInterval(interval);
  }, [slug]);

  const fetchRequests = async () => {
    try {
      // First get hook info to get the ID
      const hookResponse = await fetch(`/api/hooks/${slug}`);
      const hookData = await hookResponse.json();
      
      // Then get requests
      const response = await fetch(`/api/hooks/${hookData.id}/requests`);
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(hookUrl);
    alert('URL copied!');
  };

  const handleDelete = async () => {
    if (!confirm('Delete this hook?')) return;
    
    try {
      await fetch(`/api/hooks/${slug}`, { method: 'DELETE' });
      onBack();
    } catch (error) {
      console.error('Failed to delete hook:', error);
    }
  };

  const formatMethod = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'text-green-600',
      POST: 'text-blue-600',
      PUT: 'text-yellow-600',
      DELETE: 'text-red-600',
      PATCH: 'text-purple-600'
    };
    return colors[method] || 'text-neutral-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-neutral-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <button onClick={onBack} className="text-neutral-600 hover:text-neutral-900 text-sm">
            ← Create new hook
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Hook URL</h1>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={hookUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-neutral-200 rounded font-mono text-sm"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-neutral-900 text-white rounded text-sm font-medium hover:bg-neutral-800"
            >
              Copy
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-neutral-200 text-red-600 rounded text-sm hover:bg-neutral-50"
            >
              Delete
            </button>
          </div>
          <p className="text-neutral-400 text-xs mt-2">
            Auto-deletes in 24 hours • {requests.length} requests received
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Requests</h2>
            {requests.length === 0 ? (
              <p className="text-neutral-400 text-sm">
                No requests yet. Send a request to your hook URL.
              </p>
            ) : (
              <div className="space-y-2">
                {requests.map((request) => (
                  <button
                    key={request.id}
                    onClick={() => setSelectedRequest(request)}
                    className={`w-full text-left p-3 border rounded transition-colors ${
                      selectedRequest?.id === request.id
                        ? 'border-neutral-900 bg-neutral-50'
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-mono text-xs font-semibold ${formatMethod(request.method)}`}>
                        {request.method}
                      </span>
                      <span className="text-xs text-neutral-600 truncate">
                        {request.path}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-400">
                      {new Date(request.createdAt).toLocaleTimeString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Request Details</h2>
            {selectedRequest ? (
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-neutral-400 mb-1">Method</div>
                  <div className={`font-mono font-semibold ${formatMethod(selectedRequest.method)}`}>
                    {selectedRequest.method}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-neutral-400 mb-1">Path</div>
                  <div className="font-mono text-sm">{selectedRequest.path}</div>
                </div>

                {selectedRequest.query && Object.keys(selectedRequest.query).length > 0 && (
                  <div>
                    <div className="text-xs text-neutral-400 mb-1">Query Parameters</div>
                    <SyntaxHighlighter language="json" style={vscDarkPlus}>
                      {JSON.stringify(selectedRequest.query, null, 2)}
                    </SyntaxHighlighter>
                  </div>
                )}

                <div>
                  <div className="text-xs text-neutral-400 mb-1">Headers</div>
                  <SyntaxHighlighter language="json" style={vscDarkPlus}>
                    {JSON.stringify(selectedRequest.headers, null, 2)}
                  </SyntaxHighlighter>
                </div>

                {selectedRequest.body && (
                  <div>
                    <div className="text-xs text-neutral-400 mb-1">Body</div>
                    <SyntaxHighlighter language="json" style={vscDarkPlus}>
                      {JSON.stringify(selectedRequest.body, null, 2)}
                    </SyntaxHighlighter>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-neutral-400 text-sm">
                Select a request to view details
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}