# VIZU — Everything is Data

**Mission:** Transform raw data into visual clarity. Help citizens become discerning through OSINT-driven journalism.

**Vision:** A solo-operated YouTube + TikTok + LinkedIn channel that visualizes **mainstream vs alternative** data narratives in geopolitics, IA, and tech — with no face, no voice, just **pure visual storytelling**.

---

## 📊 Project Structure

```
vizu-project/
├── /agents/               # Multi-agent automation (A1, A2, ..., A9)
│   ├── A1-veilleur-scrappeur.md     # Agent 1: Veille + Scraping (RSS, APIs, YT)
│   ├── A2-auditeur.md               # Agent 2: Fact-checking + validation
│   ├── A3-alchimiste.md             # Agent 3: Narrative tension generation
│   └── ... (A4-A9 in progress)
│
├── /prompts/              # Claude/GPT prompts for each agent
│   ├── A1-scraper-prompt.md
│   ├── A2-auditor-prompt.md
│   └── ...
│
├── /sources/              # RSS feeds, APIs, scraping configs
│   ├── rss-feeds.json     # All RSS feeds (Géopo, IA, Tech, Alt)
│   ├── youtube-channels.json  # YT sources to scrape
│   ├── open-data-apis.json    # Public data sources
│   └── sources-map.md     # Detailed source mapping
│
├── /n8n-workflows/        # n8n automation configs
│   ├── A1-veille-scrappeur.json
│   └── workflow-guide.md
│
├── /content/              # Output: Published content
│   ├── /shorts/           # 60sec shorts (YT, TikTok)
│   ├── /long-form/        # 8-15min videos (future)
│   ├── /linkedin/         # Text + static images
│   └── /analytics/        # Performance tracking
│
├── /docs/                 # Documentation
│   ├── WEEK-1-EXECUTION.md    # This week's roadmap
│   ├── A1-DETAILED-GUIDE.md   # A1 deep dive
│   ├── STACK-SETUP.md         # Tech stack guide
│   └── GDPR-ETHICS.md         # Scraping ethics
│
├── .gitignore
├── README.md              # This file
└── CHANGELOG.md           # Version history

```

---

## 🎯 Week 1 Execution (This Week)

| Day | Task | Owner | Status |
|-----|------|-------|--------|
| 1 | A1-Veilleur setup + RSS config | Dax | 🔄 |
| 2-3 | A1 test with 1 subject | Dax | ⏳ |
| 4-5 | Design 1st Short (manual) | Dax | ⏳ |
| 6 | Create YT channel + TikTok | Dax | ⏳ |
| 7 | Publish + update LinkedIn | Dax | ⏳ |

---

## 🤖 Agent Architecture

```
A1-Veilleur-Scrappeur
├─ Input: RSS feeds + YT + Data APIs
├─ Process: Collect raw data, flag tensions
└─ Output: "{sujet} | {donnee_mainstream} | {donnee_alt} | {tension}"
   ↓
A2-Auditeur (coming next)
├─ Verify sources
├─ Cross-check data
└─ Output: Confidence score + validated data
   ↓
A3-Alchimiste (later)
├─ Transform to narrative
└─ Output: Hook + Pivot + Revelation
   ↓
... A4-A9 (visual, montage, diffusion, etc.)
```

---

## 📚 Sources Integrated in A1

### Geopolitics (Mainstream + Alternative)
- SIPRI (militaire spending)
- Our World in Data
- Reuters, AFP
- Tocsin, Géopolitique Profonde, Alexis Poulin

### IA + Tech
- ArXiv, HuggingFace
- Crunchbase (optional: paid API)
- GitHub Trending
- Silicon Carne, Aberkane, Idriss J. Aberkane

### Open Data (Free)
- World Bank API
- UN Comtrade
- Google Trends (pytrends)
- INSEE (France)

---

## 🚀 Tech Stack

| Layer | Tool | Status |
|-------|------|--------|
| **Veille** | RSS feeds + YT-dlp + Perplexity API | ✅ |
| **Processing** | Claude 3.5 Sonnet (via API) | ✅ |
| **Visualization** | Flourish API / Manim / D3.js | 🔄 |
| **Editing** | Creatomate API / CapCut API | 🔄 |
| **Orchestration** | n8n self-hosted | ✅ |
| **Publishing** | YouTube API + TikTok API | 🔄 |
| **Tracking** | Google Sheets + Analytics | ✅ |

---

## 📈 Success Metrics (Week 1)

- [ ] A1 agent running
- [ ] 1 subject tested end-to-end
- [ ] 1 Short published
- [ ] YT + TikTok channels created
- [ ] LinkedIn profile updated with Vizu

---

## 🔐 Git Workflow

```bash
# Each day, push progress
git add . && git commit -m "Day X: A1 setup + test subject"

# Branches
main       # Production (published content)
dev        # Agent development
feature/A1 # Current agent sprint
```

---

## ⚖️ Legal & Ethics

- ✅ RSS feeds = public, legal to scrape
- ✅ YouTube transcripts = within ToS (YT-dlp)
- ✅ Open data APIs = free and public
- ⚠️ Verify data sources before publishing
- ⚠️ Always cite sources (maintain credibility)

---

## 👤 Operator

**Dax** (@thesystemian)
- Artist + visual intuition
- OSINT learner → citizen journalist
- Solo operator (Vizu = solo business)

---

## 📞 Next Steps

1. **This week:** A1-Veilleur setup (see `/docs/WEEK-1-EXECUTION.md`)
2. **Next week:** A1 test + first Short published
3. **Week 3:** A2-Auditeur integration
4. **Ongoing:** Scale agents A3-A9

---

**Last updated:** April 21, 2026
**Status:** 🔄 In Development
**Next checkpoint:** End of Week 1
