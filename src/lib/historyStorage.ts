export type HistoryType = 'hymn' | 'bible' | 'egw';

export interface HistoryItem {
  id: string;
  type: HistoryType;
  title: string;
  subtitle?: string;
  reference: string;
  snippet?: string;
  timestamp: number;
  metadata: {
    // Hymn metadata
    hymnId?: string;
    collection?: string;
    hymnNumber?: number;
    // Bible metadata
    bookId?: string;
    bookName?: string;
    chapter?: number;
    version?: string;
    // EGW metadata
    bookCode?: string;
    bookTitle?: string;
    chapterNumber?: number;
    paragraphReference?: string;
  };
}

const HISTORY_KEY = 'hoh_reading_history_v1';
const MAX_HISTORY_ITEMS = 100;

export function getHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load history:', err);
    return [];
  }
}

export function addHistoryItem(item: Omit<HistoryItem, 'id' | 'timestamp'>): HistoryItem {
  try {
    const existing = getHistory();
    // Build a unique key to prevent duplicate adjacent entries
    const itemKey = `${item.type}_${item.reference}_${item.metadata.version || ''}_${item.metadata.collection || ''}`.toLowerCase();

    // Filter out existing identical items
    const filtered = existing.filter((hist) => {
      const histKey = `${hist.type}_${hist.reference}_${hist.metadata.version || ''}_${hist.metadata.collection || ''}`.toLowerCase();
      return histKey !== itemKey;
    });

    const newItem: HistoryItem = {
      ...item,
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    };

    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return newItem;
  } catch (err) {
    console.error('Failed to save history item:', err);
    return {
      ...item,
      id: `hist_${Date.now()}`,
      timestamp: Date.now(),
    };
  }
}

export function removeHistoryItem(id: string): void {
  try {
    const existing = getHistory();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to remove history item:', err);
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (err) {
    console.error('Failed to clear history:', err);
  }
}
