const { getDb } = require('../../lib/db');
const { isAdminAuthorized } = require('../../lib/utils');

const ESTADOS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

const DEFAULT_SETTINGS = {
  title: "Um voto pelo Brasil",
  description: "No dia 25 de outubro o Brasil decide no 2º turno. O compromisso aqui é simples: cada pessoa conversa com um amigo, vizinho ou familiar e conquista mais um voto para Flávio Bolsonaro.",
  goal: "10000",
  progress_label: "Meta até o 2º turno",
  first_round_date: "2026-10-04",
  second_round_date: "2026-10-25",
  rate_limit_max: "5",
  rate_limit_window_minutes: "60",
  min_gap_seconds: "8"
};

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS vote_counts (
    state TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS rate_limits (
    ip TEXT PRIMARY KEY,
    window_start INTEGER NOT NULL,
    count INTEGER NOT NULL,
    last_submit INTEGER NOT NULL
  )`
];

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido.' });
    return;
  }
  if (!isAdminAuthorized(req)) {
    res.status(401).json({ error: 'Não autorizado.' });
    return;
  }

  const db = getDb();
  const log = [];

  try {
    for (const stmt of SCHEMA_STATEMENTS) {
      await db.execute(stmt);
    }
    log.push('Tabelas criadas ou já existentes.');

    for (const uf of ESTADOS) {
      await db.execute({
        sql: 'INSERT INTO vote_counts (state, count) VALUES (?, 0) ON CONFLICT(state) DO NOTHING',
        args: [uf]
      });
    }
    log.push('Estados inseridos (ou já existiam), começando do zero.');

    for (const key of Object.keys(DEFAULT_SETTINGS)) {
      await db.execute({
        sql: 'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO NOTHING',
        args: [key, DEFAULT_SETTINGS[key]]
      });
    }
    log.push('Configurações padrão inseridas (ou já existiam).');

    res.status(200).json({ ok: true, log });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao inicializar banco: ' + err.message, log });
  }
};
