import { useState, useEffect } from 'react';
import { Hymn, HymnalCollection } from '../types';
import { HYMNS_DATA } from '../data/hymnsData';

/**
 * Normalizes hymns whose stanzas might be collapsed into a single stanza with multiple lines
 * into clean, separate stanzas and refrains for card display and slide generation.
 */
export function normalizeHymn(hymn: Hymn): Hymn {
  if (!hymn || !hymn.stanzas || hymn.stanzas.length === 0) return hymn;
  if (hymn.stanzas.length > 1) return hymn;

  const rawLines = hymn.stanzas[0].lines;
  if (!rawLines || rawLines.length <= 1) return hymn;

  const newStanzas: Hymn['stanzas'] = [];
  let verseIndex = 1;
  let refrainIndex = 1;

  for (let i = 0; i < rawLines.length; i++) {
    const raw = rawLines[i]?.trim();
    if (!raw) continue;

    const isRefrain = /^(refrain|chorus)\b/i.test(raw);
    const numMatch = raw.match(/^([1-9]\d*)\.?\s*/);

    let stanzaNumber: number;
    const stanzaType = isRefrain ? 'refrain' : 'verse';

    if (isRefrain) {
      stanzaNumber = refrainIndex++;
    } else if (numMatch) {
      stanzaNumber = parseInt(numMatch[1], 10);
      verseIndex = stanzaNumber + 1;
    } else {
      stanzaNumber = verseIndex++;
    }

    const cleaned = raw
      .replace(/^(refrain|chorus):?\s*/i, '')
      .replace(/^([1-9]\d*)\.?\s*/, '')
      .replace(/^[:\s-]+/, '')
      .replace(/,([A-Za-z])/g, ', $1')
      .replace(/:([A-Za-z])/g, ': $1')
      .replace(/;([A-Za-z])/g, '; $1')
      .replace(/!([A-Za-z])/g, '! $1')
      .replace(/\?([A-Za-z])/g, '? $1')
      .replace(/\s+/g, ' ')
      .trim();

    let lines: string[] = [];
    if (cleaned.includes('\n')) {
      lines = cleaned.split('\n').map((s) => s.trim()).filter(Boolean);
    } else {
      const parts = cleaned.split(/(?<=[,;:!?])\s+(?=[A-Z])/);
      lines = parts.map((p) => p.trim().replace(/^[:\s-]+/, '')).filter(Boolean);
    }

    if (lines.length === 0 && cleaned) {
      lines = [cleaned];
    }

    newStanzas.push({
      number: stanzaNumber,
      type: stanzaType,
      lines,
    });
  }

  if (newStanzas.length > 0) {
    return { ...hymn, stanzas: newStanzas };
  }
  return hymn;
}

let loadedFullHymns: Hymn[] = HYMNS_DATA.map(normalizeHymn);
let isFullHymnsLoaded = false;
let isLoadingPromise: Promise<Hymn[]> | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

/**
 * Loads the complete 2,100+ hymns and responsive readings across all collections:
 * - SDAH (1–695)
 * - SDAH-EXT (1–925 complete with categories and responsive readings)
 * - NZK (1–220)
 * - NCA (1–250)
 * and merges them with curated chorded entries and cross-language links.
 */
export async function loadFullHymnCatalog(): Promise<Hymn[]> {
  if (isFullHymnsLoaded) {
    return loadedFullHymns;
  }
  if (isLoadingPromise) {
    return isLoadingPromise;
  }

  isLoadingPromise = (async () => {
    try {
      const [sdahRes, sdahExtRes, nzkRes, ncaRes] = await Promise.all([
        fetch('/data/sdah.json').then((r) => (r.ok ? r.json() : [])),
        fetch('/data/sdah_ext.json').then((r) => (r.ok ? r.json() : [])),
        fetch('/data/nzk.json').then((r) => (r.ok ? r.json() : [])),
        fetch('/data/nca.json').then((r) => (r.ok ? r.json() : [])),
      ]);

      const mergedMap = new Map<string, Hymn>();

      // 1. Put base hymns in first
      const allExtracted: Hymn[] = [
        ...(sdahRes || []),
        ...(sdahExtRes || []),
        ...(nzkRes || []),
        ...(ncaRes || []),
      ];

      for (const hymn of allExtracted) {
        if (hymn && hymn.id) {
          mergedMap.set(hymn.id, normalizeHymn(hymn));
        }
      }

      // 2. Overlay curated hymns (which have chord annotations, musical keys, cross-references)
      for (const hymn of HYMNS_DATA) {
        if (hymn && hymn.id) {
          mergedMap.set(hymn.id, hymn);
          // Also sync chord and crossRef metadata to corresponding SDAH-EXT entry if it's SDAH
          if (hymn.collection === 'SDAH') {
            const extId = `sdah-ext-${hymn.number}`;
            const extHymn = mergedMap.get(extId);
            if (extHymn) {
              mergedMap.set(extId, {
                ...extHymn,
                key: hymn.key || extHymn.key,
                meter: hymn.meter || extHymn.meter,
                author: hymn.author || extHymn.author,
                composer: hymn.composer || extHymn.composer,
                tune: hymn.tune || extHymn.tune,
                scriptureReference: hymn.scriptureReference || extHymn.scriptureReference,
                hasChords: hymn.hasChords ?? extHymn.hasChords,
                crossReferences: hymn.crossReferences || extHymn.crossReferences,
                stanzas: hymn.stanzas || extHymn.stanzas,
              });
            }
          }
        }
      }

      // 3. Bidirectional cross-reference sync for SDAH <-> SDAH-EXT <-> NZK <-> NCA
      for (const hymn of mergedMap.values()) {
        if (hymn.collection === 'SDAH' && hymn.crossReferences) {
          const extHymn = mergedMap.get(`sdah-ext-${hymn.number}`);
          if (extHymn && !extHymn.crossReferences) {
            extHymn.crossReferences = hymn.crossReferences;
          }
        }
      }

      loadedFullHymns = Array.from(mergedMap.values());
      isFullHymnsLoaded = true;
      notifyListeners();
      return loadedFullHymns;
    } catch (err) {
      console.warn('Could not load full hymn catalog files:', err);
      return loadedFullHymns;
    } finally {
      isLoadingPromise = null;
    }
  })();

  return isLoadingPromise;
}

/**
 * Returns current snapshot of all hymns
 */
export function getAllLoadedHymns(): Hymn[] {
  return loadedFullHymns;
}

/**
 * React hook that gives access to the full extracted hymn catalog
 * and automatically re-renders when the full catalog finishes loading.
 */
export function useHymnCatalog() {
  const [hymns, setHymns] = useState<Hymn[]>(loadedFullHymns);
  const [isLoaded, setIsLoaded] = useState<boolean>(isFullHymnsLoaded);

  useEffect(() => {
    // If not loaded, trigger load
    if (!isFullHymnsLoaded) {
      loadFullHymnCatalog().then((catalog) => {
        setHymns(catalog);
        setIsLoaded(true);
      });
    }

    const handleChange = () => {
      setHymns(loadedFullHymns);
      setIsLoaded(isFullHymnsLoaded);
    };

    listeners.add(handleChange);
    return () => {
      listeners.delete(handleChange);
    };
  }, []);

  return {
    hymns,
    isLoaded,
    totalCount: hymns.length,
    getHymnsByCollection: (collection: HymnalCollection) =>
      hymns.filter((h) => h.collection === collection),
  };
}
