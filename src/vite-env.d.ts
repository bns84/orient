/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module '*.wasm?url' {
  const url: string;
  export default url;
}

declare module 'sql.js/dist/sql-wasm-browser.js' {
  const initSqlJs: unknown;
  export default initSqlJs;
}

declare module 'sql.js/dist/sql-wasm.js' {
  const initSqlJs: unknown;
  export default initSqlJs;
}

interface ImportMetaEnv {
  readonly VITE_AI_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
