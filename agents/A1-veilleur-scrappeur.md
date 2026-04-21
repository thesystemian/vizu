# A1 — Veilleur-Scrappeur

**Rôle :** Oracle du système Vizu. Collecte, filtre et structure les signaux d'information bruts.

**Position dans le pipeline :**
```
[RSS / YT / APIs] → A1-Veilleur → JSON structuré → A2-Auditeur
```

---

## Identité

| Propriété | Valeur |
|-----------|--------|
| **ID** | A1 |
| **Nom** | Veilleur-Scrappeur |
| **Module** | Oracle |
| **Statut** | 🔄 En développement |
| **Priorité** | #1 — Semaine 1 |

---

## Mission

Surveiller en continu 5 catégories de sources (Mainstream, OSINT, Alt-Media, IA/Tech, Open Data), extraire les **affirmations chiffrées**, les croiser avec les bases de données brutes, et produire un JSON structuré qui alimente A2.

**Question directrice de A1 :**
> "Où y a-t-il un écart entre ce qui est dit officiellement et ce que montrent les données brutes ?"

---

## Inputs

### Sources surveillées

| Catégorie | Sources | Fréquence |
|-----------|---------|-----------|
| **Mainstream** | Reuters, AFP, Le Monde, BBC | Toutes les 6h |
| **OSINT / Géopo** | SIPRI, Our World in Data, Acled | Quotidien |
| **Alt-Media** | Tocsin, Géopolitique Profonde, Alexis Poulin | Quotidien |
| **IA / Tech** | ArXiv, HuggingFace, GitHub Trending | Quotidien |
| **Open Data** | World Bank API, UN Comtrade, INSEE | Hebdomadaire |

### Déclencheurs
- **Cron n8n** : 06h00, 12h00, 18h00 (heure Paris)
- **Manuel** : webhook POST `/trigger/A1`
- **Signal A5-Sentinelle** : si commentaire YouTube mentionne nouvelle piste → relance A1

---

## Process (6 étapes)

```
1. FETCH    → Tirer les flux RSS + scrape YT transcripts + appels API
2. PARSE    → Extraire : titre, date, source, affirmations chiffrées
3. FILTER   → Conserver uniquement les items avec tension mainstream/alternatif
4. ENRICH   → Croiser avec Open Data APIs (World Bank, Eurostat, INSEE)
5. SCORE    → Calculer un score de tension [0–10] via Claude API
6. OUTPUT   → Générer le JSON structuré
```

---

## Output

Format JSON produit par A1 :

```json
{
  "id": "A1-20260421-001",
  "timestamp": "2026-04-21T08:00:00Z",
  "sujet": "Dépenses militaires OTAN 2025",
  "categorie": "geopolitique",
  "affirmation_officielle": "Les membres OTAN respectent l'objectif 2% du PIB",
  "donnee_reelle": "Seulement 11/32 membres atteignent 2% (SIPRI 2025)",
  "ecart": "65% des membres sous l'objectif officiel",
  "score_tension": 8.5,
  "sources": [
    {"type": "mainstream", "url": "...", "titre": "..."},
    {"type": "open_data", "url": "sipri.org/databases/milex", "titre": "SIPRI Military Expenditure Database"}
  ],
  "mots_cles": ["OTAN", "dépenses militaires", "2%", "SIPRI"],
  "prompt_A2": "Vérifier les chiffres SIPRI vs déclarations officielles des 32 membres"
}
```

---

## Stack technique

| Composant | Outil | Config |
|-----------|-------|--------|
| **Orchestration** | n8n (self-hosted) | Workflow : `n8n-workflows/A1-veille-scrappeur.json` |
| **RSS parsing** | n8n RSS node | Sources : `sources/rss-feeds.json` |
| **YT transcripts** | yt-dlp + n8n HTTP | Sources : `sources/youtube-channels.json` |
| **Open Data** | n8n HTTP Request | Sources : `sources/open-data-apis.json` |
| **Scoring / LLM** | Claude API (Sonnet 4.6) | Prompt : `prompts/A1-scraper-prompt.md` |
| **Stockage** | Google Sheets + JSON files | Sheet ID : à configurer |

---

## Paramètres de filtrage

```yaml
score_tension_minimum: 6.0     # Ne garder que les sujets avec tension ≥ 6
categories_actives:
  - geopolitique
  - ia_tech
  - economie
langues: [fr, en]
max_items_par_run: 10           # Éviter le bruit
deduplication_window: 72h      # Ignorer les sujets déjà traités < 72h
```

---

## Métriques de succès A1

| Métrique | Cible Semaine 1 |
|----------|----------------|
| Items scrapés / jour | ≥ 50 |
| Items filtrés (tension ≥ 6) | ≥ 5 |
| Faux positifs | ≤ 20% |
| Temps de run complet | ≤ 10 min |
| JSON valide produit | 100% |

---

## Dépendances

- **Amont :** aucune (A1 = point d'entrée du système)
- **Aval :** A2-Auditeur (consomme le JSON A1)
- **APIs requises :** Claude API key, World Bank API (gratuit), optionnel : Perplexity API

---

## Évolutions prévues

- [ ] Intégration Exa.ai pour recherche sémantique (v0.2)
- [ ] Alertes Telegram si score_tension ≥ 9 (v0.2)
- [ ] Analyse de sentiment sur alt-media (v0.3)
- [ ] Cache Redis pour déduplication (v0.3)
