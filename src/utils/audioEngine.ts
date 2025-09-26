class AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isInitialized: boolean = false;
  private hasUserInteracted: boolean = false;

  // Must be called synchronously in a user event handler for iOS
  initializeSync() {
    if (this.isInitialized) return true;
    
    try {
      console.log('Initializing AudioContext synchronously...');
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      
      if (!AudioContextClass) {
        console.error('AudioContext not supported');
        return false;
      }
      
      this.audioContext = new AudioContextClass();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.7;
      this.masterGain.connect(this.audioContext.destination);
      
      this.hasUserInteracted = true;
      this.isInitialized = true;
      
      console.log('AudioContext created synchronously, state:', this.audioContext.state);
      
      // Resume if suspended (this can be async after creation)
      if (this.audioContext.state === 'suspended') {
        console.log('Attempting to resume suspended AudioContext...');
        this.audioContext.resume().then(() => {
          console.log('AudioContext resumed successfully, state:', this.audioContext?.state);
        }).catch(error => {
          console.error('Failed to resume AudioContext:', error);
        });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize AudioContext:', error);
      return false;
    }
  }

  // Legacy method for backward compatibility
  initialize() {
    return this.initializeSync();
  }

  isReady(): boolean {
    return this.isInitialized && this.audioContext !== null && this.hasUserInteracted;
  }

  getAudioContextState(): string {
    return this.audioContext?.state || 'not-initialized';
  }

  getAudioContext(): AudioContext | null {
    return this.audioContext;
  }

  // Test method to create a simple beep for debugging
  testBeep() {
    if (!this.isReady()) {
      console.log('AudioEngine not ready for test beep');
      return;
    }
    
    try {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();
      
      oscillator.frequency.value = 440; // A4 note
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, this.audioContext!.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + 0.2);
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain!);
      
      oscillator.start();
      oscillator.stop(this.audioContext!.currentTime + 0.2);
      
      console.log('Test beep played');
    } catch (error) {
      console.error('Failed to play test beep:', error);
    }
  }

  private createKick() {
    if (!this.audioContext || !this.masterGain) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(80, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

    filter.type = 'lowpass';
    filter.frequency.value = 150;

    gainNode.gain.setValueAtTime(1.5, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  private createSnare() {
    if (!this.audioContext || !this.masterGain) return;

    const oscillator1 = this.audioContext.createOscillator();
    const oscillator2 = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const noiseGain = this.audioContext.createGain();
    
    // Tone component
    oscillator1.type = 'triangle';
    oscillator1.frequency.value = 200;
    
    // Noise component
    const bufferSize = this.audioContext.sampleRate * 0.1;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noiseSource = this.audioContext.createBufferSource();
    noiseSource.buffer = buffer;
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    gainNode.gain.setValueAtTime(0.7, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

    noiseGain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

    oscillator1.connect(gainNode);
    noiseSource.connect(filter);
    filter.connect(noiseGain);
    
    gainNode.connect(this.masterGain);
    noiseGain.connect(this.masterGain);

    oscillator1.start();
    oscillator1.stop(this.audioContext.currentTime + 0.2);
    noiseSource.start();
    noiseSource.stop(this.audioContext.currentTime + 0.1);
  }

  private createHiHat() {
    if (!this.audioContext || !this.masterGain) return;

    const bufferSize = this.audioContext.sampleRate * 0.05;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noiseSource = this.audioContext.createBufferSource();
    noiseSource.buffer = buffer;
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;
    
    const gainNode = this.audioContext.createGain();
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    noiseSource.start();
    noiseSource.stop(this.audioContext.currentTime + 0.05);
  }

  private createCymbal() {
    if (!this.audioContext || !this.masterGain) return;

    // Create noise buffer similar to hi-hat but longer
    const bufferSize = this.audioContext.sampleRate * 0.4;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noiseSource = this.audioContext.createBufferSource();
    noiseSource.buffer = buffer;
    
    // High-pass filter similar to hi-hat but lower frequency
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 5000;
    
    const gainNode = this.audioContext.createGain();
    // Louder than hi-hat but with longer decay
    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    noiseSource.start();
    noiseSource.stop(this.audioContext.currentTime + 0.4);
  }

  private createHandClap() {
    if (!this.audioContext || !this.masterGain) return;

    // Create multiple noise bursts for hand clap effect
    const claps = 3;
    const clapDelay = 0.01;
    
    for (let i = 0; i < claps; i++) {
      const bufferSize = this.audioContext.sampleRate * 0.05;
      const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let j = 0; j < bufferSize; j++) {
        data[j] = Math.random() * 2 - 1;
      }
      
      const noiseSource = this.audioContext.createBufferSource();
      noiseSource.buffer = buffer;
      
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1000 + (i * 500);
      filter.Q.value = 5;
      
      const gainNode = this.audioContext.createGain();
      const startTime = this.audioContext.currentTime + (i * clapDelay);
      gainNode.gain.setValueAtTime(0.4, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.05);

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain);

      noiseSource.start(startTime);
      noiseSource.stop(startTime + 0.05);
    }
  }

  private createCowBell() {
    if (!this.audioContext || !this.masterGain) return;

    const oscillator1 = this.audioContext.createOscillator();
    const oscillator2 = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    // Two oscillators for metallic cow bell sound
    oscillator1.type = 'square';
    oscillator1.frequency.value = 800;
    
    oscillator2.type = 'square';
    oscillator2.frequency.value = 540;
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 10;

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(filter);
    filter.connect(this.masterGain);

    oscillator1.start();
    oscillator1.stop(this.audioContext.currentTime + 0.3);
    oscillator2.start();
    oscillator2.stop(this.audioContext.currentTime + 0.3);
  }

  playSound(sound: string) {
    console.log('Playing sound:', sound);
    
    // Initialize if not already done
    if (!this.isInitialized) {
      console.log('AudioContext not initialized, initializing now...');
      this.initialize();
    }
    
    // Play sound immediately if initialized, or after initialization
    const playNow = () => {
      switch (sound) {
        case 'kick':
          console.log('Creating kick sound');
          this.createKick();
          break;
        case 'snare':
          this.createSnare();
          break;
        case 'hihat':
          this.createHiHat();
          break;
        case 'cymbal':
          this.createCymbal();
          break;
        case 'handclap':
          this.createHandClap();
          break;
        case 'cowbell':
          this.createCowBell();
          break;
      }
    };
    
    if (this.isInitialized && this.audioContext) {
      playNow();
    } else if (this.initializationPromise) {
      this.initializationPromise.then(playNow).catch(console.error);
    } else {
      console.error('AudioContext not available');
    }
  }
}

export const audioEngine = new AudioEngine();