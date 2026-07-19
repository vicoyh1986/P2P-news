// --- P2P Intelligence Dashboard Core Logic ---

// App State
let db = {
  last_updated: new Date().toISOString(),
  ai_active: false,
  executive_brief: null,
  articles: []
};

// Filtering & Sorting State
let activeFilters = {
  search: "",
  category: "all",
  sentiment: "all",
  tag: null,
  sort: "newest"
};

// DOM Elements
const elements = {
  lastUpdated: document.getElementById("last-updated-time"),
  engineStatusBadge: document.getElementById("engine-status-badge"),
  engineStatusText: document.getElementById("engine-status-text"),
  briefingHeadline: document.getElementById("briefing-headline"),
  briefingSummary: document.getElementById("briefing-summary-content"),
  themesList: document.getElementById("strategic-themes-list"),
  takeawaysList: document.getElementById("executive-takeaways-list"),
  
  // Progress Bar Metrics
  countSgP2p: document.getElementById("count-sg-p2p"),
  countGlobalP2p: document.getElementById("count-global-p2p"),
  countConsulting: document.getElementById("count-consulting"),
  barSgP2p: document.getElementById("bar-sg-p2p"),
  barGlobalP2p: document.getElementById("bar-global-p2p"),
  barConsulting: document.getElementById("bar-consulting"),
  
  // Sentiment Chart
  segPos: document.getElementById("seg-pos"),
  segNeu: document.getElementById("seg-neu"),
  segNeg: document.getElementById("seg-neg"),
  pctPos: document.getElementById("pct-pos"),
  pctNeu: document.getElementById("pct-neu"),
  pctNeg: document.getElementById("pct-neg"),
  
  // Tag cloud
  tagCloud: document.getElementById("keyword-cloud-container"),
  
  // Controls
  searchInput: document.getElementById("search-bar-input"),
  sentimentSelect: document.getElementById("filter-sentiment-select"),
  sortSelect: document.getElementById("sort-order-select"),
  categoryPills: document.getElementById("category-pills-bar"),
  
  // Grid
  newsGrid: document.getElementById("news-grid-feed")
};

