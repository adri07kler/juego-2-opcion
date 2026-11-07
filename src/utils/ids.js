export function createId(prefix = 'id') {
  const random =
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  return `${prefix}_${random}`
}

export function nowIso() {
  return new Date().toISOString()
}
