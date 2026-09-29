"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type Dispatch, type SetStateAction } from "react"

const STORAGE_PREFIX = "twin:v1:"

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

function readValue<T>(storageKey: string): { found: true; value: T } | { found: false } {
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

/**
 * useState that persists to localStorage.
 * The server and the first client render always use `initial`, so markup matches and no
 * hydration mismatch occurs; saved data is loaded after mount, then every change is saved.
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
    // An edit made before loading finished is newer than what's on disk, so keep it.
    if (!touchedBeforeHydration.current) {
      const saved = readValue<T>(storageKey)
      if (saved.found) setValueState(saved.value)
    }
    hydratedRef.current = true
    setHydrated(true)
  }, [storageKey])

  useEffect(() => {
    if (!hydrated) return
    const storage = getStorage()
    if (!storage) return
    try {
      storage.setItem(storageKey, JSON.stringify(value))
    } catch {
      // Quota exceeded: persistence is best-effort.
    }
  }, [hydrated, storageKey, value])

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

export function clearPersistentState() {
  const storage = getStorage()
  if (!storage) return
  Object.keys(storage)
    .filter((k) => k.startsWith(STORAGE_PREFIX))
    .forEach((k) => storage.removeItem(k))
}
