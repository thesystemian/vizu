# Semaine 1 — Plan d'exécution

**Objectif :** A1 opérationnel + 1er Short publié

## Jour 1 (Aujourd'hui) — Setup A1

- [x] Structure repo Git créée
- [x] README.md complet
- [x] Agent A1-veilleur-scrappeur.md documenté
- [x] Prompt Claude A1 écrit
- [x] Sources configurées (RSS, YT, APIs)
- [x] Workflow n8n skeleton créé
- [ ] Push GitHub initial
- [ ] Configurer n8n : importer le workflow A1
- [ ] Tester RSS fetch (3 feeds)
- [ ] Tester appel Claude API avec un article test

## Jour 2-3 — Test sujet complet

- [ ] Choisir 1 sujet fort (ex: dépenses militaires OTAN)
- [ ] Run A1 manuel sur ce sujet
- [ ] Valider le JSON output
- [ ] Croiser avec World Bank API
- [ ] Vérifier score de tension

## Jour 4-5 — 1er Short (manuel)

- [ ] Prendre le JSON validé de A1
- [ ] Créer le visuel (Flourish ou Canva)
- [ ] Assembler le Short (60 sec)
- [ ] Format : 1080x1920 (vertical)

## Jour 6 — Canaux

- [ ] Créer chaîne YouTube "Vizu"
- [ ] Créer compte TikTok "Vizu"
- [ ] Mettre à jour LinkedIn profil Dax

## Jour 7 — Publication + retour

- [ ] Publier le Short YT + TikTok
- [ ] Post LinkedIn avec le court
- [ ] Analyser les premiers retours
- [ ] Documenter dans CHANGELOG.md

---

## Variables d'environnement à configurer

```bash
# Créer un fichier .env (jamais committé)
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_SHEET_ID_A1=1xyz...
N8N_WEBHOOK_A2=http://localhost:5678/webhook/a2
```

## Prérequis techniques

- [ ] n8n self-hosted installé (localhost:5678)
- [ ] yt-dlp installé (`pip install yt-dlp`)
- [ ] Python 3.10+ avec `anthropic` SDK (`pip install anthropic`)
- [ ] Compte Google Sheets API activé
