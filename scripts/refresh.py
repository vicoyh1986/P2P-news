#!/usr/bin/env python3
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
import json
import os
import re
import sys
from datetime import datetime, timezone

# Target Google News RSS Feed Queries
FEEDS = {
    "singapore_p2p": {
        "query": '"Grab" OR "Gojek" OR "Tada" OR "Ryde" OR "ComfortDelGro" OR "BlueSG" OR "GetGo" OR "car sharing" OR "carpooling" Singapore',
        "hl": "en-SG", "gl": "SG", "ceid": "SG:en",
        "category_label": "Singapore P2P"
    },
    "global_p2p": {
        "query": '"Uber" OR "Lyft" OR "DiDi" OR "Bolt" OR "Gojek" OR "Grab" OR "Ola" OR "Careem" OR "Cabify" OR "Zipcar" OR "Turo" OR "Getaround" OR "car sharing" OR "ride hailing" OR "shared mobility" OR "micromobility" OR "robotaxi"',
        "hl": "en-US", "gl": "US", "ceid": "US:en",
        "category_label": "Global P2P"
    },
    "consulting_opinions": {
        "query": 'McKinsey "mobility" OR BCG "mobility" OR Bain "mobility" OR "McKinsey Center for Future Mobility" OR "shared mobility report"',
        "hl": "en-US", "gl": "US", "ceid": "US:en",
        "category_label": "Consulting Opinions"
    }
}

def clean_html(raw_html):
    """Clean basic HTML tags from descriptions."""
    if not raw_html:
        return ""
    cleanr = re.compile('<.*?>')
    cleantext = re.sub(cleanr, '', raw_html)
    return urllib.parse.unquote(cleantext).strip()

def parse_pub_date(date_str):
    """Parse publication dates and return in ISO-8601 format."""
    # RFC 822 format typically: "Sun, 19 Jul 2026 12:00:00 GMT"
    formats = [
        "%a, %d %b %Y %H:%M:%S %Z",
        "%a, %d %b %Y %H:%M:%S %z",
        "%d %b %Y %H:%M:%S %z", # standard tz offset +0000 etc.
        "%d %b %Y %H:%M:%S %Z",
        "%Y-%m-%dT%H:%M:%S%z"
    ]
    for fmt in formats:
        try:
            dt = datetime.strptime(date_str.strip(), fmt)
            return dt.isoformat()
        except ValueError:
            continue
    return datetime.now(timezone.utc).isoformat()

def fetch_rss_feed(feed_name, config):
    """Fetch and parse feed items from Google News."""
    query_encoded = urllib.parse.quote_plus(config["query"])
    url = f"https://news.google.com/rss/search?q={query_encoded}&hl={config['hl']}&gl={config['gl']}&ceid={config['ceid']}"
    
    print(f"Fetching RSS feed for '{feed_name}' from: {url}")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    }
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=20) as response:
            xml_data = response.read()
            
        root = ET.fromstring(xml_data)
        items = []
        
        # Loop through all <item> tags in the RSS XML
        for item in root.findall('.//item'):
            title_node = item.find('title')
            link_node = item.find('link')
            pub_date_node = item.find('pubDate')
            desc_node = item.find('description')
            source_node = item.find('source')
            
            title_raw = title_node.text if title_node is not None else "No Title"
            link = link_node.text if link_node is not None else ""
            pub_date_raw = pub_date_node.text if pub_date_node is not None else ""
            description_raw = desc_node.text if desc_node is not None else ""
            source_raw = source_node.text if source_node is not None else "Google News"
            
            # Google News titles are usually "Title - Source"
            title = title_raw
            source_name = source_raw
            if " - " in title_raw:
                title, possible_source = title_raw.rsplit(" - ", 1)
                source_name = possible_source.strip()
            
            items.append({
                "title": title.strip(),
                "link": link,
                "published_at": parse_pub_date(pub_date_raw),
                "snippet": clean_html(description_raw),
                "source": source_name,
                "category": config["category_label"]
            })
            
        print(f"Successfully fetched {len(items)} items for {feed_name}")
        return items
    except Exception as e:
        print(f"Error fetching/parsing feed {feed_name}: {e}", file=sys.stderr)
        return []

