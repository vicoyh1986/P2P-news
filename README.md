# P2P Passenger Transport & Consulting Insights Dashboard

A state-of-the-art, fully automated daily intelligence dashboard tracking the **Point-to-Point (P2P) Passenger Transport Sector** (taxis, ride-hailing, micromobility, autonomous shuttle services) in Singapore and globally. The dashboard also aggregates strategic opinions, reports, and perspectives from elite consulting firms, specifically **McKinsey & Company**, **Boston Consulting Group (BCG)**, and **Bain & Company**.

This application is **100% serverless**, self-healing, and runs on a daily refresh schedule powered by GitHub Actions. It leverages Google Gemini API for strategic executive-level AI synthesis, automatically updating a premium, glassmorphic single-page web application served on GitHub Pages.

---

## 🚀 Key Features

*   **Daily Automating Backend**: Runs on a CRON schedule to aggregate Google News RSS queries for Singapore P2P, Global P2P, and top-tier consulting mobility studies.
*   **Gemini 2.5 Flash Synthesis**: When a `GEMINI_API_KEY` is provided, the backend compiles the top articles and calls Gemini to synthesize a structured Executive Briefing, assign article sentiments, and extract hot topic tags.
*   **Offline / CORS Resilience**: Includes a built-in sandbox mock database, meaning you can double-click `index.html` to review the dashboard locally in your browser even if CORS policies block local JSON fetches.
*   **Premium Glassmorphic UI**: Sleek dark slate layout with dynamic micro-animations, customizable filters (full-text search, category pills, sentiment indices, and interactive hashtag click maps).
*   **Interactive Metrics**: Computes and displays real-time breakdowns of news category shares, sentiment indices, and hot-topic word-clouds on every refresh.

---

## 🛠️ Getting Started on GitHub (How to Publish)

Follow these simple, one-time instructions to publish your dashboard onto GitHub and automate the daily daily refresh:

### Step 1: Create a GitHub Repository
1. Log in to your GitHub account and create a **New Repository**.
2. Give it a name (e.g., `p2p-news-dashboard`) and make it **Public** (required for free GitHub Pages).
3. Do **not** initialize it with a README, `.gitignore`, or license.

### Step 2: Push the Files to your Repository
Open your terminal (PowerShell, Command Prompt, or Git Bash) in your local project folder and run the following commands:
```bash
# Initialize git and stage all files
git init
git add .

# Commit files
git commit -m "Initialize P2P Intelligence Dashboard"

# Rename branch to main
git branch -M main

# Add your remote repository (Replace with your actual GitHub URL)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/p2p-news-dashboard.git

# Push changes to GitHub
git push -u origin main
```

### Step 3: Configure your Gemini API Key
To enable the high-grade **AI Executive Summary** and **Article Sentiment Index**:
1. Get a completely free API key from [Google AI Studio](https://aistudio.google.com/).
2. On your GitHub repository page, navigate to **Settings** -> **Secrets and variables** -> **Actions**.
3. Click **New repository secret**.
4. Set the **Name** to `GEMINI_API_KEY` and paste your API key into the **Value** box.
5. Click **Add secret**.

### Step 4: Grant Permissions to GitHub Actions Workflow
By default, GitHub Actions cannot push changes back to your repository. Let's enable this:
1. Go to your repository's **Settings** -> **Actions** -> **General**.
2. Scroll down to **Workflow permissions**.
3. Select **Read and write permissions**.
4. Click **Save**.

### Step 5: Enable GitHub Pages
1. Go to your repository's **Settings** -> **Pages**.
2. Under **Build and deployment** -> **Source**, select **Deploy from a branch**.
3. Under **Branch**, select `main` (and `/ (root)` folder).
4. Click **Save**.

Within a couple of minutes, your repository will be active at:
`https://YOUR_GITHUB_USERNAME.github.io/p2p-news-dashboard/`

---

## 💻 Running & Testing Locally

You can also run the aggregations and test the dashboard directly on your local computer.

### Prerequisites
*   Python 3.10 or higher.
*   *No extra python package installations are required!* The backend uses standard Python library packages (`urllib`, `xml`, `json`) to run safely and lightning-fast on any system.

### Running the aggregator script:
1. (Optional) Set your Gemini API key in your terminal session:
   *   **Windows (PowerShell)**: `$env:GEMINI_API_KEY="your_api_key_here"`
   *   **Windows (CMD)**: `set GEMINI_API_KEY=your_api_key_here`
   *   **Mac/Linux**: `export GEMINI_API_KEY="your_api_key_here"`
2. Run the script:
   ```bash
   python scripts/refresh.py
   ```
3. The script will fetch current articles, de-duplicate them, perform the Gemini AI Synthesis, and output the compiled database to `data/news_data.json`.
4. Open `index.html` in your web browser to see the freshly loaded dashboard!
