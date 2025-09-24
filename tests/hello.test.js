const request = require('supertest');
const express = require('express');

// Import the app from index.js
const app = require('../index');

describe('GET /api/hello', () => {
  it('should return hello message', async () => {
    const res = await request(app).get('/api/hello');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Hello from the backend!');
  });
});
