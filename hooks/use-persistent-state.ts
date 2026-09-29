"use client"

import { useEffect, useState, type Dispatch, type SetStateAction } from "react"

const STORAGE_PREFIX = "twin:v1:"

export function usePersistentState<T>(key: string, initial: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
  const storageKey = STORAGE_PREFIX + key
  const [value, setValue] = useState<T>(initial)
  const [hydrated, setHydrated] = useState(false)

  // Hydrate after mount so server and first client render match.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (raw !== null) setValue(JSON.parse(raw) as T)
    } catch {
      // Corrupt or inaccessible storage: keep the default.
    }
    setHydrated(true)
  }, [storageKey])

  // Gated on `hydrated` so the default value never overwrites saved data on first mount.
  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(value))
    } catch {
      // Quota exceeded or private mode: persistence is best-effort.
    }
  }, [hydrated, storageKey, value])

  return [value, setValue]
}

export function clearPersistentState() {
  Object.keys(window.localStorage)
    .filter((k) => k.startsWith(STORAGE_PREFIX))
    .forEach((k) => window.localStorage.removeItem(k))
}