// Inline Mock Database (Fallback for CORS / offline / filesystem opening)
const CORS_FALLBACK_DB = {
  last_updated: "2026-07-19T12:43:50.001028+00:00",
  ai_active: false,
  executive_brief: {
    headline: "Point-to-Point Transit Confronts Global Driver Supply & AV Structural Shifts",
    summary: "Singapore's point-to-point (P2P) transport system continues to lead globally in regulatory resilience and pricing standardizations. As the Land Transport Authority (LTA) evaluates driver vocational license frameworks, global operations face severe headwind clusters from labor supply crunches and capital investment allocation changes. Simultaneously, professional services (McKinsey, BCG, Bain) warn of deep structural re-mappings required to integrate autonomous vehicle (AV) fleets with legacy human driver dispatch networks.",
    key_themes: [
      {
        theme: "SG Driver License Modernization",
        explanation: "LTA's upcoming framework adjustments aim to reduce administrative barriers for taxi and private hire drivers, stabilizing daily active supply."
      },
      {
        theme: "Autonomous Integration Playbooks",
        explanation: "Consulting advisories stress that hybrid fleet coordination (AV + manual) will represent the primary competitive edge for top operators like Grab or Uber."
      },
      {
        theme: "Pricing Model Recalibrations",
        explanation: "Dynamic pricing is shifting from primitive surge heuristics to demand-prediction models to absorb high operating and insurance costs."
      }
    ],
    strategic_takeaways: [
      "Operators must expedite multi-modal API connections to lock in passenger loyalty programs and buffer against supply shocks.",
      "Lobby municipal regulators early for standardized AV dispatch interfaces to prevent siloed, non-interoperable urban grids.",
      "Deploy localized consulting metrics for vehicle battery-degradation cycles in EV fleets to secure accurate long-term unit economics."
    ]
  },
  articles: [
    {
      title: "LTA updates Point-to-Point regulatory framework to ensure driver sustainability",
      link: "https://www.lta.gov.sg",
      published_at: "2026-07-19T08:30:00Z",
      snippet: "Singapore LTA is launching a series of consultations with local taxi associations and ride-hailing networks to streamline driver entry requirements, vocational license assessments, and fair fare structures.",
      source: "LTA Singapore",
      category: "Singapore P2P",
      ai_summary: "The Land Transport Authority of Singapore is restructuring P2P standards to lower entry barriers and reinforce vocational driver supply, addressing ongoing commuter shortages.",
      sentiment: "Positive",
      tags: ["Regulation", "Labor", "Singapore"]
    },
    {
      title: "McKinsey Report: The Hybrid Fleet Challenge - Managing AVs and Human Drivers",
      link: "https://www.mckinsey.com",
      published_at: "2026-07-18T14:15:00Z",
      snippet: "As robotaxis begin testing in more metropolitan areas, the logistics of dispatching mixed fleets of autonomous and human-driven cars becomes highly complex, requiring advanced AI dispatch layers.",
      source: "McKinsey Insights",
      category: "Consulting Opinions",
      ai_summary: "McKinsey outlines operational models for managing combined AV-human fleets, stressing that software orchestration layers are critical to maximizing fleet yield and utilization.",
      sentiment: "Neutral",
      tags: ["Autonomous", "Strategy", "Tech"]
    },
    {
      title: "Grab Singapore logs record ride demand but cautions on peak driver supply shortages",
      link: "https://www.grab.com",
      published_at: "2026-07-17T11:00:00Z",
      snippet: "Grab's quarterly report shows a robust double-digit demand increase in point-to-point commuting across Singapore, though vehicle idle times have increased during critical rush hours.",
      source: "The Straits Times",
      category: "Singapore P2P",
      ai_summary: "Grab logs peak demand recovery in Singapore, but reports persistent labor supply constraints, driving discussions on license and vocational training reforms.",
      sentiment: "Neutral",
      tags: ["Corporate", "Labor", "Singapore"]
    },
    {
      title: "Tesla Robotaxi expands trial permits into key European and Asian metro clusters",
      link: "https://www.tesla.com",
      published_at: "2026-07-16T22:45:00Z",
      snippet: "Tesla has obtained provisional regulatory approvals to pilot its autonomous ride-sharing platform globally, directly challenging localized ride-hailing networks in primary cities.",
      source: "Bloomberg",
      category: "Global P2P",
      ai_summary: "Tesla is rapidly scaling its robotaxi footprint with new provisional permits globally, setting up a clash with traditional ride-hailing networks.",
      sentiment: "Positive",
      tags: ["Autonomous", "EV", "Tech"]
    },
    {
      title: "Bain Study: Fleet electrification economics hit parity tipping point in major cities",
      link: "https://www.bain.com",
      published_at: "2026-07-15T09:00:00Z",
      snippet: "Bain & Company's modeling of total cost of ownership (TCO) for point-to-point fleets shows EV operations are now highly competitive, provided smart charging infrastructure grids exist.",
      source: "Bain & Company",
      category: "Consulting Opinions",
      ai_summary: "Bain reports that point-to-point fleet EV conversion has reached financial tipping parity with ICE vehicles, highlighting charging grid coordination as the next key bottleneck.",
      sentiment: "Positive",
      tags: ["EV", "Strategy", "Infrastructure"]
    },
    {
      title: "Global ride-hailing operators hit with driver safety and compensation class actions",
      link: "https://www.reuters.com",
      published_at: "2026-07-14T06:20:00Z",
      snippet: "A coalition of international transport unions has filed joint actions across several jurisdictions, demanding minimum pay rates, benefit packages, and strict safety audits for P2P gig drivers.",
      source: "Reuters",
      category: "Global P2P",
      ai_summary: "Global ride-hailing giants face mounting litigation and rising driver labor union pressure, signaling rising labor costs and margin squeezes.",
      sentiment: "Negative",
      tags: ["Labor", "Regulation", "Corporate"]
    }
  ]
};

// --- Helper: Format Date ---
function formatDate(dateString) {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, "0");
    const mins = d.getMinutes().toString().padStart(2, "0");
    return `${month} ${day}, ${year} ${hours}:${mins}`;
  } catch (e) {
    return dateString;
  }
}

// --- Fetch Dashboard Data ---
async function initDashboard() {
  try {
    console.log("Loading dashboard intelligence database...");
    const response = await fetch("data/news_data.json");
    
    if (!response.ok) {
      throw new Error(`HTTP status error: ${response.status}`);
    }
    
    const fetchedData = await response.json();
    console.log("Database parsed successfully:", fetchedData);
    
    db = fetchedData;
  } catch (error) {
    console.warn("Failed to load local data/news_data.json (usually CORS policy when double-clicked). Launching offline-resilient sandbox data...", error);
    db = CORS_FALLBACK_DB;
  }
  
  renderDashboard();
  setupEventListeners();
}

// --- Render Everything ---
function renderDashboard() {
  // 1. Header & Engine Status
  elements.lastUpdated.innerText = formatDate(db.last_updated);
  
  if (db.ai_active) {
    elements.engineStatusBadge.className = "engine-status";
    elements.engineStatusText.innerText = "Active (Gemini 2.5)";
  } else {
    elements.engineStatusBadge.className = "engine-status standby";
    elements.engineStatusText.innerText = "Heuristic Standby";
  }
  
  // 2. Render Executive Briefing
  renderExecutiveBriefing();
  
  // 3. Render Analytics & Metrics
  renderMetrics();
  
  // 4. Render News Feed Cards
  renderNewsFeed();
}

// --- Render Executive Briefing ---
function renderExecutiveBriefing() {
  const brief = db.executive_brief || CORS_FALLBACK_DB.executive_brief;
  
  elements.briefingHeadline.innerText = brief.headline;
  
  // Clean summaries into paragraphs
  let paragraphs = "";
  if (Array.isArray(brief.summary)) {
    paragraphs = brief.summary.map(p => `<p>${p}</p>`).join("");
  } else {
    // If it's a giant string, split by double newlines or render as a single paragraph
    paragraphs = brief.summary.split("\n\n").map(p => `<p>${p.trim()}</p>`).join("");
  }
  elements.briefingSummary.innerHTML = paragraphs;
  
  // Render Themes
  elements.themesList.innerHTML = "";
  brief.key_themes.forEach((item, index) => {
    const themeCard = document.createElement("div");
    themeCard.className = `theme-item ${index === 0 ? 'active' : ''}`;
    themeCard.id = `theme-item-index-${index}`;
    themeCard.innerHTML = `
      <div class="theme-header">
        <span class="theme-title">${item.theme}</span>
        <span class="theme-arrow">▶</span>
      </div>
      <p class="theme-desc">${item.explanation}</p>
    `;
    
    // Add interactive click to expand/collapse theme
    themeCard.addEventListener("click", () => {
      document.querySelectorAll(".theme-item").forEach(card => card.classList.remove("active"));
      themeCard.classList.add("active");
    });
    
    elements.themesList.appendChild(themeCard);
  });
  
  // Render Takeaways
  elements.takeawaysList.innerHTML = "";
  brief.strategic_takeaways.forEach((takeaway, index) => {
    const item = document.createElement("div");
    item.className = "takeaway-item";
    item.id = `takeaway-item-index-${index}`;
    item.innerHTML = `
      <div class="takeaway-badge">${index + 1}</div>
      <div class="takeaway-text">${takeaway}</div>
    `;
    elements.takeawaysList.appendChild(item);
  });
}

// --- Render Analytics Metrics ---
function renderMetrics() {
  const articles = db.articles;
  const total = articles.length;
  
  if (total === 0) return;
  
  // A. Category Volume Breakdowns
  const counts = { "Singapore P2P": 0, "Global P2P": 0, "Consulting Opinions": 0 };
  articles.forEach(a => {
    if (counts[a.category] !== undefined) counts[a.category]++;
  });
  
  const pctSg = Math.round((counts["Singapore P2P"] / total) * 100);
  const pctGlobal = Math.round((counts["Global P2P"] / total) * 100);
  const pctConsulting = Math.round((counts["Consulting Opinions"] / total) * 100);
  
  elements.countSgP2p.innerText = `${pctSg}% (${counts["Singapore P2P"]})`;
  elements.countGlobalP2p.innerText = `${pctGlobal}% (${counts["Global P2P"]})`;
  elements.countConsulting.innerText = `${pctConsulting}% (${counts["Consulting Opinions"]})`;
  
  elements.barSgP2p.style.width = `${pctSg}%`;
  elements.barGlobalP2p.style.width = `${pctGlobal}%`;
  elements.barConsulting.style.width = `${pctConsulting}%`;
  
  // B. Sentiment Distributions
  const sentiments = { "Positive": 0, "Neutral": 0, "Negative": 0 };
  articles.forEach(a => {
    const s = a.sentiment || "Neutral";
    if (sentiments[s] !== undefined) sentiments[s]++;
  });
  
  const pctPos = Math.round((sentiments["Positive"] / total) * 100);
  const pctNeu = Math.round((sentiments["Neutral"] / total) * 100);
  const pctNeg = Math.round((sentiments["Negative"] / total) * 100);
  
  elements.pctPos.innerText = `${pctPos}%`;
  elements.pctNeu.innerText = `${pctNeu}%`;
  elements.pctNeg.innerText = `${pctNeg}%`;
  
  elements.segPos.style.width = `${pctPos}%`;
  elements.segNeu.style.width = `${pctNeu}%`;
  elements.segNeg.style.width = `${pctNeg}%`;
  
  // C. Tag Cloud Compilation
  const tagsMap = {};
  articles.forEach(a => {
    if (a.tags && Array.isArray(a.tags)) {
      a.tags.forEach(tag => {
        tagsMap[tag] = (tagsMap[tag] || 0) + 1;
      });
    }
  });
  
  // Sort tags by frequency and take top 12
  const sortedTags = Object.entries(tagsMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);
    
  elements.tagCloud.innerHTML = "";
  
  // Render "Clear Tag" button if we have an active tag filter
  if (activeFilters.tag) {
    const clearTagPill = document.createElement("span");
    clearTagPill.className = "keyword-tag active";
    clearTagPill.id = "btn-clear-tag-filter";
    clearTagPill.innerHTML = `✕ #${activeFilters.tag}`;
    clearTagPill.addEventListener("click", () => {
      activeFilters.tag = null;
      renderMetrics();
      renderNewsFeed();
    });
    elements.tagCloud.appendChild(clearTagPill);
  }
  
  sortedTags.forEach(([tag, frequency]) => {
    // If this tag is currently the active filter, skip rendering as a normal tag
    if (tag === activeFilters.tag) return;
    
    const tagPill = document.createElement("span");
    tagPill.className = "keyword-tag";
    tagPill.id = `tag-pill-${tag.replace(/\s+/g, '-').toLowerCase()}`;
    tagPill.innerText = `#${tag} (${frequency})`;
    
    tagPill.addEventListener("click", () => {
      activeFilters.tag = tag;
      renderMetrics();
      renderNewsFeed();
    });
    
    elements.tagCloud.appendChild(tagPill);
  });
}

// --- Render News Feed ---
function renderNewsFeed() {
  // Clear Grid
  elements.newsGrid.innerHTML = "";
  
  // Filter articles
  let filtered = db.articles.filter(article => {
    // A. Category Filter
    if (activeFilters.category !== "all" && article.category !== activeFilters.category) {
      return false;
    }
    
    // B. Sentiment Filter
    if (activeFilters.sentiment !== "all" && article.sentiment !== activeFilters.sentiment) {
      return false;
    }
    
    // C. Tag Filter
    if (activeFilters.tag && (!article.tags || !article.tags.includes(activeFilters.tag))) {
      return false;
    }
    
    // D. Text Search Filter
    if (activeFilters.search) {
      const searchLower = activeFilters.search.toLowerCase();
      const matchTitle = article.title.toLowerCase().includes(searchLower);
      const matchSnippet = article.snippet.toLowerCase().includes(searchLower);
      const matchSource = article.source.toLowerCase().includes(searchLower);
      const matchAI = article.ai_summary && article.ai_summary.toLowerCase().includes(searchLower);
      const matchTags = article.tags && article.tags.some(t => t.toLowerCase().includes(searchLower));
      
      if (!matchTitle && !matchSnippet && !matchSource && !matchAI && !matchTags) {
        return false;
      }
    }
    
    return true;
  });
  
  // Sort articles
  filtered.sort((a, b) => {
    if (activeFilters.sort === "newest") {
      return new Date(b.published_at) - new Date(a.published_at);
    } else if (activeFilters.sort === "oldest") {
      return new Date(a.published_at) - new Date(b.published_at);
    } else if (activeFilters.sort === "title") {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });
  
  // Check empty state
  if (filtered.length === 0) {
    elements.newsGrid.innerHTML = `
      <div class="empty-state" id="news-feed-empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted);"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
        <h3>No Articles Found</h3>
        <p>No intelligence briefs match your current filter combinations. Try clearing your search parameters or selecting another tag.</p>
      </div>
    `;
    return;
  }
  
  // Render filtered lists
  filtered.forEach((article, index) => {
    const card = document.createElement("article");
    card.className = "glass-card news-card";
    card.id = `news-card-${index}`;
    
    // Style category classes
    let catClass = "singapore-p2p";
    if (article.category === "Global P2P") catClass = "global-p2p";
    if (article.category === "Consulting Opinions") catClass = "consulting-opinions";
    
    // Sentiment class
    const sentClass = (article.sentiment || "Neutral").toLowerCase();
    
    // Build tags markup
    const tagsMarkup = (article.tags || []).map(t => `<span class="card-tag">#${t}</span>`).join("");
    
    card.innerHTML = `
      <div class="news-card-header">
        <div class="news-meta-info">
          <span class="card-category-tag ${catClass}">${article.category}</span>
          <span class="card-source-dot">${article.source}</span>
        </div>
        <span class="sentiment-badge ${sentClass}">${article.sentiment || 'Neutral'}</span>
      </div>
      <h3 class="news-card-title">${article.title}</h3>
      <div class="news-date">${formatDate(article.published_at)}</div>
      
      <div class="ai-summary-block">
        ${article.ai_summary || article.snippet}
      </div>
      
      <div class="card-tags">
        ${tagsMarkup}
      </div>
      
      <div class="news-card-footer">
        <a href="${article.link}" target="_blank" rel="noopener noreferrer" class="read-original-link" id="link-read-original-${index}">
          Read Source
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </a>
      </div>
    `;
    
    elements.newsGrid.appendChild(card);
  });
}

// --- Setup Event Listeners ---
function setupEventListeners() {
  // Search input change
  elements.searchInput.addEventListener("input", (e) => {
    activeFilters.search = e.target.value.trim();
    renderNewsFeed();
  });
  
  // Sentiment selector
  elements.sentimentSelect.addEventListener("change", (e) => {
    activeFilters.sentiment = e.target.value;
    renderNewsFeed();
  });
  
  // Sort selector
  elements.sortSelect.addEventListener("change", (e) => {
    activeFilters.sort = e.target.value;
    renderNewsFeed();
  });
  
  // Category Pill bar clicking
  elements.categoryPills.addEventListener("click", (e) => {
    const pill = e.target.closest(".category-pill");
    if (!pill) return;
    
    // Toggle active classes
    document.querySelectorAll(".category-pill").forEach(p => p.classList.remove("active"));
    pill.classList.add("active");
    
    activeFilters.category = pill.getAttribute("data-category");
    renderNewsFeed();
  });
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", initDashboard);
