/**
 * Adresse des Pförtners. Eine von drei Schrauben für den Umzug auf einen anderen Rechner:
 * VITE_ORIENT_SERVER_URL setzen, fertig.
 */
export const DEFAULT_ORIENT_SERVER_URL = 'http://127.0.0.1:8787';

export function orientServerUrl(): string {
  const raw = import.meta.env.VITE_ORIENT_SERVER_URL?.trim();
  return (raw || DEFAULT_ORIENT_SERVER_URL).replace(/\/$/, '');
}
