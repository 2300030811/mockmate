
import { BlobServiceClient } from "@azure/storage-blob";
import { logger } from "@/lib/logger";

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
        logger.warn("⚠️ StorageService: No Connection String found. Skipping backup.");
        return false;
      }

      const containerClient = client.getContainerClient("resumes");
      await containerClient.createIfNotExists();

      // Sanitize filename
      const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
      const blobName = `resume-${Date.now()}-${safeName}`;
      
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      
      logger.info(`🔹 Backing up resume to Azure Blob: ${blobName}`);
      await blockBlobClient.uploadData(buffer, {
        metadata: {
          uploadedAt: String(Date.now()),
          ttlHours: "24",
          ephemeral: "true",
          compliance: "DPDP_ACT_2023",
        },
      });
      logger.info(`✅ Resume backup success.`);
      return true;
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      logger.error("⚠️ StorageService Upload Error:", errMsg);
      return false;
    }
  }

  /**
   * Cleans up expired resume blobs older than maxAgeHours (default: 24h)
   * in accordance with DPDP Act (2023) zero-retention / 24-hour TTL policy.
   */
  static async cleanupExpiredResumes(maxAgeHours: number = 24): Promise<{ deleted: number; scanned: number; errors: number }> {
    try {
      const client = getClient();
      if (!client) {
        logger.warn("StorageService: No Azure connection string found. Skipping cleanup.");
        return { deleted: 0, scanned: 0, errors: 0 };
      }

      const containerClient = client.getContainerClient("resumes");
      const exists = await containerClient.exists();
      if (!exists) return { deleted: 0, scanned: 0, errors: 0 };

      const cutoffTime = Date.now() - maxAgeHours * 60 * 60 * 1000;
      let deleted = 0;
      let scanned = 0;
      let errors = 0;

      for await (const blob of containerClient.listBlobsFlat()) {
        scanned++;
        const lastModified = blob.properties.lastModified?.getTime() ?? 0;
        
        // Also parse timestamp from name format `resume-${timestamp}-${safeName}`
        const match = blob.name.match(/^resume-(\d+)-/);
        const uploadTimestamp = match ? parseInt(match[1], 10) : lastModified;

        if (uploadTimestamp < cutoffTime || lastModified < cutoffTime) {
          try {
            await containerClient.deleteBlob(blob.name);
            deleted++;
            logger.info(`StorageService: Purged expired resume blob: ${blob.name}`);
          } catch (delErr) {
            errors++;
            logger.error(`StorageService: Failed to delete blob ${blob.name}:`, delErr);
          }
        }
      }

      logger.info(`StorageService: Resume cleanup complete. Deleted ${deleted}/${scanned} blobs.`);
      return { deleted, scanned, errors };
    } catch (err) {
      logger.error("StorageService: Cleanup error:", err);
      return { deleted: 0, scanned: 0, errors: 1 };
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
        logger.error(`StorageService Read Error (${blobName}):`, error);
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
