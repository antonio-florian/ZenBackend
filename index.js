// Basic Express.js backend boilerplate
// Load environment variables from .env file
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Example API endpoint
app.get('/api/hello', (req, res) => {
	res.json({ message: 'Hello from the backend!' });
});

// Add more API endpoints here

// Start server
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
