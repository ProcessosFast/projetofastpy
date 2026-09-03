const DB_NAME = 'py-portal-files'
const STORE_NAME = 'files'
const DB_VERSION = 1

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export interface StoredFile {
  blob: Blob
  name: string
  type: string
  size: number
}

export async function saveFile(key: string, file: File): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(
      { blob: file, name: file.name, type: file.type, size: file.size },
      key,
    )
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getFile(key: string): Promise<StoredFile | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(key)
    req.onsuccess = () => resolve(req.result ?? null)
    req.onerror = () => reject(req.error)
  })
}

export async function deleteFile(key: string): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

declare global {
  interface Window {
    claude?: { use: (name: string) => Promise<unknown> }
  }
}

interface DownloadsCapability {
  save: (req: { filename: string; data: Blob }) => Promise<{ status: 'saved' }>
}

export async function downloadFile(key: string): Promise<boolean> {
  const stored = await getFile(key)
  if (!stored) return false

  // Inside a published Artifact, direct <a download> links are inert —
  // use the platform's `downloads` capability instead when available.
  if (window.claude?.use) {
    try {
      const downloads = (await window.claude.use('downloads')) as DownloadsCapability | null
      if (downloads) {
        await downloads.save({ filename: stored.name, data: stored.blob })
        return true
      }
    } catch {
      // fall through to the direct-link approach (declined, unavailable, etc.)
    }
  }

  const url = URL.createObjectURL(stored.blob)
  const a = document.createElement('a')
  a.href = url
  a.download = stored.name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return true
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
