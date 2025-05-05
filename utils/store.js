// Simple in-memory store for server-side sessions
const store = new Map();

export function set(id, value) {
  store.set(id, value);
}

export function get(id) {
  return store.get(id);
}

export function has(id) {
  return store.has(id);
}

export function remove(id) {
  store.delete(id);
}