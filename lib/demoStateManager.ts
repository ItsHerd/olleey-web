// LocalStorage-based state management for demo
interface DemoVideoState {
  videoId: string;
  jobId: string;
  languageCode: string;
  status: 'queued' | 'processing' | 'draft' | 'live';
  lastUpdated: string;
}

export class DemoStateManager {
  private static STORAGE_KEY = 'olleey_demo_states';
  
  static getState(videoId: string, languageCode: string): DemoVideoState | null {
    const states = this.getAllStates();
    return states.find(s => s.videoId === videoId && s.languageCode === languageCode) || null;
  }
  
  static setState(state: DemoVideoState): void {
    const states = this.getAllStates().filter(
      s => !(s.videoId === state.videoId && s.languageCode === state.languageCode)
    );
    states.push({ ...state, lastUpdated: new Date().toISOString() });
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(states));
    
    // Trigger storage event for cross-tab sync
    window.dispatchEvent(new CustomEvent('demo-state-updated', { detail: state }));
  }
  
  static getAllStates(): DemoVideoState[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }
  
  static clearStates(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
