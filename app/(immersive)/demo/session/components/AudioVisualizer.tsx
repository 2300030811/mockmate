"use client";

import { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  stream: MediaStream | null;
  isAISpeaking: boolean;
  isListening: boolean;
  isUserActive: boolean;
  onVolumeChange?: (volume: number) => void;
}

export function AudioVisualizer({
  stream,
  isAISpeaking,
  isListening,
  isUserActive,
  onVolumeChange
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Store frequently-changing props in refs so the main effect doesn't re-run
  const isAISpeakingRef = useRef(isAISpeaking);
  const isListeningRef = useRef(isListening);
  const isUserActiveRef = useRef(isUserActive);
  const onVolumeChangeRef = useRef(onVolumeChange);

  useEffect(() => { isAISpeakingRef.current = isAISpeaking; }, [isAISpeaking]);
  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);
  useEffect(() => { isUserActiveRef.current = isUserActive; }, [isUserActive]);
  useEffect(() => { onVolumeChangeRef.current = onVolumeChange; }, [onVolumeChange]);

  // Single effect: only re-runs when `stream` changes
  useEffect(() => {
    if (!stream) return;

    const stopVisualization = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      analyserRef.current = null;
    };

    let audioCtx: AudioContext;
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
    } catch (e) {
      console.error("Failed to setup visualizer:", e);
      return;
    }

    const bufferLength = analyserRef.current!.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!analyserRef.current || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      // Volume calculation for VAD
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const currentVol = sum / (dataArray.length || 1);
      if (onVolumeChangeRef.current) {
        onVolumeChangeRef.current(currentVol);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const midY = height / 2;

      // Read current state from refs (no dependency needed)
      const speaking = isAISpeakingRef.current;
      const listening = isListeningRef.current;
      const userActive = isUserActiveRef.current;

      // Waveform Drawing
      ctx.beginPath();
      ctx.lineWidth = 3;
      let color = speaking ? "168, 85, 247" : "59, 130, 246"; // Purple or Blue
      if (userActive && !speaking) color = "34, 197, 94"; // Green when speaking
      
      ctx.strokeStyle = `rgba(${color}, 0.8)`;
      ctx.shadowBlur = 15;
      ctx.shadowColor = `rgba(${color}, 0.5)`;

      const sliceWidth = width / dataArray.length;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        let v = dataArray[i] / 128.0;
        
        // Boost and smooth
        if (listening && !speaking) v *= 1.2;
        
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, midY + (midY - y));
        } else {
          // Use quadratic curves for smoothing
          const nextX = x + sliceWidth;
          const nextY = midY + (midY - y);
          const midX = (x + nextX) / 2;
          const midPointY = (midY + (midY - y) + nextY) / 2;
          ctx.quadraticCurveTo(x, midY + (midY - y), midX, midPointY);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, midY);
      ctx.stroke();

      // Reset shadow for second wave to avoid expensive GPU compositing
      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";

      // Add a second, fainter, offset wave for depth
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${color}, 0.3)`;
      x = 0;
      for (let i = 0; i < dataArray.length; i++) {
          let v = dataArray[i] / 128.0;
          const y = (v * height) / 2.5;
          if (i === 0) ctx.moveTo(x, midY + (midY - y));
          else ctx.lineTo(x, midY + (midY - y));
          x += sliceWidth;
      }
      ctx.stroke();

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    animationFrameRef.current = requestAnimationFrame(draw);

    return () => {
      stopVisualization();
    };
  }, [stream]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={80}
      className="w-full h-[80px]"
    />
  );
}
