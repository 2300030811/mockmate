"use client";

import { useCallback, useRef } from "react";
import { useAudio } from "@/components/providers/AudioProvider";

const MEME_PATHS = {
    beforeUpload: [
        "/Meems/before upload/Chaduvukondi First.mp3",
        "/Meems/before upload/Comedy Message Tone.mp3",
        "/Meems/before upload/Common sense undha meeku.mp3",
        "/Meems/before upload/Namaskaram.mp3",
        "/Meems/before upload/intlo padukovadam kadhu.mp3",
    ],
    whileLoading: [
        "/Meems/while loading/Auto sound.mp3",
        "/Meems/while loading/Comedy Message Tone.mp3",
        "/Meems/while loading/Edo Thedaga Undenti.mp3",
        "/Meems/while loading/I hate democracy.mp3",
        "/Meems/while loading/Indhuvadana Kundaradana .mp3",
        "/Meems/while loading/Let them know uncle.mp3",
        "/Meems/while loading/Oh my god flash man .mp3",
        "/Meems/while loading/Sukhibava.mp3",
        "/Meems/after loading/high ats score/Fahhhh.mp3",
        "/Meems/after loading/high ats score/Fahhhh.mp3",
    ],
    afterLoading: {
        high: [
            "/Meems/after loading/high ats score/A nanna dhukkam vasthundha.mp3",
            "/Meems/after loading/high ats score/Atluntadhi manathoni.mp3",
            "/Meems/after loading/high ats score/Comedy Message Tone.mp3",
            "/Meems/after loading/high ats score/Fahhhh.mp3",
            "/Meems/after loading/high ats score/Fahhhh.mp3",
            "/Meems/after loading/high ats score/Fahhhh.mp3",
            "/Meems/after loading/high ats score/Good LKG lo Padeyandi.mp3",
            "/Meems/after loading/high ats score/Indhuvadana Kundaradana .mp3",
            "/Meems/after loading/high ats score/Oh my god flash man .mp3",
            "/Meems/after loading/high ats score/Sairam sairam .mp3",
        ],
        medium: [
            "/Meems/after loading/medium ats score/A nanna dhukkam vasthundha.mp3",
            "/Meems/after loading/medium ats score/Arey Enti Ra Idi.mp3",
            "/Meems/after loading/medium ats score/Atluntadhi manathoni.mp3",
            "/Meems/after loading/medium ats score/Comedy Message Tone.mp3",
            "/Meems/after loading/medium ats score/Fahhhh.mp3",
            "/Meems/after loading/medium ats score/Fahhhh.mp3",
            "/Meems/after loading/medium ats score/Fahhhh.mp3",
            "/Meems/after loading/medium ats score/Good LKG lo Padeyandi.mp3",
            "/Meems/after loading/medium ats score/Indhuvadana Kundaradana .mp3",
            "/Meems/after loading/medium ats score/Oh my god flash man .mp3",
            "/Meems/after loading/medium ats score/Oh no.mp3",
            "/Meems/after loading/medium ats score/Sairam sairam .mp3",
            "/Meems/after loading/medium ats score/Vaadu vinadu.mp3",
        ],
        less: [
            "/Meems/after loading/less ats score/Chaduvukondi First.mp3",
            "/Meems/after loading/less ats score/Comedy Message Tone.mp3",
            "/Meems/after loading/less ats score/Fahhhh.mp3",
            "/Meems/after loading/less ats score/Fahhhh.mp3",
            "/Meems/after loading/less ats score/Fahhhh.mp3",
            "/Meems/after loading/less ats score/Good LKG lo Padeyandi.mp3",
            "/Meems/after loading/less ats score/Indhuvadana Kundaradana .mp3",
        ],
    },
};

export function useMemeAudio() {
    const { isAudioEnabled } = useAudio();
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const stopAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
    }, []);

    const playRandom = useCallback((paths: string[], count = 1) => {
        if (!isAudioEnabled) return;
        stopAudio();
        const randomPath = paths[Math.floor(Math.random() * paths.length)];
        const audio = new Audio(randomPath);
        audioRef.current = audio;

        let currentPlay = 1;
        audio.onended = () => {
            if (currentPlay < count) {
                currentPlay++;
                audio.currentTime = 0;
                audio.play().catch((err) => console.warn("Audio retry failed:", err));
            }
        };

        audio.play().catch((err) => console.warn("Audio playback failed:", err));
    }, [isAudioEnabled, stopAudio]);

    const playBeforeUpload = useCallback(() => {
        playRandom(MEME_PATHS.beforeUpload);
    }, [playRandom]);

    const playWhileLoading = useCallback(() => {
        // Play twice as requested
        playRandom(MEME_PATHS.whileLoading, 2);
    }, [playRandom]);

    const playAfterLoading = useCallback((score: number) => {
        let paths: string[];
        if (score >= 80) {
            paths = MEME_PATHS.afterLoading.high;
        } else if (score >= 50) {
            paths = MEME_PATHS.afterLoading.medium;
        } else {
            paths = MEME_PATHS.afterLoading.less;
        }
        playRandom(paths);
    }, [playRandom]);

    return {
        playBeforeUpload,
        playWhileLoading,
        playAfterLoading,
        stopAudio,
    };
}