def run_gemini_synthesis(api_key, articles):
    """Use Gemini API to synthesize and generate insights."""
    print("Connecting to Gemini API for analysis...")
    
    # Select a subset of high-quality/representative articles to send to Gemini
    # Sort articles by category first to ensure a balanced feed
    articles_by_cat = {}
    for a in articles:
        articles_by_cat.setdefault(a["category"], []).append(a)
        
    sampled_articles = []
    # Take up to 6 articles per category
    for cat, items in articles_by_cat.items():
        sampled_articles.extend(items[:6])
        
    # Prepare articles payload for Gemini prompt
    prompt_articles = []
    for i, a in enumerate(sampled_articles):
        prompt_articles.append({
            "idx": i,
            "title": a["title"],
            "source": a["source"],
            "category": a["category"],
            "snippet": a["snippet"]
        })
        
    prompt = f"""You are a senior McKinsey-trained strategy consultant specializing in global mobility, transportation, and point-to-point (P2P) infrastructure.
Analyze the following list of news articles representing current P2P transport developments (taxi, ride-hailing, autonomous vehicles) in Singapore and globally, as well as opinion pieces from top consulting firms.

Articles list (represented as JSON):
{json.dumps(prompt_articles, indent=2)}

Task:
Generate a highly strategic, professional, and insight-dense market digest in JSON format containing:
1. An Executive Briefing:
   - "headline": A short, impactful title for today's update.
   - "summary": A cohesive 2-3 paragraph macro-analysis summarizing today's key P2P developments, structural shifts, and strategic consulting narratives.
   - "key_themes": An array of 3 distinct themes (e.g., regulatory changes, driver supply dynamics, AV progress). For each theme, provide a 'theme' name and 'explanation' (2-3 sentences explaining why it's trending).
   - "strategic_takeaways": An array of 3 concrete strategic recommendations/takeaways for industry leaders, operators, or policymakers.
2. Individual Article Enhancements:
   - For each article in the provided list, output:
     - "idx": The original index of the article.
     - "ai_summary": A 2-3 sentence bulletproof summary outlining the exact core impact of this article.
     - "sentiment": Classification as "Positive", "Neutral", or "Negative".
     - "tags": Array of 2-3 highly descriptive keyword tags (e.g., "Regulation", "M&A", "EV", "Labor", "Tech").

IMPORTANT: Return ONLY a valid JSON object matching the schema below. Do not wrap it in markdown code blocks like ```json ... ```, do not write any introductory or trailing text. It must start with '{{' and end with '}}'.

JSON Schema:
{{
  "executive_brief": {{
    "headline": "...",
    "summary": "...",
    "key_themes": [
      {{ "theme": "...", "explanation": "..." }}
    ],
    "strategic_takeaways": [ "...", "...", "..." ]
  }},
  "articles": [
    {{
      "idx": 0,
      "ai_summary": "...",
      "sentiment": "...",
      "tags": [ "...", "..." ]
    }}
  ]
}}
"""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }],
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }
    
    try:
        req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method='POST')
        with urllib.request.urlopen(req, timeout=40) as response:
            result = json.loads(response.read().decode('utf-8'))
            
        raw_response = result['candidates'][0]['content']['parts'][0]['text'].strip()
        
        # Clean any accidental code block markers if the model ignored instructions
        if raw_response.startswith("```"):
            raw_response = re.sub(r"^```[a-zA-Z]*\s*", "", raw_response)
            raw_response = re.sub(r"\s*```$", "", raw_response)
            raw_response = raw_response.strip()
            
        parsed_insights = json.loads(raw_response)
        
        # Map the synthesized insights back to the original sampled articles
        ai_indexed = {item["idx"]: item for item in parsed_insights.get("articles", [])}
        
        final_articles = []
        for i, a in enumerate(sampled_articles):
            insight = ai_indexed.get(i, {})
            # Enrich original article metadata with AI results
            enriched = a.copy()
            enriched["ai_summary"] = insight.get("ai_summary", a["snippet"])
            enriched["sentiment"] = insight.get("sentiment", "Neutral")
            enriched["tags"] = insight.get("tags", ["News"])
            final_articles.append(enriched)
            
        # Add remaining articles that were not sampled, but give them empty/basic tags
        unsampled_set = set(id(x) for x in sampled_articles)
        for a in articles:
            if id(a) not in unsampled_set:
                basic_enriched = a.copy()
                basic_enriched["ai_summary"] = a["snippet"]
                basic_enriched["sentiment"] = "Neutral"
                basic_enriched["tags"] = ["General"]
                final_articles.append(basic_enriched)
                
        return parsed_insights.get("executive_brief"), final_articles

    except Exception as e:
        print(f"Error during Gemini AI synthesis: {e}", file=sys.stderr)
        return None, None

