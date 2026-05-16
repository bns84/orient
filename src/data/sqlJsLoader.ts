/**
 * sql.js WASM — Browser (Vite) und Node (Vitest)
 */

import type { SqlJsStatic } from 'sql.js';

let sqlPromise: Promise<SqlJsStatic> | null = null;

export function loadSqlJs(): Promise<SqlJsStatic> {
  if (!sqlPromise) {
    sqlPromise = (typeof window !== 'undefined'
      ? import('./sqlJsLoader.browser').then((m) => m.loadSqlJsBrowser())
      : import('./sqlJsLoader.node').then((m) => m.loadSqlJsNode())
    ).catch((err) => {
      sqlPromise = null;
      throw err;
    });
  }
  return sqlPromise;
}
