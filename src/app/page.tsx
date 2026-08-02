'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function Home() {
  const [status, setStatus] = useState<string>('Connecting to Rayvice Engine...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Backend connection check
    api.get('/') 
      .then((res) => {
        setStatus(`Connected! Server Response: ${JSON.stringify(res.data)}`);
      })
      .catch((err) => {
        // Agar 404 bhi milta hai, matlab CORS pass ho gaya aur request backend tak pahocha
        if (err.response) {
          setStatus(`Connected! Response: ${JSON.stringify(err.response.data)}`);
        } else {
          setError(err.message || 'Failed to connect');
        }
      });
  }, []);

  return (
    <main className="min-h-screen bg-slate-900 text-white p-8 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Rayvice AI Receptionist</h1>
      <div className="p-6 bg-slate-800 rounded-lg border border-slate-700 max-w-lg w-full">
        <h2 className="text-lg font-semibold mb-2">Backend Connection Status:</h2>
        {error ? (
          <p className="text-red-400 font-mono">Error: {error}</p>
        ) : (
          <p className="text-green-400 font-mono">{status}</p>
        )}
      </div>
    </main>
  );
}










