export interface IVoiceRecognitionService {
  start(): Promise<void>;
  stop(): void;
  onTranscript(callback: (transcript: string) => void): void;
  onError(callback: (error: string) => void): void;
  onStateChange(callback: (isListening: boolean) => void): void;
}
