import { IVoiceRecognitionService } from './interfaces/IVoiceRecognitionService';

export class WebSpeechRecognitionService implements IVoiceRecognitionService {
  private recognition: any;
  private transcriptCallback: ((transcript: string) => void) | null = null;
  private errorCallback: ((error: string) => void) | null = null;
  private stateChangeCallback: ((isListening: boolean) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.setupRecognition();
      }
    }
  }

  private setupRecognition() {
    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    this.recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }
      
      if (finalTranscript && this.transcriptCallback) {
        this.transcriptCallback(finalTranscript);
      }
    };

    this.recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech' && this.errorCallback) {
        this.errorCallback(event.error);
      }
    };

    this.recognition.onend = () => {
      if (this.stateChangeCallback) {
        this.stateChangeCallback(false);
      }
    };
  }

  async start(): Promise<void> {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      this.recognition.start();
      if (this.stateChangeCallback) {
        this.stateChangeCallback(true);
      }
    } catch (error) {
      if (this.errorCallback) {
        this.errorCallback('Microphone access denied or not available');
      }
    }
  }

  stop(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  onTranscript(callback: (transcript: string) => void): void {
    this.transcriptCallback = callback;
  }

  onError(callback: (error: string) => void): void {
    this.errorCallback = callback;
  }

  onStateChange(callback: (isListening: boolean) => void): void {
    this.stateChangeCallback = callback;
  }
}
