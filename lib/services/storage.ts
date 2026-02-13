
import { BlobServiceClient } from "@azure/storage-blob";

// We'll lazy-load this to avoid build-time errors if env is missing
function getClient() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) return null;
  return BlobServiceClient.fromConnectionString(connectionString);
}

export class StorageService {
  /**
   * Uploads a file buffer to Azure Blob Storage
   * Returns true if successful, false otherwise.
   * Designed to be "fire and forget" safe (won't throw).
   */
  static async uploadResumeBackup(buffer: Buffer, filename: string): Promise<boolean> {
    try {
      const client = getClient();
      if (!client) {
        console.warn("⚠️ StorageService: No Connection String found. Skipping backup.");
        return false;
      }

      const containerClient = client.getContainerClient("resumes");
      await containerClient.createIfNotExists();

      // Sanitize filename
      const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
      const blobName = `resume-${Date.now()}-${safeName}`;
      
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      
      console.log(`🔹 Backing up resume to Azure Blob: ${blobName}`);
      await blockBlobClient.uploadData(buffer);
      console.log(`✅ Resume backup success.`);
      return true;
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error("⚠️ StorageService Upload Error:", errMsg);
      return false;
    }
  }

  /**
   * Reads a JSON file from the quizzes container
   */
  static async fetchJsonFromContainer(containerName: string, blobName: string): Promise<unknown> {
    try {
        const client = getClient();
        if (!client) throw new Error("No Storage Connection String");

        const container = client.getContainerClient(containerName);
        const blob = container.getBlobClient(blobName);
        
        const downloadBlockBlobResponse = await blob.download();
        const downloaded = await streamToBuffer(downloadBlockBlobResponse.readableStreamBody!);
        return JSON.parse(downloaded.toString());
    } catch (error) {
        console.error(`StorageService Read Error (${blobName}):`, error);
        return null;
    }
  }
}

// Helper to convert stream to buffer
async function streamToBuffer(readableStream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    readableStream.on("data", (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data as ArrayBuffer));
    });
    readableStream.on("end", () => {
      resolve(Buffer.concat(chunks as any));
    });
    readableStream.on("error", reject);
  });
}
