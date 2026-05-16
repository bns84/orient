import type { SqlJsStatic } from 'sql.js';
import initSqlJsModule from 'sql.js/dist/sql-wasm-browser.js';
import wasmUrl from 'sql.js/dist/sql-wasm-browser.wasm?url';
import { resolveInitSqlJs } from './resolveInitSqlJs';

export async function loadSqlJsBrowser(): Promise<SqlJsStatic> {
  const initSqlJs = resolveInitSqlJs(initSqlJsModule);
  return initSqlJs({
    locateFile: (file: string) => (file.endsWith('.wasm') ? wasmUrl : file),
  });
}
