import { useState, useEffect } from 'react';
import { Hymn, HymnalCollection } from '../types';
import { HYMNS_DATA } from '../data/hymnsData';
import { resolveHymnCategory } from './hymnGrouping';

/**
 * Normalizes hymns whose stanzas might be collapsed into a single stanza with multiple lines
 * into clean, separate stanzas and refrains for card display and slide generation.
 */
export function normalizeHymn(hymn: Hymn): Hymn {
  if (!hymn) return hymn;
  const category = resolveHymnCategory(hymn);

  if (!hymn.stanzas || hymn.stanzas.length === 0) {
    return { ...hymn, category };
  }

  // Clean and split lines that contain newlines
  const stanzasWithSplitLines = hymn.stanzas.map((st) => {
    const lines: string[] = [];
    for (const l of st.lines || []) {
      if (l.includes('\n')) {
        lines.push(...l.split('\n').map((s) => s.trim()).filter(Boolean));
      } else {
        lines.push(l);
      }
    }
    return { ...st, lines };
  });

  if (stanzasWithSplitLines.length > 1) {
    return { ...hymn, category, stanzas: stanzasWithSplitLines };
  }

  const rawLines = stanzasWithSplitLines[0].lines;
  if (!rawLines || rawLines.length <= 1) return { ...hymn, category, stanzas: stanzasWithSplitLines };

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
    return { ...hymn, category, stanzas: newStanzas };
  }
  return { ...hymn, category, stanzas: stanzasWithSplitLines };
}

let loadedFullHymns: Hymn[] = HYMNS_DATA.map(normalizeHymn);
let isFullHymnsLoaded = false;
let isLoadingPromise: Promise<Hymn[]> | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

/**
 * Loads the complete 5,000+ hymns and responsive readings across all Pan-African collections:
 * - SDAH (English, 1–695)
 * - SDAH-EXT (English, 1–954 complete replica of SDAH + extra African regional hymns)
 * - NZK (Kiswahili, 1–220)
 * - WNY (Dholuo - Wende Nyasaye, 1–332)
 * - OKN (Ekegusii - Ogotera kw'Omonene, 1–370)
 * - NCA (Gĩkũyũ Rĩerũ, 1–299)
 * - NCA-OLD (Gĩkũyũ Rĩkũrũ, 1–149)
 * - KIN (Kinyarwanda - Indirimbo Zo Guhimbaza Imana, 1–500)
 * - CIS (Christ in Song English, 1–300)
 * - KMN (Chichewa - Khristu Mu Nyimbo, 1–350)
 * - ICB (Icibemba - Kristu Mu Nyimbo, 1–311)
 * - SHO (Shona - Kristu MuNzwiyo, 1–300)
 * - UKE (Ndebele/Zulu - UKrestu Esihlabelelweni, 1–300)
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
      const files = [
        '/data/sdah.json',
        '/data/sdah_ext.json',
        '/data/english_sdah_extended_954.json',
        '/data/eng_old.json',
        '/data/cis.json',
        '/data/nzk.json',
        '/data/nca.json',
        '/data/nca_old.json',
        '/data/wny.json',
        '/data/okn.json',
        '/data/kal.json',
        '/data/lug.json',
        '/data/loz.json',
        '/data/nan.json',
        '/data/ton.json',
        '/data/run.json',
        '/data/luo_ug.json',
        '/data/kmn.json',
        '/data/icb.json',
        '/data/kin.json',
        '/data/sho.json',
        '/data/uke.json',
      ];

      const results = await Promise.all(
        files.map((file) =>
          fetch(file)
            .then((r) => (r.ok ? r.json() : null))
            .catch((err) => {
              console.warn(`Failed to fetch ${file}:`, err);
              return null;
            })
        )
      );

      const mergedMap = new Map<string, Hymn>();

      // 1. Put base hymns in first
      for (const dataset of results) {
        if (!dataset) continue;
        const hymnList: Hymn[] = Array.isArray(dataset)
          ? dataset
          : Array.isArray((dataset as any).hymns)
          ? (dataset as any).hymns
          : [];

        for (const hymn of hymnList) {
          if (hymn && hymn.id) {
            mergedMap.set(hymn.id, normalizeHymn(hymn));
          }
        }
      }

      // 2. Overlay curated hymns (which have chord annotations, musical keys, cross-references)
      for (const hymn of HYMNS_DATA) {
        if (hymn && hymn.id) {
          mergedMap.set(hymn.id, hymn);
        }
      }

      // 3. Guarantee SDAH-EXT (1-954) is a complete replica of SDAH (1-695) plus the supplemental hymns (696-954)
      for (const hymn of Array.from(mergedMap.values())) {
        if (hymn.collection === 'SDAH' && hymn.number >= 1 && hymn.number <= 695) {
          const extId = `sdah-ext-${hymn.number}`;
          const existingExt = mergedMap.get(extId);
          mergedMap.set(extId, {
            ...hymn,
            id: extId,
            collection: 'SDAH-EXT',
            category: resolveHymnCategory({ ...hymn, collection: 'SDAH-EXT' }),
            crossReferences: existingExt?.crossReferences || hymn.crossReferences,
          });
        }
      }

      // 4. Ensure all hymns have a resolved category and unify cross-references bidirectionally
      const allHymnsList = Array.from(mergedMap.values());
      const hymnById = new Map<string, Hymn>();
      allHymnsList.forEach((h) => hymnById.set(h.id, h));

      // Build cross-reference relationships
      for (const hymn of allHymnsList) {
        if (hymn.crossReferences && hymn.crossReferences.length > 0) {
          for (const ref of hymn.crossReferences) {
            const targetId = `${ref.collection.toLowerCase()}-${ref.number}`;
            const targetHymn = hymnById.get(targetId);
            if (targetHymn) {
              const backRefs = targetHymn.crossReferences ? [...targetHymn.crossReferences] : [];
              const alreadyHas = backRefs.some(
                (r) => r.collection === hymn.collection && r.number === hymn.number
              );
              if (!alreadyHas) {
                backRefs.push({
                  collection: hymn.collection,
                  number: hymn.number,
                  title: hymn.title,
                });
                targetHymn.crossReferences = backRefs;
                mergedMap.set(targetHymn.id, targetHymn);
              }
            }
          }
        }
      }

      // Final pass to ensure all hymns in memory have resolved categories
      for (const [id, hymn] of mergedMap.entries()) {
        if (!hymn.category || hymn.category === 'All' || hymn.category === 'General') {
          hymn.category = resolveHymnCategory(hymn);
          mergedMap.set(id, hymn);
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
