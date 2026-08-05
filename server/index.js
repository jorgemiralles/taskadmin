const path = require('path');
const express = require('express');
const { initDb, closeDb } = require('./db');
const tasksRouter = require('./tasks');

const PORT = Number(process.env.PORT) || 8080;

async function start() {
  await initDb();

  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/tasks', tasksRouter);

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'route not found' });
  });

  app.use(express.static(path.resolve(__dirname, '..')));

  app.use((err, _req, res, _next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'invalid JSON body' });
    }
    console.error(err);
    res.status(500).json({ error: 'internal server error' });
  });

  const server = app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });

  async function shutdown() {
    server.close(async () => {
      await closeDb();
      process.exit(0);
    });
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
