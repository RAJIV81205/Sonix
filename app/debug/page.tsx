'use client';

import { useState } from 'react';

export default function JioSaavnDebugger() {
  const [query, setQuery] = useState('espresso');
  const [results, setResults] = useState<any[]>([]);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setResults([]);
    setDiagnostics(null);
    
    try {
      const response = await fetch('/api/debug-jiosaavn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch results');
      }
      
      setResults(data.results || []);
      setDiagnostics(data.diagnostics || null);
    } catch (err) {
      // Handle the error properly with type checking
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">JioSaavn API Debugger</h1>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded"
          placeholder="Search term (e.g., espresso)"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      
      {error && (
        <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {diagnostics && (
        <div className="p-4 mb-4 bg-blue-50 border border-blue-200 rounded">
          <p className="font-bold mb-2">Diagnostics</p>
          <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-2 rounded">
            {JSON.stringify(diagnostics, null, 2)}
          </pre>
        </div>
      )}
      
      {results.length > 0 ? (
        <div>
          <h2 className="text-xl font-semibold mb-2">Results ({results.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((item, index) => (
              <div key={index} className="border rounded p-3 flex gap-3">
                {item.image && (
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/api/placeholder/64/64';
                    }}
                  />
                )}
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-gray-600">{item.more_info?.singers || item.subtitle || 'Unknown Artist'}</p>
                  <p className="text-xs text-gray-500">Type: {item.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : !loading && (
        <p className="text-gray-500">No results to display. Try searching for something.</p>
      )}
    </div>
  );
}