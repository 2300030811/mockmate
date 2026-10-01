"use client";

import { useCallback, useRef } from "react";
import { useAudio } from "@/components/providers/AudioProvider";

export const MEME_PATHS = {
    beforeUpload: [
        "/Memes/before_upload/Chaduvukondi_First.mp3",
        "/Memes/before_upload/Common_sense_undha_meeku.mp3",
        "/Memes/before_upload/Namaskaram.mp3",
        "/Memes/before_upload/intlo_padukovadam_kadhu.mp3",
    ],
    whileLoading: [
        "/Memes/while_loading/Auto_sound.mp3",
        "/Memes/while_loading/Edo_Thedaga_Undenti.mp3",
        "/Memes/while_loading/I_hate_democracy.mp3",
        "/Memes/while_loading/Indhuvadana_Kundaradana_.mp3",
        "/Memes/while_loading/Let_them_know_uncle.mp3",
        "/Memes/while_loading/Oh_my_god_flash_man_.mp3",
        "/Memes/while_loading/Sukhibava.mp3",
    ],
    afterLoading: {
        high: [
            "/Memes/after_loading/high_ats_score/A_nanna_dhukkam_vasthundha.mp3",
            "/Memes/after_loading/high_ats_score/Atluntadhi_manathoni.mp3",
            "/Memes/after_loading/high_ats_score/Fahhhh.mp3",
            "/Memes/after_loading/high_ats_score/Good_LKG_lo_Padeyandi.mp3",
            "/Memes/after_loading/high_ats_score/Indhuvadana_Kundaradana_.mp3",
            "/Memes/after_loading/high_ats_score/Oh_my_god_flash_man_.mp3",
            "/Memes/after_loading/high_ats_score/Sairam_sairam_.mp3",
        ],
        medium: [
            "/Memes/after_loading/medium_ats_score/A_nanna_dhukkam_vasthundha.mp3",
            "/Memes/after_loading/medium_ats_score/Arey_Enti_Ra_Idi.mp3",
            "/Memes/after_loading/medium_ats_score/Atluntadhi_manathoni.mp3",
            "/Memes/after_loading/medium_ats_score/Fahhhh.mp3",
            "/Memes/after_loading/medium_ats_score/Good_LKG_lo_Padeyandi.mp3",
            "/Memes/after_loading/medium_ats_score/Indhuvadana_Kundaradana_.mp3",
            "/Memes/after_loading/medium_ats_score/Oh_my_god_flash_man_.mp3",
            "/Memes/after_loading/medium_ats_score/Oh_no.mp3",
            "/Memes/after_loading/medium_ats_score/Sairam_sairam_.mp3",
            "/Memes/after_loading/medium_ats_score/Vaadu_vinadu.mp3",
        ],
        less: [
            "/Memes/after_loading/less_ats_score/Chaduvukondi_First.mp3",
            "/Memes/after_loading/less_ats_score/Fahhhh.mp3",
            "/Memes/after_loading/less_ats_score/Good_LKG_lo_Padeyandi.mp3",
            "/Memes/after_loading/less_ats_score/Indhuvadana_Kundaradana_.mp3",
        ],
    },
} as const;

// ponytail: in-place Fisher-Yates shuffle for non-repeating meme audio decks
export function shuffleDeck<T>(items: readonly T[]): T[] {
    const deck = [...items];
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

export function useMemeAudio() {
    const { isAudioEnabled } = useAudio();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const decksRef = useRef<Record<string, string[]>>({});
    const lastPlayedRef = useRef<Record<string, string>>({});

    const stopAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.onended = null;
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
    }, []);

    // Get next track in rotation with guaranteed no back-to-back repeats across deck reshuffles
    const getNextTrack = useCallback((poolKey: string, paths: readonly string[]): string => {
        if (paths.length === 0) return "";
        if (paths.length === 1) return paths[0];

        let deck = decksRef.current[poolKey];
        if (!deck || deck.length === 0) {
            deck = shuffleDeck(paths);
            // Ensure first track in new deck doesn't match the last played track
            const last = lastPlayedRef.current[poolKey];
            if (deck[0] === last && deck.length > 1) {
                const swapIdx = 1 + Math.floor(Math.random() * (deck.length - 1));
                [deck[0], deck[swapIdx]] = [deck[swapIdx], deck[0]];
            }
            decksRef.current[poolKey] = deck;
        }

        const nextTrack = deck.shift()!;
        lastPlayedRef.current[poolKey] = nextTrack;
        return nextTrack;
    }, []);

    const playRotation = useCallback((poolKey: string, paths: readonly string[], count = 1) => {
        if (!isAudioEnabled || typeof window === "undefined" || paths.length === 0) return;
        stopAudio();

        let playedCount = 0;

        const playTrack = (trackPath: string) => {
            if (!trackPath) return;
            const audio = new Audio(trackPath);
            audioRef.current = audio;
            playedCount++;

            audio.onended = () => {
                if (playedCount < count) {
                    const nextTrack = getNextTrack(poolKey, paths);
                    playTrack(nextTrack);
                } else {
                    audioRef.current = null;
                }
            };

            audio.play().catch((err) => {
                // Autoplay restrictions or file loading error
                console.warn("Meme audio playback blocked or failed:", err);
            });
        };

        const initialTrack = getNextTrack(poolKey, paths);
        playTrack(initialTrack);
    }, [isAudioEnabled, stopAudio, getNextTrack]);

    const playBeforeUpload = useCallback(() => {
        playRotation("beforeUpload", MEME_PATHS.beforeUpload, 1);
    }, [playRotation]);

    const playWhileLoading = useCallback(() => {
        // Rotates through 2 distinct audio clips during loading
        playRotation("whileLoading", MEME_PATHS.whileLoading, 2);
    }, [playRotation]);

    const playAfterLoading = useCallback((score: number) => {
        let poolKey: string;
        let paths: readonly string[];
        if (score >= 80) {
            poolKey = "afterLoading_high";
            paths = MEME_PATHS.afterLoading.high;
        } else if (score >= 50) {
            poolKey = "afterLoading_medium";
            paths = MEME_PATHS.afterLoading.medium;
        } else {
            poolKey = "afterLoading_less";
            paths = MEME_PATHS.afterLoading.less;
        }
        playRotation(poolKey, paths, 1);
    }, [playRotation]);

    return {
        playBeforeUpload,
        playWhileLoading,
        playAfterLoading,
        stopAudio,
    };
}

