const express = require('express');
const { pool } = require('./db');

const router = express.Router();

const STATUSES = ['prioritize', 'in-progress', 'done'];

const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 2000;

function mapRow(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
  };
}

function isValidUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM tasks ORDER BY created_at ASC, id ASC'
    );
    res.json(rows.map(mapRow));
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    const description =
      typeof req.body.description === 'string' ? req.body.description.trim() : '';
    const status = req.body.status === undefined ? 'prioritize' : req.body.status;
    const createdAt = req.body.createdAt;

    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }
    if (title.length > MAX_TITLE_LENGTH) {
      return res
        .status(400)
        .json({ error: `title must be ${MAX_TITLE_LENGTH} characters or fewer` });
    }
    if (description.length > MAX_DESCRIPTION_LENGTH) {
      return res
        .status(400)
        .json({ error: `description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer` });
    }
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of ${STATUSES.join(', ')}` });
    }
    if (createdAt !== undefined && Number.isNaN(new Date(createdAt).getTime())) {
      return res.status(400).json({ error: 'createdAt must be a valid date' });
    }

    const { rows } = await pool.query(
      `INSERT INTO tasks (title, description, status, created_at)
       VALUES ($1, $2, $3, COALESCE($4::timestamptz, now()))
       RETURNING *`,
      [title, description, status, createdAt === undefined ? null : createdAt]
    );

    res.status(201).json(mapRow(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!isValidUuid(req.params.id)) {
      return res.status(404).json({ error: 'task not found' });
    }
    const { rows } = await pool.query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'task not found' });
    }
    res.json(mapRow(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    if (!isValidUuid(req.params.id)) {
      return res.status(404).json({ error: 'task not found' });
    }

    const { title, description, status } = req.body;
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ error: 'title is required' });
      }
      if (title.trim().length > MAX_TITLE_LENGTH) {
        return res
          .status(400)
          .json({ error: `title must be ${MAX_TITLE_LENGTH} characters or fewer` });
      }
    }
    if (description !== undefined && typeof description !== 'string') {
      return res.status(400).json({ error: 'description must be a string' });
    }
    if (description !== undefined && description.length > MAX_DESCRIPTION_LENGTH) {
      return res
        .status(400)
        .json({ error: `description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer` });
    }
    if (status !== undefined && !STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of ${STATUSES.join(', ')}` });
    }

    const { rows } = await pool.query(
      `UPDATE tasks SET
         title = COALESCE($2, title),
         description = COALESCE($3, description),
         status = COALESCE($4, status)
       WHERE id = $1
       RETURNING *`,
      [
        req.params.id,
        title === undefined ? null : title.trim(),
        description === undefined ? null : description.trim(),
        status === undefined ? null : status,
      ]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'task not found' });
    }
    res.json(mapRow(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!isValidUuid(req.params.id)) {
      return res.status(404).json({ error: 'task not found' });
    }
    const { rowCount } = await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'task not found' });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.delete('/', async (_req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM tasks');
    res.json({ deleted: rowCount });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
