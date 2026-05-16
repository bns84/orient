import type { SqlJsStatic } from 'sql.js';

export async function loadSqlJsNode(): Promise<SqlJsStatic> {
  const initSqlJs = (await import('sql.js/dist/sql-wasm.js')).default;
  const { join } = await import('path');
  const wasmPath = join(process.cwd(), 'node_modules/sql.js/dist/sql-wasm.wasm');
  const module = await initSqlJs({ locateFile: () => wasmPath });
  return module as SqlJsStatic;
}
