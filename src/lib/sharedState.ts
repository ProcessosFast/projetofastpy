import * as React from 'react'

// Estado compartilhado entre todos que abrem o portal (Redis via /api/state).
// O localStorage continua como cache: a tela abre na hora e funciona sem rede.

type Item = unknown
type Collection = Record<string, Item>
type Data = Record<string, Collection>

export type SyncStatus = 'carregando' | 'online' | 'offline'

interface Registration {
  localKey: string
  initial: Collection
}

// Mesmas coleções aceitas por api/state.js.
const KNOWN_COLLECTIONS = ['checked', 'status', 'deadlines', 'owners', 'choices', 'lists', 'decisions']

const registry = new Map<string, Registration>()
const listeners = new Map<string, Set<(value: Collection) => void>>()
const statusListeners = new Set<(status: SyncStatus) => void>()
const migrations: ((data: Data) => void)[] = []

let status: SyncStatus = 'carregando'
let serverData: Data | null = null
let started = false
let lastLocalWrite = 0
let pending: Data = {}
let flushTimer: ReturnType<typeof setTimeout> | undefined

function setStatus(next: SyncStatus) {
  status = next
  statusListeners.forEach((fn) => fn(next))
}

function readLocal(localKey: string, initial: Collection): Collection {
  try {
    const stored = window.localStorage.getItem(localKey)
    return stored !== null ? (JSON.parse(stored) as Collection) : initial
  } catch {
    return initial
  }
}

function writeLocal(localKey: string, value: Collection) {
  try {
    window.localStorage.setItem(localKey, JSON.stringify(value))
  } catch {
    // storage unavailable — ignore
  }
}

function applyServerData(data: Data) {
  serverData = data
  registry.forEach(({ localKey }, collection) => {
    const value = data[collection] ?? {}
    writeLocal(localKey, value)
    listeners.get(collection)?.forEach((fn) => fn(value))
  })
}

/** Ajustes aplicados uma única vez nos dados locais antes de subir para o banco. */
export function registerMigration(fn: (data: Data) => void) {
  migrations.push(fn)
}

async function pull() {
  const startedAt = Date.now()
  try {
    const res = await fetch('/api/state', { cache: 'no-store' })
    if (!res.ok) throw new Error(String(res.status))
    let payload = (await res.json()) as { initialized: boolean; data: Data }

    if (!payload.initialized) {
      const local: Data = {}
      registry.forEach(({ localKey, initial }, collection) => {
        local[collection] = readLocal(localKey, initial)
      })
      for (const name of KNOWN_COLLECTIONS) local[name] ??= {}
      migrations.forEach((fn) => fn(local))
      const init = await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ init: local }),
      })
      if (!init.ok) throw new Error(String(init.status))
      payload = await init.json()
    }

    // Ignora a leitura se houve edição local enquanto ela estava em andamento.
    if (startedAt >= lastLocalWrite && Object.keys(pending).length === 0) {
      applyServerData(payload.data)
    }
    setStatus('online')
  } catch {
    setStatus('offline')
  }
}

async function flush() {
  flushTimer = undefined
  const patches = pending
  pending = {}
  if (!Object.keys(patches).length) return
  try {
    const res = await fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patches }),
    })
    if (!res.ok) throw new Error(String(res.status))
    lastLocalWrite = Date.now()
    setStatus('online')
  } catch {
    // Devolve para a fila e tenta de novo depois.
    for (const [collection, items] of Object.entries(patches)) {
      pending[collection] = { ...items, ...pending[collection] }
    }
    setStatus('offline')
    flushTimer = setTimeout(flush, 10_000)
  }
}

function queue(collection: string, patch: Collection) {
  lastLocalWrite = Date.now()
  pending[collection] = { ...pending[collection], ...patch }
  if (flushTimer) clearTimeout(flushTimer)
  flushTimer = setTimeout(flush, 400)
}

function start() {
  if (started) return
  started = true
  // Espera todos os componentes registrarem suas coleções antes da primeira leitura.
  setTimeout(pull, 0)
  setInterval(() => {
    if (document.visibilityState === 'visible') void pull()
  }, 20_000)
  window.addEventListener('focus', () => void pull())
}

function diff(prev: Collection, next: Collection): Collection {
  const patch: Collection = {}
  for (const key of Object.keys(next)) {
    if (JSON.stringify(prev[key]) !== JSON.stringify(next[key])) patch[key] = next[key]
  }
  for (const key of Object.keys(prev)) {
    if (!(key in next)) patch[key] = null
  }
  return patch
}

export function useSharedRecord<V>(collection: string, localKey: string, initial: Record<string, V>) {
  if (!registry.has(collection)) registry.set(collection, { localKey, initial })

  const [value, setValue] = React.useState<Record<string, V>>(
    () => (serverData?.[collection] ?? readLocal(localKey, initial)) as Record<string, V>,
  )
  const ref = React.useRef(value)

  React.useEffect(() => {
    const listener = (next: Collection) => {
      ref.current = next as Record<string, V>
      setValue(next as Record<string, V>)
    }
    let set = listeners.get(collection)
    if (!set) listeners.set(collection, (set = new Set()))
    set.add(listener)
    start()
    return () => {
      set.delete(listener)
    }
  }, [collection])

  const update = React.useCallback(
    (fn: (prev: Record<string, V>) => Record<string, V>) => {
      const prev = ref.current
      const next = fn(prev)
      const patch = diff(prev, next)
      if (!Object.keys(patch).length) return
      ref.current = next
      setValue(next)
      writeLocal(localKey, next)
      // mantém outras instâncias da mesma coleção alinhadas
      listeners.get(collection)?.forEach((l) => l(next))
      queue(collection, patch)
    },
    [collection, localKey],
  )

  return [value, update] as const
}

export function useSyncStatus() {
  const [value, setValue] = React.useState(status)
  React.useEffect(() => {
    statusListeners.add(setValue)
    return () => {
      statusListeners.delete(setValue)
    }
  }, [])
  return value
}
