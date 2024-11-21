export interface VoiceSettings {
  pitch: number;
  rate: number;
  volume: number;
  selectedVoice?: SpeechSynthesisVoice;
}

export class TextToSpeechService {
  private synthesis: SpeechSynthesis;
  private settings: VoiceSettings = {
    pitch: 1,
    rate: 1,
    volume: 1,
  };
  private audioContext: AudioContext;
  private analyzer: AnalyserNode;
  private gainNode: GainNode;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.analyzer = this.audioContext.createAnalyser();
    this.analyzer.fftSize = 2048;
    this.analyzer.smoothingTimeConstant = 0.8;
    
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.analyzer);
    this.analyzer.connect(this.audioContext.destination);
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices();
  }

  updateSettings(settings: VoiceSettings) {
    this.settings = settings;
    this.synthesis.cancel();
  }

  getAudioData() {
    const frequencyData = new Float32Array(this.analyzer.frequencyBinCount);
    const timeData = new Float32Array(this.analyzer.frequencyBinCount);
    
    this.analyzer.getFloatFrequencyData(frequencyData);
    this.analyzer.getFloatTimeDomainData(timeData);
    
    let rms = 0;
    for (let i = 0; i < timeData.length; i++) {
      rms += timeData[i] * timeData[i];
    }
    rms = Math.sqrt(rms / timeData.length);
    const audioLevel = Math.pow(Math.min(1, rms * 4), 0.8);

    return {
      frequencyData,
      timeData,
      audioLevel,
    };
  }

  speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synthesis) {
        console.error('Speech synthesis not supported');
        resolve();
        return;
      }

      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = this.settings.selectedVoice || null;
      utterance.pitch = this.settings.pitch;
      utterance.rate = this.settings.rate;
      utterance.volume = this.settings.volume;

      // Create oscillator for visualization during speech
      const oscillator = this.audioContext.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(0, this.audioContext.currentTime);
      
      oscillator.connect(this.gainNode);
      this.gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);

      utterance.onstart = () => {
        oscillator.start();
      };

      utterance.onend = () => {
        oscillator.stop();
        oscillator.disconnect();
        resolve();
      };

      utterance.onerror = () => {
        oscillator.stop();
        oscillator.disconnect();
        resolve();
      };

      // Update oscillator frequency based on speech
      utterance.onboundary = (event) => {
        const frequency = 200 + (event.charIndex % 400);
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      };

      this.synthesis.speak(utterance);
    });
  }

  resume() {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  disconnect() {
    this.gainNode.disconnect();
  }
}