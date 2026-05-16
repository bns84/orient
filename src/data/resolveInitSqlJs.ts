import type { SqlJsStatic } from 'sql.js';

export type InitSqlJsFn = (config?: {
  locateFile?: (file: string, prefix?: string) => string;
}) => Promise<SqlJsStatic>;

/** CJS/ESM-Interop: Vite liefert default manchmal als verschachteltes Objekt */
export function resolveInitSqlJs(moduleExports: unknown): InitSqlJsFn {
  if (typeof moduleExports === 'function') {
    return moduleExports as InitSqlJsFn;
  }
  if (moduleExports && typeof moduleExports === 'object') {
    const rec = moduleExports as Record<string, unknown>;
    if (typeof rec.default === 'function') {
      return rec.default as InitSqlJsFn;
    }
    if (
      rec.default &&
      typeof rec.default === 'object' &&
      typeof (rec.default as Record<string, unknown>).default === 'function'
    ) {
      return (rec.default as Record<string, unknown>).default as InitSqlJsFn;
    }
  }
  throw new Error('sql.js: initSqlJs export not found');
}
