const express = require('express');
const router = express.Router();

const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// --- TAGS ---
// Create tag
router.post('/', async (req, res) => {
	const { name } = req.body;
	if (!name) return res.status(400).json({ error: 'name is required' });
	try {
		const result = await pool.query('INSERT INTO tags (name) VALUES ($1) RETURNING *', [name]);
		res.status(201).json(result.rows[0]);
	} catch (err) {
		if (err.code === '23505') {
			res.status(409).json({ error: 'Tag name already exists' });
		} else {
			res.status(500).json({ error: err.message });
		}
	}
});

// Get all tags
router.get('/', async (req, res) => {
	try {
		const result = await pool.query('SELECT * FROM tags ORDER BY name ASC');
		res.json(result.rows);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Update tag
router.put('/:id', async (req, res) => {
	const { name } = req.body;
	if (!name) return res.status(400).json({ error: 'name is required' });
	try {
		const result = await pool.query('UPDATE tags SET name = $1 WHERE id = $2 RETURNING *', [name, req.params.id]);
		if (result.rowCount === 0) return res.status(404).json({ error: 'Tag not found' });
		res.json(result.rows[0]);
	} catch (err) {
		if (err.code === '23505') {
			res.status(409).json({ error: 'Tag name already exists' });
		} else {
			res.status(500).json({ error: err.message });
		}
	}
});

// Delete tag
router.delete('/:id', async (req, res) => {
	try {
		const result = await pool.query('DELETE FROM tags WHERE id = $1 RETURNING *', [req.params.id]);
		if (result.rowCount === 0) return res.status(404).json({ error: 'Tag not found' });
		res.json({ message: 'Tag deleted', tag: result.rows[0] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;
