import { BlobServiceClient } from "@azure/storage-blob";

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

export const getContainer = (name: string) => {
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
