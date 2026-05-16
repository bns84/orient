import type { SqlJsStatic } from 'sql.js';

export async function loadSqlJsBrowser(): Promise<SqlJsStatic> {
  const initSqlJs = (await import('sql.js/dist/sql-wasm-browser.js')).default;
  const wasmUrl = (await import('sql.js/dist/sql-wasm-browser.wasm?url')).default;
  const module = await initSqlJs({
    locateFile: (file: string) => (file.endsWith('.wasm') ? wasmUrl : file),
  });
  return module as SqlJsStatic;
}
