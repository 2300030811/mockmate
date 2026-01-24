import { BlobServiceClient } from "@azure/storage-blob";

const getBlobServiceClient = () => {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    // Fallback for build time if env is missing
    if (!connectionString) {
        if (process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") {
             console.warn("⚠️ AZURE_STORAGE_CONNECTION_STRING is missing in production!");
        }
        // Return a dummy client or handle error gracefully during build
        return null; 
    }
    return BlobServiceClient.fromConnectionString(connectionString);
};

export const getContainer = (name: string) => {
  const blobServiceClient = getBlobServiceClient();
  if (!blobServiceClient) {
      throw new Error("Azure Storage Connection String is missing (Build time safety check or misconfiguration).");
  }
  return blobServiceClient.getContainerClient(name);
};

async function streamToString(readableStream: NodeJS.ReadableStream) {
  return new Promise<string>((resolve, reject) => {
    const chunks: any[] = [];
    readableStream.on("data", (data) => chunks.push(data.toString()));
    readableStream.on("end", () => resolve(chunks.join("")));
    readableStream.on("error", reject);
  });
}

export async function getAWSQuestions() {
  const container = getContainer("quizzes");
  const blob = container.getBlobClient("aws_questions.json");

  const download = await blob.download();
  const text = await streamToString(download.readableStreamBody!);

  return JSON.parse(text);
}
