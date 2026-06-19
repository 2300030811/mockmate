import { createClient } from "@/utils/supabase/server";
import { Node, Connection, Group } from "../../app/(main)/system-design/types";
import { systemDesignRepository } from "@/lib/db/system-design-repository";

export type SystemDesign = {
    id?: string;
    user_id?: string | null;
    session_id?: string;
    title: string;
    nodes: Node[];
    connections: Connection[];
    groups: Group[];
    ai_score?: any;
    ai_review?: string;
    thumbnail_svg?: string;
    challenge_id?: string;
    created_at?: string;
    updated_at?: string;
};

export const SystemDesignService = {
    async saveDesign(design: Partial<SystemDesign>) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const payload = {
            ...design,
            user_id: user?.id || design.user_id || null,
        };

        try {
            const data = await systemDesignRepository.saveDesign(supabase, payload);
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    },

    async getDesigns() {
        const supabase = createClient();
        try {
            const data = await systemDesignRepository.getDesigns(supabase);
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    },

    async getDesignById(id: string) {
        const supabase = createClient();
        try {
            const data = await systemDesignRepository.getDesignById(supabase, id);
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    },

    async deleteDesign(id: string) {
        const supabase = createClient();
        try {
            await systemDesignRepository.deleteDesign(supabase, id);
            return { error: null };
        } catch (error: any) {
            return { error };
        }
    }
};
