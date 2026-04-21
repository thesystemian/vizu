# Stack Setup — Vizu

## Stack complète

```
Veille       : n8n + RSS + yt-dlp + Perplexity API
Processing   : Claude API (Sonnet 4.6)
Visualisation: Flourish API / Manim / D3.js
Editing      : Creatomate API
Orchestration: n8n self-hosted
Publishing   : YouTube API + TikTok API
Tracking     : Google Sheets
```

## Installation n8n (self-hosted)

```bash
# Via npm
npm install n8n -g
n8n start

# Via Docker (recommandé)
docker run -d --name n8n \
  -p 5678:5678 \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=motdepasse \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

## APIs clés

| API | Plan gratuit | Limite | Inscription |
|-----|-------------|--------|-------------|
| Anthropic (Claude) | Non | Pay-per-use | anthropic.com |
| World Bank | Oui | Illimitée | Aucune |
| GitHub API | Oui | 5000 req/h | Token optionnel |
| ArXiv API | Oui | Illimitée | Aucune |
| Data.gouv.fr | Oui | Illimitée | Aucune |

## Variables d'environnement

```bash
# .env (ne jamais committer)
ANTHROPIC_API_KEY=sk-ant-api03-...
GOOGLE_SHEET_ID_A1=1ABC...xyz
N8N_WEBHOOK_A2=http://localhost:5678/webhook/a2
PERPLEXITY_API_KEY=pplx-...  # optionnel, phase 2
```
