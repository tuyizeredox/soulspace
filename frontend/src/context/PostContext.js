import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../utils/axiosConfig'; // Make sure to use the configured axios instance

const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('/api/posts');
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
        // Fallback to localStorage if API fails
        const storedPosts = localStorage.getItem('forumPosts');
        if (storedPosts) {
          setPosts(JSON.parse(storedPosts));
        }
      }
    };

    fetchPosts();
  }, []);

  const getPostById = async (id) => {
    try {
      const response = await axios.get(`/api/posts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching post by ID:', error);
      // Try to find the post in the local state
      // MongoDB uses _id instead of id
      return posts.find(post => post._id === id || post.id === id);
    }
  };

  const addPost = async (postData) => {
    try {
      const response = await axios.post('/api/posts', postData);
      const newPost = response.data;

      const updatedPosts = [newPost, ...posts];
      setPosts(updatedPosts);
      localStorage.setItem('forumPosts', JSON.stringify(updatedPosts));

      return newPost;
    } catch (error) {
      console.error('Error adding post:', error);
      throw error;
    }
  };

  const likePost = async (postId) => {
    try {
      await axios.post(`/api/posts/${postId}/like`);
      const updatedPosts = posts.map(post =>
        post._id === postId || post.id === postId
          ? { ...post, likes: (post.likes?.length || 0) + 1 }
          : post
      );
      setPosts(updatedPosts);
      localStorage.setItem('forumPosts', JSON.stringify(updatedPosts));
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  };

  const addComment = async (postId, comment) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/comments`, comment);
      const updatedPosts = posts.map(post => {
        if (post._id === postId || post.id === postId) {
          return {
            ...post,
            comments: [...(post.comments || []), response.data]
          };
        }
        return post;
      });
      setPosts(updatedPosts);
      localStorage.setItem('forumPosts', JSON.stringify(updatedPosts));
      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  return (
    <PostContext.Provider value={{
      posts,
      addPost,
      getPostById,
      likePost,
      addComment
    }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePosts = () => useContext(PostContext);






