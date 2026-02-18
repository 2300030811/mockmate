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

  useEffect(() => {
    const stopVisualization = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      analyserRef.current = null;
    };

    const drawVisualizer = () => {
      if (!canvasRef.current || !analyserRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Volume calculation for VAD
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const currentVol = sum / (bufferLength || 1);
        if (onVolumeChange) {
          onVolumeChange(currentVol);
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const width = canvas.width;
        const height = canvas.height;
        const midY = height / 2;

        // Waveform Drawing
        ctx.beginPath();
        ctx.lineWidth = 3;
        let color = isAISpeaking ? "168, 85, 247" : "59, 130, 246"; // Purple or Blue
        if (isUserActive && !isAISpeaking) color = "34, 197, 94"; // Green when speaking
        
        ctx.strokeStyle = `rgba(${color}, 0.8)`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = `rgba(${color}, 0.5)`;

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          let v = dataArray[i] / 128.0;
          
          // Boost and smooth
          if (isListening && !isAISpeaking) v *= 1.2;
          
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

        // Add a second, fainter, offset wave for depth
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgba(${color}, 0.3)`;
        x = 0;
        for (let i = 0; i < bufferLength; i++) {
            let v = dataArray[i] / 128.0;
            const y = (v * height) / 2.5;
            if (i === 0) ctx.moveTo(x, midY + (midY - y));
            else ctx.lineTo(x, midY + (midY - y));
            x += sliceWidth;
        }
        ctx.stroke();

        animationFrameRef.current = requestAnimationFrame(draw);
      };
      draw();
    };

    const setupVisualizer = (stream: MediaStream) => {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioCtx.createAnalyser();
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 256;
        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;
        drawVisualizer();
      } catch (e) {
        console.error("Failed to setup visualizer:", e);
      }
    };

    if (stream) {
      setupVisualizer(stream);
    }
    
    return () => {
      stopVisualization();
    };
  }, [stream, isAISpeaking, isListening, isUserActive, onVolumeChange]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={80}
      className="w-full h-[80px]"
    />
  );
}
