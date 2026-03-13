"use client";

import { useCallback, useRef } from "react";
import { useAudio } from "@/components/providers/AudioProvider";

const MEME_PATHS = {
    beforeUpload: [
        "/Memes/before_upload/Chaduvukondi_First.mp3",
        "/Memes/before_upload/Comedy_Message_Tone.mp3",
        "/Memes/before_upload/Common_sense_undha_meeku.mp3",
        "/Memes/before_upload/Namaskaram.mp3",
        "/Memes/before_upload/intlo_padukovadam_kadhu.mp3",
    ],
    whileLoading: [
        "/Memes/while_loading/Auto_sound.mp3",
        "/Memes/while_loading/Comedy_Message_Tone.mp3",
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
            "/Memes/after_loading/high_ats_score/Comedy_Message_Tone.mp3",
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
            "/Memes/after_loading/medium_ats_score/Comedy_Message_Tone.mp3",
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
            "/Memes/after_loading/less_ats_score/Comedy_Message_Tone.mp3",
            "/Memes/after_loading/less_ats_score/Fahhhh.mp3",
            "/Memes/after_loading/less_ats_score/Good_LKG_lo_Padeyandi.mp3",
            "/Memes/after_loading/less_ats_score/Indhuvadana_Kundaradana_.mp3",
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
