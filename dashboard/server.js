#!/usr/bin/env node
/**
 * VIZU Dashboard Server — v2.0
 * Express + SQLite + lecture/écriture des fichiers repo
 */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Chemins
const REPO_ROOT = path.resolve(__dirname, '..');
const SOURCES_DIR = path.join(REPO_ROOT, 'sources');
const AGENTS_DIR = path.join(REPO_ROOT, 'agents');
const DB_PATH = path.join(__dirname, 'vizu.db');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================================
// DATABASE
// ============================================================================

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error('DB error:', err);
  else { console.log('✅ DB:', DB_PATH); initDB(); }
});

const dbRun = (sql, p = []) => new Promise((res, rej) => db.run(sql, p, function(e) { e ? rej(e) : res(this); }));
const dbGet = (sql, p = []) => new Promise((res, rej) => db.get(sql, p, (e, r) => e ? rej(e) : res(r)));
const dbAll = (sql, p = []) => new Promise((res, rej) => db.all(sql, p, (e, r) => e ? rej(e) : res(r || [])));

function initDB() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT DEFAULT 'scrape',
      score_tension REAL DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER NOT NULL,
      agent TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      phase_num INTEGER DEFAULT 1,
      articles_found INTEGER DEFAULT 0,
      confidence_score REAL DEFAULT 0,
      output TEXT,
      error TEXT,
      started_at DATETIME,
      completed_at DATETIME,
      FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS weekly_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      week TEXT NOT NULL UNIQUE,
      shorts_count INTEGER DEFAULT 0,
      youtube_views INTEGER DEFAULT 0,
      tiktok_views INTEGER DEFAULT 0,
      linkedin_impressions INTEGER DEFAULT 0,
      ai_cost_usd REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS publishing_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER NOT NULL,
      platform TEXT NOT NULL,
      url TEXT,
      views INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS agent_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      log TEXT,
      triggered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME
    )`);

    console.log('📊 DB schema ready');
  });
}

// ============================================================================
// UTILS
// ============================================================================

function getCurrentWeek() {
  const now = new Date();
  const year = now.getFullYear();
  const d = new Date(Date.UTC(year, 0, 1));
  const dayNum = Math.ceil((((now - d) / 86400000) + d.getUTCDay() + 1) / 7);
  return `${year}-W${String(dayNum).padStart(2, '0')}`;
}

function readJSON(filepath) {
  try { return JSON.parse(fs.readFileSync(filepath, 'utf8')); }
  catch { return null; }
}

function writeJSON(filepath, data) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
}

// Parse frontmatter YAML basique depuis un fichier .md
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const result = {};
  match[1].split('\n').forEach(line => {
    const [k, ...v] = line.split(':');
    if (k && v.length) result[k.trim()] = v.join(':').trim().replace(/^["']|["']$/g, '');
  });
  return result;
}

// ============================================================================
// API: STATUS
// ============================================================================

app.get('/api/status', async (req, res) => {
  try {
    const week = getCurrentWeek();
    const subjects = await dbAll('SELECT * FROM subjects ORDER BY created_at DESC LIMIT 20');
    const jobs = await dbAll('SELECT * FROM jobs ORDER BY id DESC LIMIT 50');
    let metrics = await dbGet('SELECT * FROM weekly_metrics WHERE week = ?', [week]);
    if (!metrics) {
      await dbRun('INSERT INTO weekly_metrics (week) VALUES (?)', [week]);
      metrics = await dbGet('SELECT * FROM weekly_metrics WHERE week = ?', [week]);
    }
    res.json({ week, subjects, jobs, metrics });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============================================================================
// API: SUBJECTS (Pipeline Kanban)
// ============================================================================

app.get('/api/subjects', async (req, res) => {
  try {
    const subjects = await dbAll('SELECT * FROM subjects ORDER BY created_at DESC');
    res.json(subjects);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/subjects', async (req, res) => {
  try {
    const { name, category, notes, score_tension } = req.body;
    const r = await dbRun(
      'INSERT INTO subjects (name, category, notes, score_tension) VALUES (?, ?, ?, ?)',
      [name, category, notes || '', score_tension || 0]
    );
    const subject = await dbGet('SELECT * FROM subjects WHERE id = ?', [r.lastID]);
    res.json(subject);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/subjects/:id', async (req, res) => {
  try {
    const fields = [];
    const vals = [];
    const allowed = ['name', 'category', 'status', 'score_tension', 'notes'];
    allowed.forEach(k => {
      if (req.body[k] !== undefined) { fields.push(`${k} = ?`); vals.push(req.body[k]); }
    });
    if (!fields.length) return res.status(400).json({ error: 'Nothing to update' });
    fields.push('updated_at = CURRENT_TIMESTAMP');
    vals.push(req.params.id);
    await dbRun(`UPDATE subjects SET ${fields.join(', ')} WHERE id = ?`, vals);
    const subject = await dbGet('SELECT * FROM subjects WHERE id = ?', [req.params.id]);
    res.json(subject);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/subjects/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM subjects WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============================================================================
// API: AGENTS (lecture dynamique depuis /agents/*.md)
// ============================================================================

// Liste des agents — scanne le dossier /agents/ + enrichit avec dernière exécution DB
app.get('/api/agents', async (req, res) => {
  try {
    // Agents définis dans /agents/*.md
    const files = fs.existsSync(AGENTS_DIR)
      ? fs.readdirSync(AGENTS_DIR).filter(f => f.endsWith('.md'))
      : [];

    const agents = files.map(file => {
      const content = fs.readFileSync(path.join(AGENTS_DIR, file), 'utf8');
      const fm = parseFrontmatter(content);
      // Fallback : extraire depuis le nom de fichier si pas de frontmatter
      const match = file.match(/^(A\d+)-(.+)\.md$/);
      return {
        id: fm.id || (match ? match[1] : file),
        nom: fm.nom || (match ? match[2].replace(/-/g, ' ') : file),
        statut: fm.statut || 'en-dev',
        priorite: fm.priorite ? parseInt(fm.priorite) : 99,
        webhook_n8n: fm.webhook_n8n || null,
        file
      };
    });

    // Trier par priorité
    agents.sort((a, b) => a.priorite - b.priorite);

    // Enrichir avec la dernière exécution depuis la DB
    const runs = await dbAll('SELECT agent_id, MAX(triggered_at) as last_run, status FROM agent_runs GROUP BY agent_id');
    const runMap = Object.fromEntries(runs.map(r => [r.agent_id, r]));

    const enriched = agents.map(a => ({
      ...a,
      last_run: runMap[a.id]?.last_run || null,
      last_status: runMap[a.id]?.status || null
    }));

    res.json(enriched);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Trigger manuel d'un agent (webhook n8n ou simulation)
app.post('/api/agents/:id/trigger', async (req, res) => {
  try {
    const agentId = req.params.id;
    const r = await dbRun(
      'INSERT INTO agent_runs (agent_id, status) VALUES (?, ?)',
      [agentId, 'running']
    );
    // Si webhook n8n configuré, on le call
    // (en prod: fetch(webhook_url, { method: 'POST', body: JSON.stringify(req.body) }))
    res.json({ run_id: r.lastID, agent_id: agentId, status: 'running' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Logs d'un agent
app.get('/api/agents/:id/runs', async (req, res) => {
  try {
    const runs = await dbAll(
      'SELECT * FROM agent_runs WHERE agent_id = ? ORDER BY triggered_at DESC LIMIT 20',
      [req.params.id]
    );
    res.json(runs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============================================================================
// API: SOURCES (lecture/écriture des JSON du repo)
// ============================================================================

const SOURCE_FILES = {
  rss: 'rss-feeds.json',
  youtube: 'youtube-channels.json',
  apis: 'open-data-apis.json'
};

app.get('/api/sources/:type', (req, res) => {
  const file = SOURCE_FILES[req.params.type];
  if (!file) return res.status(404).json({ error: 'Unknown source type' });
  const data = readJSON(path.join(SOURCES_DIR, file));
  if (!data) return res.status(404).json({ error: 'File not found' });
  res.json(data);
});

// Toggle actif/inactif sur une source : PATCH /api/sources/rss/mainstream/0
app.patch('/api/sources/:type/:category/:index', (req, res) => {
  try {
    const file = SOURCE_FILES[req.params.type];
    if (!file) return res.status(404).json({ error: 'Unknown source type' });
    const filepath = path.join(SOURCES_DIR, file);
    const data = readJSON(filepath);
    if (!data) return res.status(404).json({ error: 'File not found' });

    const cat = req.params.category;
    const idx = parseInt(req.params.index);

    // Support rss (feeds.category[]) et youtube (channels.category[]) et apis (apis.category[])
    const section = data.feeds || data.channels || data.apis;
    if (section && section[cat] && section[cat][idx]) {
      Object.assign(section[cat][idx], req.body);
      data.last_updated = new Date().toISOString().split('T')[0];
      writeJSON(filepath, data);
      res.json(section[cat][idx]);
    } else {
      res.status(404).json({ error: 'Entry not found' });
    }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Ajouter une source
app.post('/api/sources/:type/:category', (req, res) => {
  try {
    const file = SOURCE_FILES[req.params.type];
    if (!file) return res.status(404).json({ error: 'Unknown source type' });
    const filepath = path.join(SOURCES_DIR, file);
    const data = readJSON(filepath);
    if (!data) return res.status(404).json({ error: 'File not found' });

    const section = data.feeds || data.channels || data.apis;
    const cat = req.params.category;
    if (!section[cat]) section[cat] = [];
    section[cat].push(req.body);
    data.last_updated = new Date().toISOString().split('T')[0];
    writeJSON(filepath, data);
    res.json(req.body);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============================================================================
// API: METRICS
// ============================================================================

app.get('/api/metrics', async (req, res) => {
  try {
    const week = getCurrentWeek();
    let m = await dbGet('SELECT * FROM weekly_metrics WHERE week = ?', [week]);
    if (!m) {
      await dbRun('INSERT INTO weekly_metrics (week) VALUES (?)', [week]);
      m = await dbGet('SELECT * FROM weekly_metrics WHERE week = ?', [week]);
    }
    res.json(m);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/metrics', async (req, res) => {
  try {
    const week = getCurrentWeek();
    const allowed = ['shorts_count', 'youtube_views', 'tiktok_views', 'linkedin_impressions', 'ai_cost_usd'];
    const fields = []; const vals = [];
    allowed.forEach(k => { if (req.body[k] !== undefined) { fields.push(`${k} = ?`); vals.push(req.body[k]); } });
    if (fields.length) {
      vals.push(week);
      await dbRun(`UPDATE weekly_metrics SET ${fields.join(', ')} WHERE week = ?`, vals);
    }
    const m = await dbGet('SELECT * FROM weekly_metrics WHERE week = ?', [week]);
    res.json(m);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============================================================================
// API: PUBLISHING
// ============================================================================

app.get('/api/publishing', async (req, res) => {
  try {
    const logs = await dbAll(`
      SELECT p.*, s.name as subject_name FROM publishing_log p
      LEFT JOIN subjects s ON p.subject_id = s.id
      ORDER BY p.published_at DESC LIMIT 50
    `);
    res.json(logs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/publishing', async (req, res) => {
  try {
    const { subject_id, platform, url, views, likes } = req.body;
    const r = await dbRun(
      'INSERT INTO publishing_log (subject_id, platform, url, views, likes) VALUES (?, ?, ?, ?, ?)',
      [subject_id, platform, url || '', views || 0, likes || 0]
    );
    res.json({ id: r.lastID });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============================================================================
// SERVE FRONTEND
// ============================================================================

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================================================
// START
// ============================================================================

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║   🎬 VIZU DASHBOARD v2.0                 ║
║   http://localhost:${PORT}                   ║
╚══════════════════════════════════════════╝
  `);
});

process.on('SIGINT', () => {
  db.close(() => { console.log('\n✅ DB closed'); process.exit(0); });
});