def generate_fallback_data(articles):
    """Generate default summaries and structure when Gemini is not available."""
    print("Using heuristic fallback engine (No AI Key provided)...")
    
    fallback_brief = {
        "headline": "P2P Market Daily Intelligence Briefing",
        "summary": "This briefing aggregates the latest regulatory updates, business expansions, and technology deployments in Singapore's Point-to-Point (P2P) transport market and global ride-hailing networks. Currently operating in standard tracking mode. To unlock senior executive-level analysis, strategic takeaways, and theme mappings, configure your Google Gemini API Key in your repository secrets.",
        "key_themes": [
            {
                "theme": "Local Regulatory Adjustments",
                "explanation": "Singapore's LTA continues monitoring fair-fare frameworks and ride-hailing supply levels."
            },
            {
                "theme": "Autonomous Vehicle Advancements",
                "explanation": "Global players focus on autonomous taxi trials, fleet operations, and safety standards."
            },
            {
                "theme": "Consulting Perspectives",
                "explanation": "Leading research papers underline the shift toward electric fleets and multimodal transport orchestration."
            }
        ],
        "strategic_takeaways": [
            "Monitor ongoing LTA review announcements regarding taxi driver vocational license reforms and taxi stand utilization.",
            "Assess strategic alignment with robotaxi platform providers as autonomous commercialization speeds up in major global hubs.",
            "Incorporate consulting methodologies around vehicle fleet utilization modeling to hedge against fuel and labor volatility."
        ]
    }
    
    final_articles = []
    for a in articles:
        enriched = a.copy()
        enriched["ai_summary"] = a["snippet"] if a["snippet"] else "View full article text via the link above."
        
        # Simple heuristic tagging and sentiment
        text_lower = (a["title"] + " " + a["snippet"]).lower()
        
        # Tags heuristic
        tags = []
        if any(x in text_lower for x in ["regulate", "lta", "law", "rule", "framework", "government"]):
            tags.append("Regulation")
        if any(x in text_lower for x in ["autonomous", "driverless", "waymo", "robotaxi", "tesla"]):
            tags.append("Autonomous")
        if any(x in text_lower for x in ["electric", "ev", "charging", "battery", "tesla"]):
            tags.append("EV")
        if any(x in text_lower for x in ["mckinsey", "bcg", "bain", "report", "consulting", "strategy"]):
            tags.append("Strategy")
            
        if not tags:
            tags.append("Mobility")
            
        # Sentiment heuristic
        sentiment = "Neutral"
        if any(x in text_lower for x in ["acquire", "grow", "profit", "launch", "partnership", "success", "milestone"]):
            sentiment = "Positive"
        elif any(x in text_lower for x in ["decline", "fine", "lawsuit", "protest", "strike", "loss", "shortage", "accident", "crash"]):
            sentiment = "Negative"
            
        enriched["sentiment"] = sentiment
        enriched["tags"] = tags[:3]
        final_articles.append(enriched)
        
    return fallback_brief, final_articles

def main():
    print(f"--- Dashboard Refresh Process Started: {datetime.now(timezone.utc).isoformat()} ---")
    
    # 1. Fetch from feeds
    all_articles = []
    seen_urls = set()
    seen_titles = set()
    
    for feed_name, config in FEEDS.items():
        feed_items = fetch_rss_feed(feed_name, config)
        for item in feed_items:
            # Simple de-duplication by URL or Title
            url = item["link"]
            title_normalized = item["title"].lower().strip()
            
            if url in seen_urls or title_normalized in seen_titles:
                continue
                
            seen_urls.add(url)
            seen_titles.add(title_normalized)
            all_articles.append(item)
            
    # Sort all articles by pubDate descending
    all_articles.sort(key=lambda x: x["published_at"], reverse=True)
    
    # Limit database size to keep it fast
    all_articles = all_articles[:60]
    
    print(f"Total compiled unique articles: {len(all_articles)}")
    if not all_articles:
        print("Warning: No news articles fetched. Dashboard refresh completed with empty array.")
    
    # 2. Extract API key and synthesize
    api_key = os.environ.get("GEMINI_API_KEY")
    
    if api_key:
        print("GEMINI_API_KEY environment variable detected.")
        exec_brief, structured_articles = run_gemini_synthesis(api_key, all_articles)
        
        # If Gemini synthesis failed, fall back gracefully
        if not exec_brief or not structured_articles:
            print("Gemini synthesis encountered errors. Initiating fallback parsing.")
            exec_brief, structured_articles = generate_fallback_data(all_articles)
            ai_active = False
        else:
            print("Gemini AI analysis successfully integrated!")
            ai_active = True
    else:
        print("No GEMINI_API_KEY environment variable detected. Running in standard RSS aggregation mode.")
        exec_brief, structured_articles = generate_fallback_data(all_articles)
        ai_active = False
        
    # 3. Save JSON structure
    output_data = {
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "ai_active": ai_active,
        "executive_brief": exec_brief,
        "articles": structured_articles
    }
    
    # Ensure data directory exists
    os.makedirs("data", exist_ok=True)
    
    output_path = os.path.join("data", "news_data.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully generated dynamic dataset: {output_path}")
    print("--- Dashboard Refresh Process Completed ---")

if __name__ == "__main__":
    main()
