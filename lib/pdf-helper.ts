import pdf from "pdf-parse";
// const pdf = (buffer: Buffer, options: any) => Promise.resolve({ text: "Mock PDF Text" });

export async function parsePdf(buffer: Buffer): Promise<string> {
    try {
        const data = await pdf(buffer, { max: 0, version: 'default' });
        return data.text.trim();
    } catch (error: any) {
        throw new Error(`PDF Parse failed: ${error.message}`);
    }
}
