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
      // Chrome's autoplay policy can leave AudioContext suspended — resume it
      if (audioCtx.state === "suspended") {
        audioCtx.resume().catch(() => {});
      }
      const source = audioCtx.createMediaStreamSource(stream);

      // --- Audio processing pipeline for cleaner signal ---

      // 1. High-pass filter: removes low-frequency rumble (AC hum, desk vibrations, etc.)
      const highPass = audioCtx.createBiquadFilter();
      highPass.type = "highpass";
      highPass.frequency.value = 85; // Cut below 85 Hz — speech fundamentals start ~85 Hz

      // 2. Notch filter: removes electrical mains hum (50Hz regions + 60Hz regions)
      const notch = audioCtx.createBiquadFilter();
      notch.type = "notch";
      notch.frequency.value = 55; // Center between 50Hz/60Hz to catch both standards
      notch.Q.value = 2;          // Narrow enough to not harm speech bass

      // 3. Low-pass filter: removes high-frequency hiss/noise above speech range
      const lowPass = audioCtx.createBiquadFilter();
      lowPass.type = "lowpass";
      lowPass.frequency.value = 8000; // Speech intelligibility lives below 8 kHz

      // 4. Presence boost: lift the 1-4kHz band where speech consonants live
      const presence = audioCtx.createBiquadFilter();
      presence.type = "peaking";
      presence.frequency.value = 2500; // Center of speech clarity range
      presence.Q.value = 1;            // Broad Q for natural boost
      presence.gain.value = 3;         // +3dB lift for clearer consonants

      // 5. Compressor: normalizes loud/quiet speech for consistent levels
      const compressor = audioCtx.createDynamicsCompressor();
      compressor.threshold.value = -30; // Start compressing at -30 dB
      compressor.knee.value = 12;       // Soft knee for natural sound
      compressor.ratio.value = 4;       // 4:1 compression ratio
      compressor.attack.value = 0.003;  // Fast attack for sharp consonants
      compressor.release.value = 0.15;  // Quick release to preserve speech dynamics

      // 6. Gain: slight boost to compensate for compression loss
      const gain = audioCtx.createGain();
      gain.gain.value = 1.4;

      // Chain: source → highPass → notch → lowPass → presence → compressor → gain → analyser
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;  // Higher resolution for better speech-weighted volume
      analyser.smoothingTimeConstant = 0.75; // Smoother frequency data for stable volume readings

      source.connect(highPass);
      highPass.connect(notch);
      notch.connect(lowPass);
      lowPass.connect(presence);
      presence.connect(compressor);
      compressor.connect(gain);
      gain.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      // Auto-resume if browser suspends the AudioContext (e.g., tab switch on mobile)
      audioCtx.onstatechange = () => {
        if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
      };
    } catch (e) {
      console.error("Failed to setup visualizer:", e);
      return;
    }

    const bufferLength = analyserRef.current!.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      // Skip drawing when tab is hidden to save CPU/GPU
      if (document.hidden) {
        animationFrameRef.current = requestAnimationFrame(draw);
        return;
      }
      if (!analyserRef.current || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      // Speech-weighted volume calculation for VAD
      // Weight the 300Hz-3kHz range (speech formants) more heavily than bass/treble
      const sampleRate = audioContextRef.current?.sampleRate || 48000;
      const binHz = sampleRate / (analyserRef.current!.fftSize || 512);
      let weightedSum = 0;
      let weightTotal = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const freq = i * binHz;
        // Triangular weight: 0 at 0Hz, peak at 1.5kHz, 0 at 8kHz
        let weight = 0.2; // base weight for all bins
        if (freq >= 300 && freq <= 4000) weight = 1.0; // Full weight for speech band
        else if (freq > 100 && freq < 300) weight = 0.5; // Partial for low fundamentals
        weightedSum += dataArray[i] * weight;
        weightTotal += weight;
      }
      const currentVol = weightedSum / (weightTotal || 1);
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
