const request = require('supertest');
const app = require('../index');

describe('API Endpoints', () => {
  let userId, storyId, commentId, tagId;
  let token; // For future auth

  // USERS
  it('should register a user', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ username: 'jestuser', email: 'jest@example.com', password: 'testpass' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    userId = res.body.id;
  });

  it('should login a user', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'jest@example.com', password: 'testpass' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id');
  });

  it('should get user by id', async () => {
    const res = await request(app).get(`/api/users/${userId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('username', 'jestuser');
  });

  // STORIES
  it('should create a story', async () => {
    const res = await request(app)
      .post('/api/stories')
      .send({ user_id: userId, title: 'Test Story', content: 'Story content' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    storyId = res.body.id;
  });

  it('should get all stories', async () => {
    const res = await request(app).get('/api/stories');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get story by id', async () => {
    const res = await request(app).get(`/api/stories/${storyId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('title', 'Test Story');
  });

  // TAGS
  it('should create a tag', async () => {
    const res = await request(app)
      .post('/api/tags')
      .send({ name: 'testtag' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    tagId = res.body.id;
  });

  it('should get all tags', async () => {
    const res = await request(app).get('/api/tags');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // STORY_TAGS
  it('should add tag to story', async () => {
    const res = await request(app)
      .post(`/api/stories/${storyId}/tags`)
      .send({ tag_id: tagId });
    expect(res.statusCode).toBe(200);
  });

  it('should get tags for a story', async () => {
    const res = await request(app).get(`/api/stories/${storyId}/tags`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // COMMENTS
  it('should create a comment', async () => {
    const res = await request(app)
      .post('/api/comments')
      .send({ story_id: storyId, user_id: userId, content: 'Nice story!' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    commentId = res.body.id;
  });

  it('should get comments for a story', async () => {
    const res = await request(app).get(`/api/stories/${storyId}/comments`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should update a comment', async () => {
    const res = await request(app)
      .put(`/api/comments/${commentId}`)
      .send({ content: 'Updated comment' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('content', 'Updated comment');
  });

  it('should delete a comment', async () => {
    const res = await request(app).delete(`/api/comments/${commentId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Comment deleted');
  });

  // LIKES
  it('should like a story', async () => {
    const res = await request(app)
      .post(`/api/stories/${storyId}/like`)
      .send({ user_id: userId });
    expect(res.statusCode).toBe(200);
  });

  it('should get likes for a story', async () => {
    const res = await request(app).get(`/api/stories/${storyId}/likes`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should unlike a story', async () => {
    const res = await request(app)
      .delete(`/api/stories/${storyId}/like`)
      .send({ user_id: userId });
    expect(res.statusCode).toBe(200);
  });

  // FOLLOWERS
  it('should follow a user', async () => {
    const res = await request(app)
      .post(`/api/users/${userId}/follow`)
      .send({ follower_id: userId });
    expect(res.statusCode).toBe(200);
  });

  it('should get followers', async () => {
    const res = await request(app).get(`/api/users/${userId}/followers`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get following', async () => {
    const res = await request(app).get(`/api/users/${userId}/following`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should unfollow a user', async () => {
    const res = await request(app)
      .delete(`/api/users/${userId}/follow`)
      .send({ follower_id: userId });
    expect(res.statusCode).toBe(200);
  });

  // CLEANUP: delete story, user, tag
  it('should delete a story', async () => {
    const res = await request(app).delete(`/api/stories/${storyId}`);
    expect(res.statusCode).toBe(200);
  });
  it('should delete a tag', async () => {
    const res = await request(app).delete(`/api/tags/${tagId}`);
    expect(res.statusCode).toBe(200);
  });
  it('should delete a user', async () => {
    const res = await request(app).delete(`/api/users/${userId}`);
    expect(res.statusCode).toBe(200);
  });
});
