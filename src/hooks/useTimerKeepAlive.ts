// src/hooks/useTimerKeepAlive.ts
import { useRef } from 'react';

export const useTimerKeepAlive = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  const startKeepAlive = () => {
    // Usamos a Web Audio API para gerar um som inaudível
    // Isso é mais leve que carregar um arquivo MP3 externo
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1, ctx.currentTime); // Frequência infra-sônica (inaudível)
    
    gainNode.gain.setValueAtTime(0.01, ctx.currentTime); // Volume quase zero
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillatorRef.current = oscillator;
    
    console.log("Modo Keep-Alive: Ativado 🚀");
  };

  const stopKeepAlive = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current.disconnect();
      oscillatorRef.current = null;
      console.log("Modo Keep-Alive: Desativado 💤");
    }
  };

  return { startKeepAlive, stopKeepAlive };
};