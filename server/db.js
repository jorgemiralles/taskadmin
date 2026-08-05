const { Pool } = require('pg');

const connectionString =
  process.env.DATABASE_URL ||
  'postgres://taskadmin:taskadmin@my-postgres-2:5432/taskadmin';

const pool = new Pool({ connectionString });

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'prioritize'
      CHECK (status IN ('prioritize', 'in-progress', 'done')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
`;

async function initDb() {
  await pool.query(SCHEMA);
}

async function closeDb() {
  await pool.end();
}

module.exports = { pool, initDb, closeDb };
