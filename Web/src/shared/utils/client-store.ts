type Listener = () => void;

export interface ClientStore<T> {
  subscribe: (listener: Listener) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  emit: () => void;
}

export const createClientStore = <T>(
  read: () => T,
  serverValue: T,
): ClientStore<T> => {
  const listeners = new Set<Listener>();

  const emit = () => listeners.forEach((listener) => listener());

  return {
    subscribe: (listener) => {
      listeners.add(listener);
      globalThis.addEventListener("storage", listener);
      return () => {
        listeners.delete(listener);
        globalThis.removeEventListener("storage", listener);
      };
    },
    getSnapshot: read,
    getServerSnapshot: () => serverValue,
    emit,
  };
};
