import { CameraOff } from "lucide-react";
import { AudioVisualizer } from "./AudioVisualizer";
import { useEffect, useRef, memo } from "react";
import { m, AnimatePresence } from "framer-motion";

interface SessionVisualsProps {
    isAISpeaking: boolean;
    isProcessing: boolean;
    cameraActive: boolean;
    stream: MediaStream | null;
    isListening: boolean;
    isUserActive: boolean;
    onVolumeChange: (vol: number) => void;
    videoRef: React.RefObject<HTMLVideoElement>;
}

export const SessionVisuals = memo(function SessionVisuals({
    isAISpeaking,
    isProcessing,
    cameraActive,
    stream,
    isListening,
    isUserActive,
    onVolumeChange,
    videoRef
}: SessionVisualsProps) {
    
    // Ensure video plays when stream changes
    useEffect(() => {
        if (cameraActive && videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch((e) => console.warn("Video play error:", e));
        }
    }, [cameraActive, stream, videoRef]);

    return (
        <div className="h-full flex flex-col animate-fadeIn">
            {/* AI Avatar Area */}
            <div className="h-1/2 border-b border-zinc-200 dark:border-[#1e1e2a] flex items-center justify-center relative p-6 bg-zinc-50 dark:bg-[#0e0e16] overflow-hidden">
                {/* Background Glow */}
                <AnimatePresence>
                    {isAISpeaking && (
                        <m.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1.2 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute inset-0 bg-[#5e6ad2]/10 blur-3xl rounded-full"
                        />
                    )}
                </AnimatePresence>
                
                <div className="relative z-10">
                    <m.div
                        animate={isAISpeaking ? {
                            scale: [1, 1.12, 1],
                            rotate: [0, 4, -4, 0],
                        } : {
                            scale: [1, 1.03, 1],
                        }}
                        transition={isAISpeaking ? {
                            duration: 0.8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        } : {
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className={`
                            w-32 h-32 rounded-2xl flex items-center justify-center text-4xl shadow-subtle
                            bg-gradient-to-br from-[#5e6ad2] via-[#4f5ac4] to-[#3f479a] ring-1 
                            ${isAISpeaking ? "ring-[#5e6ad2]/50 shadow-[#5e6ad2]/30" : "ring-zinc-300 dark:ring-[#2e2e42]"}
                        `}
                    >
                        <m.span
                            animate={isAISpeaking ? { y: [-3, 3, -3] } : {}}
                            transition={{ duration: 0.5, repeat: Infinity }}
                        >
                            🤖
                        </m.span>

                        {/* Speech Orbs */}
                        <AnimatePresence>
                            {isAISpeaking && (
                                <>
                                    <m.div 
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1.4, opacity: 0 }}
                                        exit={{ scale: 1.8, opacity: 0 }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        className="absolute inset-0 rounded-2xl border border-[#5e6ad2]"
                                    />
                                    <m.div 
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1.7, opacity: 0 }}
                                        exit={{ scale: 2.2, opacity: 0 }}
                                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                                        className="absolute inset-0 rounded-2xl border border-[#5e6ad2]/60"
                                    />
                                </>
                            )}
                        </AnimatePresence>
                    </m.div>
                </div>

                <div className="absolute bottom-5 left-0 right-0 text-center flex flex-col items-center gap-1.5">
                    <m.div 
                        layout
                        className="bg-white/90 dark:bg-[#14141e]/90 backdrop-blur-md border border-zinc-200 dark:border-[#1e1e2a] px-3.5 py-1 rounded-full shadow-subtle flex items-center gap-2"
                    >
                        <div className={`w-1.5 h-1.5 rounded-full ${isAISpeaking ? 'bg-[#5e6ad2] animate-pulse' : isProcessing ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                        <h3 className="font-mono font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider text-[10px]">
                            {isAISpeaking ? 'Bob is Speaking' : isProcessing ? 'Bob is Thinking' : 'Bob is Listening'}
                        </h3>
                    </m.div>
                    
                    <m.p 
                        key={isAISpeaking ? 'speak' : isProcessing ? 'think' : 'wait'}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[10.5px] font-mono text-zinc-500 dark:text-[#8b8b9e] h-4"
                    >
                        {isAISpeaking ? "Evaluating your logic match..." : isProcessing ? "Connecting key technical concepts..." : "Ready when you are."}
                    </m.p>
                </div>
            </div>

            {/* User Camera Area */}
            <div className="h-1/2 relative bg-zinc-900 dark:bg-[#07070b] flex items-center justify-center overflow-hidden">
                {cameraActive ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-700 ${isAISpeaking ? "opacity-40 grayscale-[50%]" : "opacity-100"}`}
                />
                ) : (
                <div className="flex flex-col items-center justify-center text-gray-600">
                    <CameraOff className="mb-2 opacity-50" />
                    <span className="text-xs uppercase tracking-widest opacity-50">
                    Camera Off
                    </span>
                </div>
                )}

                <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent flex items-end justify-center pb-6">
                <div className="w-full px-8">
                    <AudioVisualizer 
                    stream={stream}
                    isAISpeaking={isAISpeaking}
                    isListening={isListening}
                    isUserActive={isUserActive}
                    onVolumeChange={onVolumeChange}
                    />
                </div>
                </div>
                
                {isUserActive && !isAISpeaking && (
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.8)] animate-pulse"></div>
                )}
            </div>
        </div>
    );
});
