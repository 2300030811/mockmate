import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET() {
    try {
        const adminDb = createAdminClient();
        const { data, error } = await adminDb.from('quiz_results').select('*').limit(10);
        return NextResponse.json({ data, error });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || e.toString() }, { status: 500 });
    }
}
