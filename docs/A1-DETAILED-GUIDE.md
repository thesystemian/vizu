# A1 — Guide Détaillé d'Implémentation

## Vue d'ensemble

A1 est le **point d'entrée** de tout le pipeline Vizu. Sans A1 qui tourne, rien ne se passe. C'est le module "Oracle" : il cherche les failles entre le narratif officiel et les données brutes.

## Installation rapide

### 1. Cloner et configurer

```bash
cd ~/CreativeStudio/Vizu
cp .env.example .env   # créer le fichier env
# Remplir ANTHROPIC_API_KEY dans .env
```

### 2. Tester le prompt Claude directement

```python
import anthropic
import json

client = anthropic.Anthropic()  # lit ANTHROPIC_API_KEY depuis l'env

SYSTEM = """Tu es l'agent A1-Veilleur du système Vizu...
[voir prompts/A1-scraper-prompt.md pour le système prompt complet]
"""

article_test = """
Titre: L'OTAN atteint ses objectifs de défense
Source: Reuters
Date: 2026-04-20

Les membres de l'OTAN ont reconfirmé leur engagement à consacrer 2% de leur PIB 
à la défense. Le Secrétaire général déclare que "l'alliance est plus forte que jamais".
"""

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    system=SYSTEM,
    messages=[{"role": "user", "content": f"Analyse:\n{article_test}"}]
)

result = json.loads(response.content[0].text)
print(json.dumps(result, ensure_ascii=False, indent=2))
```

### 3. Importer le workflow n8n

1. Ouvrir n8n (localhost:5678)
2. Importer `n8n-workflows/A1-veille-scrappeur.json`
3. Configurer les credentials (Anthropic, Google Sheets)
4. Activer le workflow
5. Tester avec "Execute Workflow"

## Flux de données détaillé

```
RSS (Le Monde, Reuters, etc.)
    ↓ [n8n RSS node]
Articles bruts (titre, contenu, date, source)
    ↓
YT Transcripts (yt-dlp)
    ↓ [n8n Execute Command]
Transcripts texte brut
    ↓
Open Data APIs (World Bank, etc.)
    ↓ [n8n HTTP Request]
Données numériques contextuelles
    ↓
[MERGE]
    ↓
Claude API — Scoring & Structuration
    ↓
JSON structuré A1
    ↓ [IF score_tension >= 6]
Google Sheets (archive) + Trigger A2
```

## Troubleshooting fréquent

| Problème | Cause probable | Solution |
|----------|---------------|----------|
| Pas de JSON valide de Claude | Prompt mal formé | Vérifier que system prompt dit "JSON uniquement" |
| RSS timeout | Feed mort | Désactiver dans rss-feeds.json (`"actif": false`) |
| yt-dlp error | Pas installé | `pip install yt-dlp` |
| Score toujours > 6 | Filtre trop bas | Remonter à 7 dans le workflow n8n |

## Calibration du score de tension

Tester avec ces articles réels pour calibrer :
- **Score attendu 8+** : Tout article sur dépenses militaires OTAN
- **Score attendu 5-7** : Articles sur emploi et IA
- **Score attendu < 4** : Faits divers, météo, sport
