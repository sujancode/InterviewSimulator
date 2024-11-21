"use client";

export class AudioAnalyzer {
  private audioContext: AudioContext;
  private analyzer: AnalyserNode;
  private frequencyData: Float32Array;
  private timeData: Float32Array;
  private source: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.analyzer = this.audioContext.createAnalyser();
    this.analyzer.fftSize = 2048; // Increased for better resolution
    this.analyzer.smoothingTimeConstant = 0.8;
    
    this.frequencyData = new Float32Array(this.analyzer.frequencyBinCount);
    this.timeData = new Float32Array(this.analyzer.frequencyBinCount);
  }

  async connectMicrophone() {
    try {
      if (this.stream) {
        this.disconnectMicrophone();
      }

      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.source.connect(this.analyzer);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  }

  disconnectMicrophone() {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  getAudioData() {
    this.analyzer.getFloatFrequencyData(this.frequencyData);
    this.analyzer.getFloatTimeDomainData(this.timeData);
    
    // Calculate RMS (Root Mean Square) for audio level
    let rms = 0;
    for (let i = 0; i < this.timeData.length; i++) {
      rms += this.timeData[i] * this.timeData[i];
    }
    rms = Math.sqrt(rms / this.timeData.length);
    
    // Normalize and apply non-linear scaling
    const audioLevel = Math.pow(Math.min(1, rms * 4), 0.8);

    return {
      frequencyData: this.frequencyData,
      timeData: this.timeData,
      audioLevel,
    };
  }

  resume() {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}