// Basic Express.js backend boilerplate
// Load environment variables from .env file
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL setup
const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

// Example DB endpoint
app.get('/api/dbtest', async (req, res) => {
	try {
		const result = await pool.query('SELECT NOW()');
		res.json({ time: result.rows[0].now });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Middleware
app.use(cors());
app.use(express.json());



// Modularized routes
app.use('/api/users', require('./routes/users'));
app.use('/api/stories', require('./routes/stories'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/tags', require('./routes/tags'));

// Start server
if (require.main === module) {
	app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
	});
}

module.exports = app;
