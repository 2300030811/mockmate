import pdf from "pdf-parse";

export async function parsePdf(buffer: Buffer): Promise<string> {
    try {
        const data = await pdf(buffer, { max: 0, version: 'default' });
        return data.text.trim();
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        throw new Error(`PDF Parse failed: ${msg}`);
    }
}
