import { createClient } from "@/utils/supabase/server";
import { Node, Connection, Group } from "../../app/(main)/system-design/types";

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

        // Get session ID from cookies if user is guest
        // For now, we'll assume the middleware/client handles session_id if needed

        const payload = {
            ...design,
            user_id: user?.id || design.user_id || null,
        };

        if (design.id) {
            const { data, error } = await supabase
                .from('system_designs')
                .update(payload)
                .eq('id', design.id)
                .select()
                .single();
            return { data, error };
        } else {
            const { data, error } = await supabase
                .from('system_designs')
                .insert(payload)
                .select()
                .single();
            return { data, error };
        }
    },

    async getDesigns() {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('system_designs')
            .select('*')
            .order('updated_at', { ascending: false });
        return { data, error };
    },

    async getDesignById(id: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('system_designs')
            .select('*')
            .eq('id', id)
            .single();
        return { data, error };
    },

    async deleteDesign(id: string) {
        const supabase = createClient();
        const { error } = await supabase
            .from('system_designs')
            .delete()
            .eq('id', id);
        return { error };
    }
};
