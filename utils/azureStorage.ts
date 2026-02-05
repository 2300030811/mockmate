import { BlobServiceClient } from "@azure/storage-blob";
import { env } from "@/lib/env";

const getBlobServiceClient = () => {
    const connectionString = env.AZURE_STORAGE_CONNECTION_STRING;
    
    // Fallback/Check
    if (!connectionString) {
        if (env.NODE_ENV === "production") {
             console.warn("⚠️ AZURE_STORAGE_CONNECTION_STRING is missing in production!");
        }
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
  try {
    const blob = container.getBlobClient("aws_questions.json");
    const download = await blob.download();
    const text = await streamToString(download.readableStreamBody!);
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to fetch AWS questions:", error);
    return []; // Return empty array instead of crashing
  }
}
