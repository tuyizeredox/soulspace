const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { verifyToken } = require('../middleware/authMiddleware');

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name avatar joinDate')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name avatar joinDate')
      .populate('comments.author', 'name avatar');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create post
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    // Validate required fields
    if (!title || !content || !category) {
      return res.status(400).json({ 
        message: 'Title, content, and category are required' 
      });
    }

    const post = new Post({
      title,
      content,
      category,
      tags: tags || [],
      author: req.user.id, // Set from the verified token
      likes: [],
      comments: [],
      views: 0
    });

    const savedPost = await post.save();
    
    // Populate author details
    await savedPost.populate('author', 'name avatar joinDate');

    res.status(201).json(savedPost);
  } catch (error) {
    console.error('Post creation error:', error);
    res.status(400).json({ 
      message: 'Error creating post',
      error: error.message 
    });
  }
});

// Like post
router.post('/:id/like', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!post.likes.includes(req.user.id)) {
      post.likes.push(req.user.id);
      await post.save();
    }

    res.json({ likes: post.likes.length });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add comment
router.post('/:id/comments', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      content: req.body.content,
      author: req.user.id,
      timestamp: new Date()
    };

    post.comments.push(comment);
    await post.save();
    await post.populate('comments.author', 'name avatar');

    res.status(201).json(post.comments[post.comments.length - 1]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
