const express = require('express');
const router = express.Router();

const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const bcrypt = require('bcrypt');

// --- USERS ---
// Register user
router.post('/register', async (req, res) => {
	const { username, email, password, bio } = req.body;
	if (!username || !email || !password) {
		return res.status(400).json({ error: 'username, email, and password are required' });
	}
	try {
		const hash = await bcrypt.hash(password, 10);
		const result = await pool.query(
			'INSERT INTO users (username, email, password_hash, bio) VALUES ($1, $2, $3, $4) RETURNING id, username, email, bio, created_at',
			[username, email, hash, bio || null]
		);
		res.status(201).json(result.rows[0]);
	} catch (err) {
		if (err.code === '23505') {
			res.status(409).json({ error: 'Username or email already exists' });
		} else {
			res.status(500).json({ error: err.message });
		}
	}
});

// Login user
router.post('/login', async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json({ error: 'email and password are required' });
	}
	try {
		const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
		if (result.rowCount === 0) return res.status(401).json({ error: 'Invalid credentials' });
		const user = result.rows[0];
		const match = await bcrypt.compare(password, user.password_hash);
		if (!match) return res.status(401).json({ error: 'Invalid credentials' });
		res.json({ id: user.id, username: user.username, email: user.email, bio: user.bio, created_at: user.created_at });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get user by id
router.get('/:id', async (req, res) => {
	try {
		const result = await pool.query('SELECT id, username, email, bio, created_at FROM users WHERE id = $1', [req.params.id]);
		if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
		res.json(result.rows[0]);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Update user
router.put('/:id', async (req, res) => {
	const { username, email, bio } = req.body;
	try {
		const result = await pool.query(
			'UPDATE users SET username = $1, email = $2, bio = $3 WHERE id = $4 RETURNING id, username, email, bio, created_at',
			[username, email, bio, req.params.id]
		);
		if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
		res.json(result.rows[0]);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Delete user
router.delete('/:id', async (req, res) => {
	try {
		const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, username, email', [req.params.id]);
		if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
		res.json({ message: 'User deleted', user: result.rows[0] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// --- FOLLOWERS ---
// Follow user
router.post('/:id/follow', async (req, res) => {
	const follower_id = req.body.follower_id;
	const following_id = req.params.id;
	if (!follower_id) return res.status(400).json({ error: 'follower_id is required' });
	try {
		await pool.query(
			'INSERT INTO followers (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
			[follower_id, following_id]
		);
		res.json({ message: 'Now following' });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Unfollow user
router.delete('/:id/follow', async (req, res) => {
	const follower_id = req.body.follower_id;
	const following_id = req.params.id;
	if (!follower_id) return res.status(400).json({ error: 'follower_id is required' });
	try {
		await pool.query(
			'DELETE FROM followers WHERE follower_id = $1 AND following_id = $2',
			[follower_id, following_id]
		);
		res.json({ message: 'Unfollowed' });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get followers
router.get('/:id/followers', async (req, res) => {
	try {
		const result = await pool.query(
			'SELECT follower_id FROM followers WHERE following_id = $1',
			[req.params.id]
		);
		res.json(result.rows);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get following
router.get('/:id/following', async (req, res) => {
	try {
		const result = await pool.query(
			'SELECT following_id FROM followers WHERE follower_id = $1',
			[req.params.id]
		);
		res.json(result.rows);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;
