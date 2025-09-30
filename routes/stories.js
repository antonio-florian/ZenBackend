const express = require('express');
const router = express.Router();

const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// --- STORIES ---
// Create story
router.post('/', async (req, res) => {
	const { user_id, title, content } = req.body;
	if (!user_id || !title || !content) return res.status(400).json({ error: 'user_id, title, and content are required' });
	try {
		const result = await pool.query(
			'INSERT INTO stories (user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
			[user_id, title, content]
		);
		res.status(201).json(result.rows[0]);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get all stories
router.get('/', async (req, res) => {
	try {
		const result = await pool.query('SELECT * FROM stories ORDER BY created_at DESC');
		res.json(result.rows);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get story by id
router.get('/:id', async (req, res) => {
	try {
		const result = await pool.query('SELECT * FROM stories WHERE id = $1', [req.params.id]);
		if (result.rowCount === 0) return res.status(404).json({ error: 'Story not found' });
		res.json(result.rows[0]);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get stories by user
router.get('/user/:userId', async (req, res) => {
	try {
		const result = await pool.query('SELECT * FROM stories WHERE user_id = $1 ORDER BY created_at DESC', [req.params.userId]);
		res.json(result.rows);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Update story
router.put('/:id', async (req, res) => {
	const { title, content } = req.body;
	try {
		const result = await pool.query(
			'UPDATE stories SET title = $1, content = $2 WHERE id = $3 RETURNING *',
			[title, content, req.params.id]
		);
		if (result.rowCount === 0) return res.status(404).json({ error: 'Story not found' });
		res.json(result.rows[0]);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Delete story
router.delete('/:id', async (req, res) => {
	try {
		const result = await pool.query('DELETE FROM stories WHERE id = $1 RETURNING *', [req.params.id]);
		if (result.rowCount === 0) return res.status(404).json({ error: 'Story not found' });
		res.json({ message: 'Story deleted', story: result.rows[0] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// --- STORY_TAGS ---
// Add tag to story
router.post('/:id/tags', async (req, res) => {
	const { tag_id } = req.body;
	if (!tag_id) return res.status(400).json({ error: 'tag_id is required' });
	try {
		await pool.query(
			'INSERT INTO story_tags (story_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
			[req.params.id, tag_id]
		);
		res.json({ message: 'Tag added to story' });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Remove tag from story
router.delete('/:id/tags/:tagId', async (req, res) => {
	try {
		await pool.query('DELETE FROM story_tags WHERE story_id = $1 AND tag_id = $2', [req.params.id, req.params.tagId]);
		res.json({ message: 'Tag removed from story' });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get tags for a story
router.get('/:id/tags', async (req, res) => {
	try {
		const result = await pool.query(
			'SELECT t.* FROM tags t JOIN story_tags st ON t.id = st.tag_id WHERE st.story_id = $1',
			[req.params.id]
		);
		res.json(result.rows);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// --- LIKES ---
// Like a story
router.post('/:id/like', async (req, res) => {
	const { user_id } = req.body;
	if (!user_id) return res.status(400).json({ error: 'user_id is required' });
	try {
		await pool.query(
			'INSERT INTO likes (user_id, story_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
			[user_id, req.params.id]
		);
		res.json({ message: 'Story liked' });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Unlike a story
router.delete('/:id/like', async (req, res) => {
	const { user_id } = req.body;
	if (!user_id) return res.status(400).json({ error: 'user_id is required' });
	try {
		await pool.query('DELETE FROM likes WHERE user_id = $1 AND story_id = $2', [user_id, req.params.id]);
		res.json({ message: 'Story unliked' });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get likes for a story
router.get('/:id/likes', async (req, res) => {
	try {
		const result = await pool.query('SELECT user_id FROM likes WHERE story_id = $1', [req.params.id]);
		res.json(result.rows);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// --- COMMENTS (by story) ---
router.get('/:id/comments', async (req, res) => {
	try {
		const result = await pool.query('SELECT * FROM comments WHERE story_id = $1 ORDER BY created_at ASC', [req.params.id]);
		res.json(result.rows);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;
