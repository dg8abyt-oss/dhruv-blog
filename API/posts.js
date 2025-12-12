import { kv } from '@vercel/kv';

export default async function handler(request, response) {
  // GET request: Fetch all blog posts
  if (request.method === 'GET') {
    try {
      // Get all items from the 'posts' list
      const posts = await kv.lrange('posts', 0, -1);
      return response.status(200).json(posts);
    } catch (error) {
      return response.status(500).json({ error: 'Failed to fetch posts' });
    }
  }

  // POST request: Add a new blog post
  if (request.method === 'POST') {
    const { title, filename, pin } = request.body;

    // 1. Security Check
    if (pin !== '1910') {
      return response.status(401).json({ error: 'Incorrect PIN' });
    }

    // 2. Validate input
    if (!title || !filename) {
      return response.status(400).json({ error: 'Missing title or filename' });
    }

    // 3. Format the path (Force /blog/ prefix)
    const fullPath = `/blog/${filename.replace(/^\/+/, '')}`; // Removes leading slash if user added one accidentally

    const newPost = {
      title: title,
      url: fullPath,
      date: new Date().toLocaleDateString()
    };

    try {
      // Push to the beginning of the list (newest first)
      await kv.lpush('posts', newPost);
      return response.status(200).json({ success: true, post: newPost });
    } catch (error) {
      return response.status(500).json({ error: 'Database error' });
    }
  }
}
