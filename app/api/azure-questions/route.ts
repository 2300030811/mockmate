import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Try to read from local file first
    const filePath = path.join(process.cwd(), 'azure_final.json');
    
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(fileContent);
      return NextResponse.json(data);
    }
    
    // Fallback to Azure Blob if local file doesn't exist
    const blobUrl = process.env.NEXT_PUBLIC_AZURE_FINAL_JSON_URL;
    
    if (!blobUrl) {
      return NextResponse.json({ error: 'Azure questions file not found' }, { status: 500 });
    }

    const response = await fetch(blobUrl, { cache: 'no-store' });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from Blob: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error loading Azure questions:', error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}
