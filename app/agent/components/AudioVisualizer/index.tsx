"use client";

import React from 'react';
import { useAudioReactivity } from './hooks/useAudioReactivity';

export const AudioVisualizer = () => {
  const { audioData, isListening, isSpeaking } = useAudioReactivity();
  
  const audioLevel = audioData?.audioLevel ?? 0;
  const scale = 1 + audioLevel * 1.5;
  
  return (
    <div className="relative w-32 h-32 mx-auto">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Base circle with glow */}
        <div 
          className={`absolute w-24 h-24 rounded-full transition-all duration-300 ${
            isListening 
              ? 'bg-red-500/20 shadow-lg shadow-red-500/50' 
              : isSpeaking 
                ? 'bg-blue-500/20 shadow-lg shadow-blue-500/50' 
                : 'bg-gray-500/20'
          }`}
          style={{
            transform: `scale(${scale})`,
            transition: 'transform 150ms ease-out, background-color 300ms ease-in-out',
          }}
        />
        
        {/* Dynamic ripples */}
        {(isListening || isSpeaking) && Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-24 h-24 rounded-full transition-all duration-300 ${
              isListening 
                ? 'bg-red-500/10' 
                : 'bg-blue-500/10'
            }`}
            style={{
              transform: `scale(${1 + (i * 0.2) + (audioLevel * 0.5)})`,
              opacity: Math.max(0, (1 - (i * 0.2)) * audioLevel),
              transition: 'transform 150ms ease-out, opacity 150ms ease-out',
            }}
          />
        ))}
        
        {/* Animated inner circle */}
        <div 
          className={`w-16 h-16 rounded-full transition-all duration-300 ${
            isListening 
              ? 'bg-gradient-to-br from-red-400 to-red-600'
              : isSpeaking 
                ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                : 'bg-gradient-to-br from-gray-400 to-gray-600'
          }`}
          style={{
            transform: `scale(${1 + (audioLevel * 0.3)})`,
            transition: 'transform 150ms ease-out, background-color 300ms ease-in-out',
          }}
        />
        
        {/* Reactive center dot */}
        <div 
          className={`absolute w-4 h-4 rounded-full transition-all duration-300 ${
            isListening 
              ? 'bg-red-200'
              : isSpeaking 
                ? 'bg-blue-200'
                : 'bg-gray-200'
          }`}
          style={{
            transform: `scale(${1 + (audioLevel * 0.5)})`,
            transition: 'transform 150ms ease-out, background-color 300ms ease-in-out',
          }}
        />
      </div>
    </div>
  );
};