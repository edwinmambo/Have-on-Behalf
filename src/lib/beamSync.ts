import { BeamSlide, BeamTheme, BeamFont } from '../types';

export interface ActiveBeamState {
  isOpen: boolean;
  title: string;
  subtitle: string;
  sourceBadge: string;
  slides: BeamSlide[];
  currentIndex: number;
  theme: BeamTheme;
  font: BeamFont;
  fontScale: number;
  isBlackout: boolean;
  isTextCleared: boolean;
  sessionTitle?: string;
  updatedAt: number;
}

const STORAGE_KEY = 'haveonbehalf_active_beam';
const HEARTBEAT_KEY = 'haveonbehalf_beam_heartbeat';
const CHANNEL_NAME = 'haveonbehalf_beam_channel';

let channel: BroadcastChannel | null = null;
function getChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  if (!channel && 'BroadcastChannel' in window) {
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
    } catch {
      channel = null;
    }
  }
  return channel;
}

export function getBeamProjectorUrl(): string {
  if (typeof window === 'undefined') return '?beam=projector';
  return `${window.location.origin}${window.location.pathname}?beam=projector`;
}

export function getStoredBeamState(): ActiveBeamState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearStoredBeamState(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear beam state from localStorage:', e);
  }
}

export function broadcastBeamState(state: ActiveBeamState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save beam state to localStorage:', e);
  }

  const bc = getChannel();
  if (bc) {
    try {
      bc.postMessage({ type: 'BEAM_STATE_UPDATE', payload: state });
    } catch (e) {
      console.warn('Could not post to BroadcastChannel:', e);
    }
  }
}

/**
 * Projector Screen calls this periodically to announce it is open and active
 */
export function broadcastBeamHeartbeat(): void {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  try {
    localStorage.setItem(HEARTBEAT_KEY, String(now));
  } catch {
    // ignore
  }

  const bc = getChannel();
  if (bc) {
    try {
      bc.postMessage({ type: 'BEAM_HEARTBEAT', timestamp: now });
    } catch {
      // ignore
    }
  }
}

/**
 * Controller listens to heartbeats to know whether the projector window is currently alive
 */
export function listenToBeamHeartbeat(callback: (timestamp: number) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleBroadcast = (event: MessageEvent) => {
    if (event.data && event.data.type === 'BEAM_HEARTBEAT') {
      callback(event.data.timestamp || Date.now());
    }
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === HEARTBEAT_KEY && event.newValue) {
      callback(Number(event.newValue) || Date.now());
    }
  };

  const bc = getChannel();
  if (bc) {
    bc.addEventListener('message', handleBroadcast);
  }
  window.addEventListener('storage', handleStorage);

  return () => {
    if (bc) {
      bc.removeEventListener('message', handleBroadcast);
    }
    window.removeEventListener('storage', handleStorage);
  };
}

/**
 * Newly opened Projector Screen requests the main window to re-send active state
 */
export function requestBeamStateSync(): void {
  const bc = getChannel();
  if (bc) {
    try {
      bc.postMessage({ type: 'REQUEST_BEAM_STATE_SYNC' });
    } catch {
      // ignore
    }
  }
}

/**
 * Main window listens for sync requests and responds with current active beam state
 */
export function listenToSyncRequests(onRequest: () => void): () => void {
  const bc = getChannel();
  if (!bc) return () => {};

  const handleMsg = (event: MessageEvent) => {
    if (event.data && event.data.type === 'REQUEST_BEAM_STATE_SYNC') {
      onRequest();
    }
  };

  bc.addEventListener('message', handleMsg);
  return () => {
    bc.removeEventListener('message', handleMsg);
  };
}

export function listenToBeamUpdates(callback: (state: ActiveBeamState) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleBroadcast = (event: MessageEvent) => {
    if (event.data && event.data.type === 'BEAM_STATE_UPDATE' && event.data.payload) {
      callback(event.data.payload as ActiveBeamState);
    }
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        callback(parsed);
      } catch {
        // ignore
      }
    }
  };

  const bc = getChannel();
  if (bc) {
    bc.addEventListener('message', handleBroadcast);
  }
  window.addEventListener('storage', handleStorage);

  return () => {
    if (bc) {
      bc.removeEventListener('message', handleBroadcast);
    }
    window.removeEventListener('storage', handleStorage);
  };
}

export function openBeamSecondScreen(): { success: boolean; windowRef: Window | null; url: string } {
  const url = getBeamProjectorUrl();
  if (typeof window === 'undefined') return { success: false, windowRef: null, url };

  try {
    const win = window.open(
      url,
      'HaveOnBehalfProjector',
      'width=1280,height=720,menubar=no,toolbar=no,location=no,status=no,resizable=yes'
    );
    if (win) {
      win.focus();
      return { success: true, windowRef: win, url };
    }
    return { success: false, windowRef: null, url };
  } catch {
    return { success: false, windowRef: null, url };
  }
}
