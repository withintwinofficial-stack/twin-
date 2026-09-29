"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type Dispatch, type SetStateAction } from "react"

const STORAGE_PREFIX = "twin:v1:"
const URL_PARAM = "state"
const URL_WRITE_DELAY_MS = 250

const isClient = typeof window !== "undefined"

// useLayoutEffect warns during SSR; on the client it lets saved data replace defaults before first paint.
const useIsomorphicLayoutEffect = isClient ? useLayoutEffect : useEffect

function getStorage(): Storage | null {
  if (!isClient) return null
  try {
    return window.localStorage
  } catch {
    // Some privacy modes throw on access.
    return null
  }
}

function readLocal<T>(storageKey: string): { found: true; value: T } | { found: false } {
  const storage = getStorage()
  if (!storage) return { found: false }
  try {
    const raw = storage.getItem(storageKey)
    if (raw === null) return { found: false }
    return { found: true, value: JSON.parse(raw) as T }
  } catch {
    return { found: false }
  }
}

// URL-safe Base64 over UTF-8 bytes, so task titles with emoji or accents survive the round trip.
function encodeState(data: Record<string, unknown>): string {
  const bytes = new TextEncoder().encode(JSON.stringify(data))
  let binary = ""
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function decodeState(encoded: string): Record<string, unknown> | null {
  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/")
    const binary = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "="))
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes))
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null
  } catch {
    return null
  }
}

/**
 * One shared snapshot of every persisted key, mirrored into `?state=`.
 * Seeded from the URL, then overlaid with localStorage (which wins when present), so keys owned by
 * components that aren't mounted right now are never dropped from the URL backup.
 */
let snapshot: Record<string, unknown> | null = null
let urlWriteTimer: ReturnType<typeof setTimeout> | null = null
let persistenceDisabled = false

function getSnapshot(): Record<string, unknown> {
  if (snapshot) return snapshot
  const fromUrl = isClient ? decodeState(new URLSearchParams(window.location.search).get(URL_PARAM) ?? "") : null
  snapshot = { ...(fromUrl ?? {}) }
  const storage = getStorage()
  if (storage) {
    for (const storageKey of Object.keys(storage)) {
      if (!storageKey.startsWith(STORAGE_PREFIX)) continue
      const saved = readLocal(storageKey)
      if (saved.found) snapshot[storageKey.slice(STORAGE_PREFIX.length)] = saved.value
    }
  }
  return snapshot
}

function scheduleUrlWrite() {
  if (!isClient || persistenceDisabled) return
  if (urlWriteTimer) clearTimeout(urlWriteTimer)
  urlWriteTimer = setTimeout(() => {
    urlWriteTimer = null
    if (persistenceDisabled) return
    const url = new URL(window.location.href)
    url.searchParams.set(URL_PARAM, encodeState(getSnapshot()))
    // Preserve history.state so the Next.js router keeps its entry.
    window.history.replaceState(window.history.state, "", url)
  }, URL_WRITE_DELAY_MS)
}

/**
 * useState that persists to localStorage, with the URL `?state=` param as a backup.
 * The server and first client render always use `initial`, so markup matches and there is no hydration
 * mismatch. After mount it loads localStorage, falls back to the URL if the OS cleared storage, then saves
 * every change to both.
 */
export function usePersistentState<T>(
  key: string,
  initial: T | (() => T),
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const storageKey = STORAGE_PREFIX + key
  const [value, setValueState] = useState<T>(initial)
  const [hydrated, setHydrated] = useState(false)
  const touchedBeforeHydration = useRef(false)
  const hydratedRef = useRef(false)

  const setValue = useCallback<Dispatch<SetStateAction<T>>>((next) => {
    if (!hydratedRef.current) touchedBeforeHydration.current = true
    setValueState(next)
  }, [])

  useIsomorphicLayoutEffect(() => {
    // An edit made before loading finished is newer than anything saved, so keep it.
    if (!touchedBeforeHydration.current) {
      const local = readLocal<T>(storageKey)
      if (local.found) {
        setValueState(local.value)
      } else {
        const backup = getSnapshot()
        if (key in backup) setValueState(backup[key] as T)
      }
    }
    hydratedRef.current = true
    setHydrated(true)
  }, [key, storageKey])

  useEffect(() => {
    if (!hydrated || persistenceDisabled) return
    const storage = getStorage()
    if (storage) {
      try {
        storage.setItem(storageKey, JSON.stringify(value))
      } catch {
        // Quota exceeded: the URL backup still holds the data.
      }
    }
    getSnapshot()[key] = value
    scheduleUrlWrite()
  }, [hydrated, key, storageKey, value])

  // Keep other open tabs in sync.
  useEffect(() => {
    if (!isClient) return
    const onStorage = (e: StorageEvent) => {
      if (e.key !== storageKey || e.newValue === null) return
      try {
        setValueState(JSON.parse(e.newValue) as T)
      } catch {
        // Ignore malformed writes from elsewhere.
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [storageKey])

  return [value, setValue, hydrated]
}

/** Wipes localStorage and the URL backup. Further saves are blocked until the page reloads. */
export function clearPersistentState() {
  persistenceDisabled = true
  if (urlWriteTimer) clearTimeout(urlWriteTimer)
  snapshot = {}
  const storage = getStorage()
  if (storage) {
    Object.keys(storage)
      .filter((k) => k.startsWith(STORAGE_PREFIX))
      .forEach((k) => storage.removeItem(k))
  }
  if (isClient) {
    const url = new URL(window.location.href)
    url.searchParams.delete(URL_PARAM)
    window.history.replaceState(window.history.state, "", url)
  }
}
