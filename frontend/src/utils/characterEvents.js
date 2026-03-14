const listeners = new Set()

export function emitCharacterEvent(eventName) {
  listeners.forEach(cb => cb(eventName))
}

export function onCharacterEvent(callback) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}
