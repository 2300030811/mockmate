import { CosmosClient } from "@azure/cosmos";

let client: CosmosClient | null = null;
let database: any = null;
let container: any = null;

export const initCosmos = async () => {
    if (container) return container;

    const endpoint = process.env.AZURE_COSMOS_ENDPOINT;
    const key = process.env.AZURE_COSMOS_KEY;

    if (!endpoint || !key) return null;

    if (!client) {
        client = new CosmosClient({ endpoint, key });
    }

    // Create/Get Database
    const { database: db } = await client.databases.createIfNotExists({ id: "mockmate-db" });
    database = db;

    // Create/Get Container
    const { container: cont } = await database.containers.createIfNotExists({ id: "interviews" });
    container = cont;

    return container;
};

export const saveInterviewSession = async (sessionData: any) => {
    try {
        const container = await initCosmos();
        if (!container) return; // Silent fail if not configured
        
        // Upsert (Insert or Update)
        await container.items.upsert(sessionData);
        console.log(`✅ Saved session ${sessionData.id} to Cosmos DB`);
    } catch (e) {
        console.warn("⚠️ Failed to save to Cosmos DB:", e);
    }
};
