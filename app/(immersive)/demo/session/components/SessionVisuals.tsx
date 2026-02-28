import { CameraOffIcon, HeartPulse } from "lucide-react";
import { AudioVisualizer } from "./AudioVisualizer";
import { useEffect, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
            <div className="h-1/2 border-b border-gray-800 flex items-center justify-center relative p-6 bg-gradient-to-b from-gray-900 via-gray-950 to-black overflow-hidden">
                {/* Background Glow */}
                <AnimatePresence>
                    {isAISpeaking && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1.2 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute inset-0 bg-purple-500/10 blur-3xl rounded-full"
                        />
                    )}
                </AnimatePresence>
                
                <div className="relative z-10">
                    <motion.div
                        animate={isAISpeaking ? {
                            scale: [1, 1.15, 1],
                            rotate: [0, 5, -5, 0],
                        } : {
                            scale: [1, 1.05, 1],
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
                            w-36 h-36 rounded-full flex items-center justify-center text-5xl shadow-2xl
                            bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 ring-4 
                            ${isAISpeaking ? "ring-purple-400/50 shadow-purple-500/40" : "ring-gray-700 shadow-black"}
                        `}
                    >
                        <motion.span
                            animate={isAISpeaking ? { y: [-5, 5, -5] } : {}}
                            transition={{ duration: 0.5, repeat: Infinity }}
                        >
                            🤖
                        </motion.span>

                        {/* Speech Orbs */}
                        <AnimatePresence>
                            {isAISpeaking && (
                                <>
                                    <motion.div 
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1.5, opacity: 0 }}
                                        exit={{ scale: 2, opacity: 0 }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        className="absolute inset-0 rounded-full border-2 border-purple-400"
                                    />
                                    <motion.div 
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1.8, opacity: 0 }}
                                        exit={{ scale: 2.5, opacity: 0 }}
                                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                                        className="absolute inset-0 rounded-full border-2 border-indigo-400"
                                    />
                                </>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                <div className="absolute bottom-6 left-0 right-0 text-center flex flex-col items-center gap-2">
                    <motion.div 
                        layout
                        className="bg-gray-900/80 backdrop-blur-md border border-gray-800 px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-2"
                    >
                        <div className={`w-2 h-2 rounded-full ${isAISpeaking ? 'bg-purple-500 animate-pulse' : isProcessing ? 'bg-amber-500' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'}`}></div>
                        <h3 className="font-bold text-gray-200 uppercase tracking-widest text-[10px]">
                            {isAISpeaking ? 'Bob is Speaking' : isProcessing ? 'Bob is Thinking' : 'Bob is Listening'}
                        </h3>
                    </motion.div>
                    
                    <motion.p 
                        key={isAISpeaking ? 'speak' : isProcessing ? 'think' : 'wait'}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[10px] text-gray-500 font-medium tracking-tight h-4"
                    >
                        {isAISpeaking ? "Evaluating your logic match..." : isProcessing ? "Connecting key technical concepts..." : "I'm ready when you are."}
                    </motion.p>
                </div>
            </div>

            {/* User Camera Area */}
            <div className="h-1/2 relative bg-gray-950 flex items-center justify-center overflow-hidden">
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
                    <CameraOffIcon className="mb-2 opacity-50" />
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
