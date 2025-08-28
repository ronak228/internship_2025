import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import { useAuth } from '../hooks/useAuth';
import '../styles/Blog.css';

const BlogSystem = () => {
  // const { user, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: ''
  });
  const [selectedPost, setSelectedPost] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Initialize with demo posts
  useEffect(() => {
    const savedPosts = localStorage.getItem('blog_posts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      const demoPosts = [
        {
          id: 1,
          title: "Welcome to Our Blog Management System",
          content: "This is a demonstration of our blog management system. You can create, edit, and manage blog posts with categories and tags. The system includes a beautiful responsive design that works on all devices. Try creating your own post using the form above!",
          category: "Technology",
          tags: ["demo", "welcome", "blog"],
          author: "Admin",
          date: new Date().toLocaleDateString(),
          views: 45
        },
        {
          id: 2,
          title: "Getting Started with Web Development",
          content: "Learn the fundamentals of web development including HTML, CSS, JavaScript, and modern frameworks. This comprehensive guide covers everything from basic concepts to advanced techniques for building professional websites. Perfect for beginners and intermediate developers looking to enhance their skills.",
          category: "Technology",
          tags: ["web", "development", "tutorial", "html", "css", "javascript"],
          author: "Admin",
          date: new Date(Date.now() - 86400000).toLocaleDateString(),
          views: 32
        }
      ];
      setPosts(demoPosts);
      localStorage.setItem('blog_posts', JSON.stringify(demoPosts));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim() || !formData.category) {
      alert('Please fill in all required fields (Title, Category, and Content)');
      return;
    }

    const newPost = {
      id: Date.now(),
      title: formData.title.trim(),
      content: formData.content.trim(),
      category: formData.category,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      author: "You",
      date: new Date().toLocaleDateString(),
      views: 0
    };

    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem('blog_posts', JSON.stringify(updatedPosts));
    
    // Reset form
    setFormData({ title: '', content: '', category: '', tags: '' });
    setShowCreateForm(false);
    
    showNotification('Blog post published successfully! 🎉');
  };

  const viewPost = (post) => {
    // Increment view count
    const updatedPosts = posts.map(p => 
      p.id === post.id ? { ...p, views: p.views + 1 } : p
    );
    setPosts(updatedPosts);
    localStorage.setItem('blog_posts', JSON.stringify(updatedPosts));
    
    setSelectedPost({ ...post, views: post.views + 1 });
    setShowModal(true);
  };

  const deletePost = (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      const updatedPosts = posts.filter(p => p.id !== postId);
      setPosts(updatedPosts);
      localStorage.setItem('blog_posts', JSON.stringify(updatedPosts));
      showNotification('Post deleted successfully');
    }
  };

  const showNotification = (message) => {
    // Simple notification - could be enhanced with a toast library
    alert(message);
  };

  const getCategoryCount = (category) => {
    return posts.filter(post => post.category === category).length;
  };

  const getTotalViews = () => {
    return posts.reduce((sum, post) => sum + post.views, 0);
  };

  return (
    <div className="blog-system">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <i className="fas fa-blog"></i> Blog Management System
          </Link>
          <div className="navbar-nav ms-auto">
            <button 
              className="nav-link btn-link"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              <i className="fas fa-plus"></i> Create Post
            </button>
            <Link className="nav-link" to="/">
              <i className="fas fa-home"></i> Dashboard
            </Link>
            {/* {user && (
              <button className="nav-link btn-link" onClick={logout}>
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            )} */}
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        {/* Hero Section */}
        {!showCreateForm && (
          <div className="hero-section">
            <h1 className="hero-title">Welcome to Blog System</h1>
            <p className="hero-subtitle">Create, manage, and share your thoughts with the world</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              <i className="fas fa-plus"></i> Write New Post
            </button>
          </div>
        )}

        {/* Create Post Form */}
        {showCreateForm && (
          <div className="create-post-form">
            <h3 className="mb-4">
              <i className="fas fa-edit"></i> Create New Blog Post
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-8">
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    placeholder="Enter your blog post title..."
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <select
                    className="form-control"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Technology">Technology</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Travel">Travel</option>
                    <option value="Food">Food</option>
                    <option value="Business">Business</option>
                  </select>
                </div>
              </div>

              <textarea
                className="form-control"
                name="content"
                rows="8"
                placeholder="Write your blog content here... You can write multiple paragraphs, add formatting, and create engaging content for your readers."
                value={formData.content}
                onChange={handleInputChange}
                required
                style={{ minHeight: '200px', resize: 'vertical' }}
              />

              <input
                type="text"
                className="form-control"
                name="tags"
                placeholder="Enter tags (comma separated): web, design, tutorial, tips"
                value={formData.tags}
                onChange={handleInputChange}
              />

              <div className="text-center">
                <button type="submit" className="btn btn-primary me-2">
                  <i className="fas fa-save"></i> Publish Post
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowCreateForm(false)}
                >
                  <i className="fas fa-times"></i> Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="row">
          {/* Main Content */}
          <div className="col-lg-8">
            <div className="blog-card">
              <h3 className="text-center mb-4">
                <i className="fas fa-newspaper"></i> Recent Blog Posts
              </h3>
              <div className="blog-posts">
                {posts.length === 0 ? (
                  <div className="text-center" style={{ padding: '40px' }}>
                    <i className="fas fa-file-alt" style={{ fontSize: '3rem', color: '#ccc', marginBottom: '20px' }}></i>
                    <h4 style={{ color: '#666' }}>No posts yet</h4>
                    <p style={{ color: '#999' }}>Be the first to write a blog post!</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowCreateForm(true)}
                    >
                      <i className="fas fa-plus"></i> Write First Post
                    </button>
                  </div>
                ) : (
                  posts.map(post => {
                    const excerpt = post.content.length > 200 ? post.content.substring(0, 200) + '...' : post.content;
                    
                    return (
                      <article key={post.id} className="post-card">
                        <h2 className="post-title">{post.title}</h2>
                        <div className="post-meta">
                          <i className="fas fa-user"></i> {post.author} • 
                          <i className="fas fa-calendar"></i> {post.date} • 
                          <i className="fas fa-tag"></i> {post.category} •
                          <i className="fas fa-eye"></i> {post.views} views
                        </div>
                        <div className="post-excerpt">{excerpt}</div>
                        {post.tags.length > 0 && (
                          <div className="mb-2">
                            {post.tags.map((tag, index) => (
                              <span key={index} className="badge badge-secondary me-1">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="post-actions">
                          <button
                            className="read-more"
                            onClick={() => viewPost(post)}
                          >
                            Read More <i className="fas fa-arrow-right"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-danger ms-2"
                            onClick={() => deletePost(post.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            {/* Categories */}
            <div className="sidebar-card">
              <h3 className="sidebar-title">Categories</h3>
              <div className="category-item">
                <span style={{ color: '#007bff' }}>■</span> Technology ({getCategoryCount('Technology')})
              </div>
              <div className="category-item">
                <span style={{ color: '#28a745' }}>■</span> Lifestyle ({getCategoryCount('Lifestyle')})
              </div>
              <div className="category-item">
                <span style={{ color: '#ffc107' }}>■</span> Travel ({getCategoryCount('Travel')})
              </div>
              <div className="category-item">
                <span style={{ color: '#dc3545' }}>■</span> Food ({getCategoryCount('Food')})
              </div>
              <div className="category-item">
                <span style={{ color: '#6f42c1' }}>■</span> Business ({getCategoryCount('Business')})
              </div>
            </div>

            {/* Popular Tags */}
            <div className="sidebar-card">
              <h3 className="sidebar-title">Popular Tags</h3>
              <div className="tag-cloud">
                <span className="tag-item">Web Development</span>
                <span className="tag-item">JavaScript</span>
                <span className="tag-item">Tutorial</span>
                <span className="tag-item">Tips</span>
                <span className="tag-item">Guide</span>
                <span className="tag-item">Review</span>
              </div>
            </div>

            {/* Blog Stats */}
            <div className="sidebar-card">
              <h3 className="sidebar-title">Blog Stats</h3>
              <div className="stats">
                <p><i className="fas fa-file-alt"></i> {posts.length} Published Posts</p>
                <p><i className="fas fa-users"></i> 5 Authors</p>
                <p><i className="fas fa-comments"></i> 42 Comments</p>
                <p><i className="fas fa-eye"></i> {getTotalViews().toLocaleString()} Total Views</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Modal */}
      {showModal && selectedPost && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5 className="modal-title">{selectedPost.title}</h5>
              <button 
                type="button" 
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                <span>&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <small className="text-muted">
                  <i className="fas fa-user"></i> {selectedPost.author} • 
                  <i className="fas fa-calendar"></i> {selectedPost.date} • 
                  <i className="fas fa-tag"></i> {selectedPost.category} •
                  <i className="fas fa-eye"></i> {selectedPost.views} views
                </small>
              </div>
              <div className="post-content" style={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                {selectedPost.content}
              </div>
              {selectedPost.tags.length > 0 && (
                <div className="mt-3">
                  <strong>Tags:</strong><br/>
                  {selectedPost.tags.map((tag, index) => (
                    <span key={index} className="badge badge-secondary me-1">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogSystem;