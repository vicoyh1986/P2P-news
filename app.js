// --- P2P Intelligence Dashboard Core Logic ---

let db = {};
let activeFilters = {
  category: "all",
  sentiment: "all",
  tag: null,
  search: "",
  sort: "newest"
};

// DOM Cache
const elements = {
  lastUpdated: document.getElementById("last-updated-time"),
  engineStatusBadge: document.getElementById("engine-status-badge"),
  engineStatusText: document.getElementById("engine-status-text"),
  briefingHeadline: document.getElementById("briefing-headline"),
  briefingSummary: document.getElementById("briefing-summary-content"),
  themesList: document.getElementById("strategic-themes-list"),
  takeawaysList: document.getElementById("executive-takeaways-list"),
  
  // Analytics
  countSgP2p: document.getElementById("count-sg-p2p"),
  countGlobalP2p: document.getElementById("count-global-p2p"),
  countDecks: document.getElementById("count-decks"),
  countConsulting: document.getElementById("count-consulting"),
  barSgP2p: document.getElementById("bar-sg-p2p"),
  barGlobalP2p: document.getElementById("bar-global-p2p"),
  barDecks: document.getElementById("bar-decks"),
  barConsulting: document.getElementById("bar-consulting"),
  
  // Sentiment
  pctPos: document.getElementById("pct-pos"),
  pctNeu: document.getElementById("pct-neu"),
  pctNeg: document.getElementById("pct-neg"),
  segPos: document.getElementById("seg-pos"),
  segNeu: document.getElementById("seg-neu"),
  segNeg: document.getElementById("seg-neg"),
  
  // Tag cloud
  tagCloud: document.getElementById("keyword-cloud-container"),
  
  // Controls
  searchInput: document.getElementById("search-bar-input"),
  sentimentSelect: document.getElementById("filter-sentiment-select"),
  sortSelect: document.getElementById("sort-order-select"),
  categoryPills: document.getElementById("category-pills-bar"),
  
  // Grid
  newsGrid: document.getElementById("news-grid-feed"),
  
  // Systems Dynamics Matrix
  scatterCanvas: document.getElementById("scatter-canvas"),
  matrixActiveInfo: document.getElementById("matrix-active-info-box")
};

// Inline Mock Database (Fallback for CORS / offline / filesystem opening)
const CORS_FALLBACK_DB = {
  last_updated: "2026-07-20T12:00:00.000000+00:00",
  ai_active: false,
  executive_brief: {
    headline: "System Dynamics of Global Shared Fleet Operations & Curb Economies",
    summary: "This briefing analyzes the global passenger transport markets, ride-hailing networks, and car-sharing structures under the dual-framework of McKinsey partner methodologies and MIT transportation systems planning. The market is defined by a massive tension between operational systems efficiency (optimized dispatch, empty cruising reduction) and urban policy friction (congestion caps, curb-space regulations, driver-gig classification laws). Overcoming these bottlenecks is the next frontier of shared mobility scaling.",
    key_themes: [
      {
        theme: "Vehicle Miles Traveled (VMT) Displacement",
        explanation: "Extensive empirical research shows that ride-hailing fleets increase urban deadheading (empty cruise time) by 35-40%, directly competing with public mass transit corridors."
      },
      {
        theme: "Dynamic Curb Space Allocation",
        explanation: "Curb management has shifted from a static parking problem to a dynamic throughput bottleneck, driving municipal demand for geofenced pickup/dropoff zones."
      },
      {
        theme: "Driver Supply Elasticity Under Regulatory Caps",
        explanation: "Driver wage-floors and regulatory vocational licensing barriers limit real-time vehicle supply, forcing platforms to deploy highly aggressive algorithmic incentives."
      }
    ],
    strategic_takeaways: [
      "Incorporate dynamic VMT charging metrics into operator operational expense projections to hedge against municipal congestion charges.",
      "Establish co-load geofencing agreements with city councils to lower curbside dwell times and reduce double-parking fines.",
      "Develop hybrid dispatch simulations modeling battery charge decay and grid pricing to buffer against future fleet electrification mandates."
    ]
  },
  articles: [
    {
      title: "Uber Investor Day 2026: Autonomous Commercialization Partnerships & Global Rollout Plan",
      link: "https://investor.uber.com",
      published_at: "2026-07-20T08:15:00Z",
      snippet: "Uber's strategic presentation highlights its central role as the marketplace coordinator for autonomous vehicle (AV) manufacturers, outlining global integration with Waymo and BYD.",
      source: "Uber Investor Relations",
      category: "Strategy Decks",
      ai_summary: "Uber presents its autonomous transition roadmap, positioning its dispatch software as the indispensable middleware layer linking AV manufacturers with global passenger demand.",
      sentiment: "Positive",
      tags: ["AV Fleet", "Strategy", "Corporate"],
      academic_analysis: {
        systems_impact: "Drastically minimizes deadheading ratios via high-density pool routing, but adds severe peak charging loads to municipal electricity grids.",
        methodological_assumptions: "Assumes AV fleets can navigate dynamic curbside geofences without high per-minute dwell-time fees from municipal transit authorities.",
        professors_critique: "An exceptionally optimized marketplace dispatch paradigm, yet highly vulnerable to localized city-council congestion caps and autonomous operating quotas.",
        systems_efficiency: 88,
        policy_friction: 65
      }
    },
    {
      title: "Grab Singapore logs record rides demand, outlines AI dynamic dispatching updates",
      link: "https://www.grab.com",
      published_at: "2026-07-19T06:30:00Z",
      snippet: "Grab's Southeast Asian update reports record high active commuter levels, citing a 15% reduction in empty cruising miles thanks to a new predictive hexagonal supply-allocator algorithm.",
      source: "Grab Corporate Briefing",
      category: "Strategy Decks",
      ai_summary: "Grab logs robust passenger demand growth in Singapore and deploys next-gen spatial AI algorithms to allocate drivers to high-demand clusters prior to surge triggers.",
      sentiment: "Positive",
      tags: ["Labor Elasticity", "Tech", "Singapore"],
      academic_analysis: {
        systems_impact: "Improves local driver utilization density, reducing localized vehicle queues around transport hubs.",
        methodological_assumptions: "Assumes driver labor supply is completely elastic under variable platform incentive commissions during rainy peak-hours.",
        professors_critique: "Excellent mathematical yield maximization at micro-scales, though it fails to coordinate with cross-modal public rail schedules, leading to localized curb saturation.",
        systems_efficiency: 78,
        policy_friction: 45
      }
    },
    {
      title: "DiDi Global Electrification Dynamics & Dynamic Battery Charging Simulation Model",
      link: "https://www.didiglobal.com",
      published_at: "2026-07-18T11:00:00Z",
      snippet: "DiDi's technical whitepaper outlines its new simulation platform modeling EV fleet recharging cycles across Shenzhen and Beijing, minimizing battery wear during grid peak price periods.",
      source: "DiDi Research Labs",
      category: "Strategy Decks",
      ai_summary: "DiDi releases modeling tools for fleet-level EV charging scheduling, aligning vehicle battery recharge cycles with off-peak grid rates to optimize operating economics.",
      sentiment: "Neutral",
      tags: ["Electrification", "Infrastructure", "Tech"],
      academic_analysis: {
        systems_impact: "Minimizes localized grid overloads by distributing EV recharging across decentralized, geofenced charging hubs.",
        methodological_assumptions: "Presumes high charger uptime metrics and frictionless access to high-voltage municipal grids across suburban clusters.",
        professors_critique: "Highly rigorous systems modeling of EV economics, though fails to account for battery cell degradation variances in extremely warm weather climates.",
        systems_efficiency: 82,
        policy_friction: 55
      }
    },
    {
      title: "LTA updates Point-to-Point regulatory framework to ensure driver sustainability",
      link: "https://www.lta.gov.sg",
      published_at: "2026-07-19T08:30:00Z",
      snippet: "Singapore LTA is launching a series of consultations with local taxi associations and ride-hailing networks to streamline driver entry requirements, vocational license assessments, and fair fare structures.",
      source: "LTA Singapore",
      category: "Singapore P2P",
      ai_summary: "The Land Transport Authority of Singapore is restructuring P2P standards to lower entry barriers and reinforce vocational driver supply, addressing ongoing commuter shortages.",
      sentiment: "Positive",
      tags: ["Regulation", "Labor Elasticity", "Singapore"]
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
      tags: ["AV Fleet", "Strategy", "Tech"]
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
      tags: ["AV Fleet", "Electrification", "Tech"]
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
      tags: ["Electrification", "Strategy", "Infrastructure"]
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
      tags: ["Regulation", "Labor Elasticity", "Corporate"]
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
  
  // 3. Render Systems Dynamics Scatter Plot Matrix
  renderSystemsMatrix();
  
  // 4. Render Analytics & Metrics
  renderMetrics();
  
  // 5. Render News Feed Cards
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

// --- Render Systems Dynamics 2D Scatter Matrix ---
function renderSystemsMatrix() {
  const articles = db.articles || [];
  
  // Filter for items that contain academic coordinates
  const matrixItems = articles.filter(a => a.academic_analysis && a.academic_analysis.systems_efficiency !== undefined);
  
  if (matrixItems.length === 0) {
    elements.scatterCanvas.innerHTML = `<div class="no-data-plot">No Strategy Decks found to map.</div>`;
    return;
  }
  
  elements.scatterCanvas.innerHTML = "";
  
  matrixItems.forEach((article, index) => {
    const analysis = article.academic_analysis;
    const eff = analysis.systems_efficiency;
    const fric = analysis.policy_friction;
    
    // Select color based on category/source
    let dotColor = "var(--color-secondary)"; // Electric Cyan
    if (article.title.toLowerCase().includes("uber")) dotColor = "var(--color-accent)"; // Neon Violet
    if (article.title.toLowerCase().includes("didi")) dotColor = "var(--color-gold)"; // Neon Gold
    
    const dot = document.createElement("div");
    dot.className = `matrix-dot ${index === 0 ? 'active' : ''}`;
    dot.id = `matrix-dot-${index}`;
    
    // Set absolute positions (X-axis = Friction, Y-axis = Efficiency)
    // Left maps to policy friction; bottom maps to systems efficiency
    dot.style.left = `${fric}%`;
    dot.style.bottom = `${eff}%`;
    dot.style.backgroundColor = dotColor;
    dot.style.color = dotColor; // Store for box shadows
    
    // Active display function
    const activateDot = () => {
      document.querySelectorAll(".matrix-dot").forEach(d => d.classList.remove("active"));
      dot.classList.add("active");
      
      // Update Detail box on right
      elements.matrixActiveInfo.innerHTML = `
        <div class="info-box-active">
          <span class="info-box-source">${article.source} • Coords: [${fric}, ${eff}]</span>
          <h4>${article.title}</h4>
          
          <div class="info-box-scores">
            <div class="score-badge">
              <span class="score-num eff">${eff}%</span>
              <span class="score-lbl">Systems Efficiency</span>
            </div>
            <div class="score-badge">
              <span class="score-num fric">${fric}%</span>
              <span class="score-lbl">Policy Friction</span>
            </div>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong style="display: block; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px;">Assumptions Critique:</strong>
            <p style="font-size: 0.85rem; color: var(--text-main); line-height: 1.45;">${analysis.methodological_assumptions}</p>
          </div>
          
          <div class="info-box-critique">
            <h5>MIT Transport Critique</h5>
            <p>${analysis.professors_critique}</p>
          </div>
        </div>
      `;
    };
    
    dot.addEventListener("click", activateDot);
    dot.addEventListener("mouseenter", activateDot);
    
    elements.scatterCanvas.appendChild(dot);
    
    // Trigger initial activation for first element
    if (index === 0) {
      activateDot();
    }
  });
}

// --- Render Analytics Metrics ---
function renderMetrics() {
  const articles = db.articles || [];
  const total = articles.length;
  
  if (total === 0) return;
  
  // A. Category Volume Breakdowns
  const counts = { "Singapore P2P": 0, "Global P2P": 0, "Strategy Decks": 0, "Consulting Opinions": 0 };
  articles.forEach(a => {
    if (counts[a.category] !== undefined) counts[a.category]++;
  });
  
  const pctSg = Math.round((counts["Singapore P2P"] / total) * 100) || 0;
  const pctGlobal = Math.round((counts["Global P2P"] / total) * 100) || 0;
  const pctDecks = Math.round((counts["Strategy Decks"] / total) * 100) || 0;
  const pctConsulting = Math.round((counts["Consulting Opinions"] / total) * 100) || 0;
  
  elements.countSgP2p.innerText = `${pctSg}% (${counts["Singapore P2P"]})`;
  elements.countGlobalP2p.innerText = `${pctGlobal}% (${counts["Global P2P"]})`;
  elements.countDecks.innerText = `${pctDecks}% (${counts["Strategy Decks"]})`;
  elements.countConsulting.innerText = `${pctConsulting}% (${counts["Consulting Opinions"]})`;
  
  elements.barSgP2p.style.width = `${pctSg}%`;
  elements.barGlobalP2p.style.width = `${pctGlobal}%`;
  elements.barDecks.style.width = `${pctDecks}%`;
  elements.barConsulting.style.width = `${pctConsulting}%`;
  
  // B. Sentiment Distributions
  const sentiments = { "Positive": 0, "Neutral": 0, "Negative": 0 };
  articles.forEach(a => {
    const s = a.sentiment || "Neutral";
    if (sentiments[s] !== undefined) sentiments[s]++;
  });
  
  const pctPos = Math.round((sentiments["Positive"] / total) * 100) || 0;
  const pctNeu = Math.round((sentiments["Neutral"] / total) * 100) || 0;
  const pctNeg = Math.round((sentiments["Negative"] / total) * 100) || 0;
  
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
  
  const sortedTags = Object.entries(tagsMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);
    
  elements.tagCloud.innerHTML = "";
  
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
  elements.newsGrid.innerHTML = "";
  
  // Filter articles
  let filtered = (db.articles || []).filter(article => {
    if (activeFilters.category !== "all" && article.category !== activeFilters.category) {
      return false;
    }
    if (activeFilters.sentiment !== "all" && article.sentiment !== activeFilters.sentiment) {
      return false;
    }
    if (activeFilters.tag && (!article.tags || !article.tags.includes(activeFilters.tag))) {
      return false;
    }
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
  
  filtered.forEach((article, index) => {
    const card = document.createElement("article");
    card.id = `news-card-${index}`;
    
    // Style category classes
    let catClass = "singapore-p2p";
    if (article.category === "Global P2P") catClass = "global-p2p";
    if (article.category === "Consulting Opinions") catClass = "consulting-opinions";
    if (article.category === "Strategy Decks") catClass = "strategy-decks";
    
    // Sentiment class
    const sentClass = (article.sentiment || "Neutral").toLowerCase();
    
    // Build tags markup
    const tagsMarkup = (article.tags || []).map(t => `<span class="card-tag">#${t}</span>`).join("");
    
    // Check if we render standard card or upgraded academic-grade strategy deck panel
    const hasAcademic = (article.academic_analysis && article.academic_analysis.systems_impact !== undefined);
    
    if (hasAcademic) {
      card.className = "glass-card news-card academic-card";
      
      const analysis = article.academic_analysis;
      const cardId = `academic-card-${index}`;
      
      card.innerHTML = `
        <div class="news-card-header">
          <div class="news-meta-info">
            <span class="card-category-tag" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #ffffff;">${article.category}</span>
            <span class="card-source-dot">${article.source}</span>
          </div>
          <span class="sentiment-badge ${sentClass}">${article.sentiment || 'Neutral'}</span>
        </div>
        <h3 class="news-card-title">${article.title}</h3>
        <div class="news-date">${formatDate(article.published_at)}</div>
        
        <!-- Multi-Tab Navigation inside the card -->
        <div class="card-academic-tabs">
          <button class="academic-tab-btn active" data-target="${cardId}-brief">Strategy Brief</button>
          <button class="academic-tab-btn" data-target="${cardId}-mit">MIT Systems Critique</button>
          <button class="academic-tab-btn" data-target="${cardId}-dynamics">Method Assumptions</button>
        </div>
        
        <!-- Tab Content Areas -->
        <div class="academic-tab-contents">
          <!-- Section 1: Briefing -->
          <div class="academic-content-section active" id="${cardId}-brief">
            <div class="ai-summary-block" style="border-left-color: var(--color-secondary);">
              ${article.ai_summary || article.snippet}
            </div>
          </div>
          
          <!-- Section 2: MIT Critique -->
          <div class="academic-content-section" id="${cardId}-mit">
            <div class="academic-critique-box">
              <div class="academic-critique-header">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
                Systems Impact Assessment
              </div>
              <p style="font-size: 0.85rem; line-height: 1.45; color: var(--text-muted); margin-bottom: 10px;">${analysis.systems_impact}</p>
              
              <div class="academic-critique-header">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                Professor's Verdict
              </div>
              <div class="academic-critique-text">${analysis.professors_critique}</div>
            </div>
          </div>
          
          <!-- Section 3: Assumptions & Grid Scores -->
          <div class="academic-content-section" id="${cardId}-dynamics">
            <div class="ai-summary-block" style="border-left-color: var(--color-accent); font-style: italic;">
              ${analysis.methodological_assumptions}
            </div>
            <div class="academic-metrics-pills">
              <div class="academic-pill-indicator">
                <span class="academic-pill-label">Dispatch Efficiency</span>
                <span class="academic-pill-val eff">${analysis.systems_efficiency}%</span>
              </div>
              <div class="academic-pill-indicator">
                <span class="academic-pill-label">Policy Friction</span>
                <span class="academic-pill-val fric">${analysis.policy_friction}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="card-tags" style="margin-top: 15px;">
          ${tagsMarkup}
        </div>
        
        <div class="news-card-footer" style="margin-top: 15px;">
          <a href="${article.link}" target="_blank" rel="noopener noreferrer" class="read-original-link" id="link-read-original-${index}">
            Read Slide Deck
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </a>
        </div>
      `;
      
      // Setup inner-card tab-switching click handlers
      const buttons = card.querySelectorAll(".academic-tab-btn");
      buttons.forEach(btn => {
        btn.addEventListener("click", () => {
          card.querySelectorAll(".academic-tab-btn").forEach(b => b.classList.remove("active"));
          card.querySelectorAll(".academic-content-section").forEach(s => s.classList.remove("active"));
          
          btn.classList.add("active");
          const targetId = btn.getAttribute("data-target");
          card.querySelector(`#${targetId}`).classList.add("active");
        });
      });
      
    } else {
      card.className = "glass-card news-card";
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
    }
    
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
