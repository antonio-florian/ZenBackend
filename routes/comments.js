const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// --- COMMENTS ---
// Create comment
router.post('/', async (req, res) => {
	const { story_id, user_id, content } = req.body;
	if (!story_id || !user_id || !content) {
		return res.status(400).json({ error: 'story_id, user_id, and content are required' });
	}
	try {
		const result = await pool.query(
			'INSERT INTO comments (story_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
			[story_id, user_id, content]
		);
		res.status(201).json(result.rows[0]);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Update comment
router.put('/:id', async (req, res) => {
	const { id } = req.params;
	const { content } = req.body;
	if (!content) {
		return res.status(400).json({ error: 'content is required' });
	}
	try {
		const result = await pool.query(
			'UPDATE comments SET content = $1 WHERE id = $2 RETURNING *',
			[content, id]
		);
		if (result.rowCount === 0) {
			return res.status(404).json({ error: 'Comment not found' });
		}
		res.json(result.rows[0]);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Delete comment
router.delete('/:id', async (req, res) => {
	const { id } = req.params;
	try {
		const result = await pool.query('DELETE FROM comments WHERE id = $1 RETURNING *', [id]);
		if (result.rowCount === 0) {
			return res.status(404).json({ error: 'Comment not found' });
		}
		res.json({ message: 'Comment deleted', comment: result.rows[0] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;
