// Sound Manager for handling audio playback
const STORAGE_KEY = 'logoGames:sound-muted';
const hasLocalStorage = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export class SoundManager {
    constructor() {
        this.sounds = {};
        this.isMuted = false;
        this.lastStoredState = null;
        this.initializeSounds();
        this.loadMuteState();
        if (hasLocalStorage) {
            window.addEventListener('storage', (event) => {
                if (event.key === STORAGE_KEY) {
                    this.syncMuteStateFromStorage();
                }
            });
        }
    }

    initializeSounds() {
        this.sounds = {
            success: new Audio('./sounds/success4.mp3'),
            fail: new Audio('./sounds/fail.mp3'),
            fireworksStart: new Audio('./sounds/fireworks-start.mp3'),
            fireworksExplode: new Audio('./sounds/fireworks-explode.mp3')
        };

        this.applyMuteState();
    }

    playSound(soundName) {
        this.syncMuteStateFromStorage();

        if (this.isMuted) {
            return;
        }

        const audio = this.sounds[soundName];
        if (audio) {
            audio.currentTime = 0;
            const playPromise = audio.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(() => {
                    // Ignore play errors (e.g. autoplay restrictions)
                });
            }
        }
    }

    pauseSound(soundName) {
        this.syncMuteStateFromStorage();

        const audio = this.sounds[soundName];
        if (audio) {
            audio.pause();
        }
    }

    stopSound(soundName) {
        this.syncMuteStateFromStorage();

        const audio = this.sounds[soundName];
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    }

    getSounds() {
        return this.sounds;
    }

    applyMuteState() {
        Object.values(this.sounds).forEach(audio => {
            audio.muted = this.isMuted;
            if (this.isMuted) {
                audio.pause();
            }
        });
    }

    setMuted(muted) {
        this.syncMuteStateFromStorage();

        this.isMuted = Boolean(muted);
        this.applyMuteState();
        this.saveMuteState();
        return this.isMuted;
    }

    toggleMute() {
        return this.setMuted(!this.isMuted);
    }

    loadMuteState() {
        if (!hasLocalStorage) {
            return;
        }

        try {
            const storedValue = window.localStorage.getItem(STORAGE_KEY);
            if (storedValue !== null) {
                this.isMuted = storedValue === 'true';
                this.lastStoredState = storedValue;
            }
        } catch (error) {
            console.warn('Unable to read sound preferences from localStorage', error);
        }

        this.applyMuteState();
    }

    saveMuteState() {
        if (!hasLocalStorage) {
            return;
        }

        try {
            const value = this.isMuted ? 'true' : 'false';
            window.localStorage.setItem(STORAGE_KEY, value);
            this.lastStoredState = value;
        } catch (error) {
            console.warn('Unable to save sound preferences to localStorage', error);
        }
    }

    syncMuteStateFromStorage() {
        if (!hasLocalStorage) {
            return;
        }

        try {
            const storedValue = window.localStorage.getItem(STORAGE_KEY);
            if (storedValue !== null && storedValue !== this.lastStoredState) {
                const shouldBeMuted = storedValue === 'true';
                this.lastStoredState = storedValue;
                if (shouldBeMuted !== this.isMuted) {
                    this.isMuted = shouldBeMuted;
                    this.applyMuteState();
                }
            }
        } catch (error) {
            console.warn('Unable to sync sound preferences from localStorage', error);
        }
    }
}

export const soundManager = new SoundManager();
