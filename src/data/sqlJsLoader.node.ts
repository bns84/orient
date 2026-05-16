import type { SqlJsStatic } from 'sql.js';
import initSqlJsModule from 'sql.js/dist/sql-wasm.js';
import { resolveInitSqlJs } from './resolveInitSqlJs';

export async function loadSqlJsNode(): Promise<SqlJsStatic> {
  const initSqlJs = resolveInitSqlJs(initSqlJsModule);
  const { join } = await import('path');
  const wasmPath = join(process.cwd(), 'node_modules/sql.js/dist/sql-wasm.wasm');
  return initSqlJs({ locateFile: () => wasmPath });
}
