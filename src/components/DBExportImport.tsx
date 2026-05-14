/**
 * ORIENT - DB Export/Import Component
 * 
 * Debug-Tool für DB-Export/Import.
 * 
 * Respektiert ORIENT_DNA:
 * - Transparenz (alle Daten sichtbar)
 * - Local-first (Export lokal)
 */

import React, { useRef } from 'react';
import { exportDB, importDB } from '../db/exportImport';

export function DBExportImport() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    const data = await exportDB();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orient-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importDB(data);
      alert('Import successful!');
    } catch (err) {
      alert(`Import failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 13, opacity: 0.85 }}>DB Export / Import</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleExport}
          style={{
            borderRadius: 12,
            padding: '8px 12px',
            border: '1px solid rgba(255,255,255,0.18)',
            background: 'rgba(255,255,255,0.08)',
            color: 'white',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          Export JSON
        </button>
        <label
          style={{
            borderRadius: 12,
            padding: '8px 12px',
            border: '1px solid rgba(255,255,255,0.18)',
            background: 'rgba(255,255,255,0.08)',
            color: 'white',
            cursor: 'pointer',
            fontSize: 12,
            display: 'inline-block',
          }}
        >
          Import JSON
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </label>
      </div>
      <div style={{ fontSize: 11, opacity: 0.6 }}>
        Export includes: kv, events, voice meta (no blobs)
      </div>
    </div>
  );
}
