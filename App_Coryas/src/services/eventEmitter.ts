// ============================================================
// EVENT EMITTER - Communication entre modules (api.ts ↔ AuthContext.tsx)
// ============================================================
// React Native n'a pas window.dispatchEvent comme le navigateur.
// Ce module fournit un simple pub/sub pour que api.ts puisse
// notifier AuthContext quand un 401 est reçu, sans créer de
// dépendance circulaire.
// ============================================================

type Listener = (...args: any[]) => void;

const listeners: Record<string, Listener[]> = {};

/**
 * emit : déclenche un événement
 */
export function emit(event: string, ...args: any[]) {
  (listeners[event] || []).forEach((fn) => fn(...args));
}

/**
 * on : s'abonne à un événement
 * Retourne une fonction de désabonnement
 */
export function on(event: string, fn: Listener): () => void {
  if (!listeners[event]) {
    listeners[event] = [];
  }
  listeners[event].push(fn);
  return () => {
    listeners[event] = (listeners[event] || []).filter((l) => l !== fn);
  };
}

/**
 * off : se désabonne d'un événement
 */
export function off(event: string, fn: Listener) {
  listeners[event] = (listeners[event] || []).filter((l) => l !== fn);
}
