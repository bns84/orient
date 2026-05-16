/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module '*.wasm?url' {
  const url: string;
  export default url;
}

declare module 'sql.js/dist/sql-wasm-browser.js' {
  import type { SqlJsStatic } from 'sql.js';
  export default function initSqlJs(config?: {
    locateFile?: (file: string) => string;
  }): Promise<SqlJsStatic>;
}

declare module 'sql.js/dist/sql-wasm.js' {
  import type { SqlJsStatic } from 'sql.js';
  export default function initSqlJs(config?: {
    locateFile?: (file: string) => string;
  }): Promise<SqlJsStatic>;
}

interface ImportMetaEnv {
  readonly VITE_AI_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
