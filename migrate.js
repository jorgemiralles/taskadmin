const pool = require('./db');

const createTable = `
  CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    start_date DATE,
    status TEXT NOT NULL DEFAULT 'pending'
  );
`;

async function migrate() {
  try {
    await pool.query(createTable);
    console.log('Table "tasks" created successfully');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

migrate();
