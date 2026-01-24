# Azure Deployment Guide (Student Tier)

Since you don't have the Azure CLI installed locally, use the **Azure Portal** method. It's the most reliable way to set up your generic "Student" free tier resources and connect them to GitHub for automatic deployment.

## Method: Azure Portal + GitHub Actions (Recommended)

### Step 1: Create the Web App

1.  Log in to the [Azure Portal](https://portal.azure.com).
2.  Search for **"App Services"** and click **Create** -> **Web App**.
3.  **Basics Tab**:
    - **Subscription**: Select your "Azure for Students" subscription.
    - **Resource Group**: Click "Create new" and name it `MockmateResources`.
    - **Name**: Enter a unique name (e.g., `mockmate-yourname`).
    - **Publish**: Select **Code**.
    - **Runtime stack**: Select **Node 20 LTS** (or the latest LTS available).
    - **Operating System**: Select **Linux**.
    - **Region**: Select a region close to you (e.g., East US).
    - **Pricing Plan**: VERY IMPORTANT!
      - Click **Change size** (or "Explore pricing plans").
      - Select the **F1 (Free)** tier (Dev/Test tab).
4.  Click **Review + create** and then **Create**.

### Step 2: Configure Environment Variables

**Crucial Step**: Your app needs your API keys to work.

1.  Go to your new App Service resource.
2.  In the left menu, go to **Settings** -> **Configuration**.
3.  Click **Application settings** tab -> **New application setting**.
4.  Add the following pairs (values are in your `.env.local` file):
    - `AZURE_STORAGE_CONNECTION_STRING`: (Copy from .env.local)
    - `GROQ_API_KEY`: (Copy from .env.local)
    - `GOOGLE_API_KEY`: (Copy from .env.local)
    - `NEXT_PUBLIC_BASE_URL`: `https://<your-app-name>.azurewebsites.net` (Update this to your real Azure URL)
5.  Click **Save** at the top.

### Step 3: Connect to GitHub

1.  In the left menu, find **Deployment** -> **Deployment Center**.
2.  **Source**: Select **GitHub**.
3.  **Authorize** your GitHub account if needed.
4.  **Organization/Repository**: Select your `mockmate` repository.
5.  **Branch**: Select `main`.
6.  Click **Save**.

Azure will automatically add a workflow file to your GitHub repository and start the first deployment!

### Step 4: Verify Deployment

1.  Wait for the GitHub Action to finish (you can see it in the "Actions" tab of your GitHub repo).
2.  Visit your app URL: `https://mockmate-yourname.azurewebsites.net`.

---

## Alternative: Command Line (Advanced)

If you prefer using the terminal, you must first [Install the Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-windows).
Once installed (`az --version` works), you can run the `deploy.ps1` script in this folder.
