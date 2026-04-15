import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ThumbsUp, MessageSquare, Edit, Image as ImageIcon, Search, UserPlus, TrendingUp, Filter } from 'lucide-react';
import EditProfileModal from '../components/EditProfileModal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import TextArea from '../components/ui/TextArea';
import { PostSkeleton } from '../components/ui/Skeleton';

const HomeFeed = () => {
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState(user);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ content: '', imageUrl: '', imageFile: null });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [trendingUsers, setTrendingUsers] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [expandedComments, setExpandedComments] = useState({}); // { postId: boolean }
  const [commentTexts, setCommentTexts] = useState({}); // { postId: string }
  const [connections, setConnections] = useState([]);
  const [sentRequestIds, setSentRequestIds] = useState([]);

  const fetchPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const res = await api.get('/posts');
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const fetchTrending = async () => {
    try {
      const res = await api.get('/users/trending');
      setTrendingUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    try {
      const [connRes, sentRes] = await Promise.all([
        api.get('/connections'),
        api.get('/connections/sent-ids')
      ]);
      setConnections(connRes.data);
      setSentRequestIds(sentRes.data);
    } catch (err) {
      console.error("Failed to fetch connectivity data", err);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchTrending();
    fetchData();
  }, []);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.content.trim()) return;
    
    const formData = new FormData();
    formData.append('content', newPost.content);
    if (newPost.imageFile) {
      formData.append('image', newPost.imageFile);
    }

    try {
      if (newPost.imageFile) {
        await api.post('/posts', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/posts', { content: newPost.content, imageUrl: newPost.imageUrl });
      }
      setNewPost({ content: '', imageUrl: '', imageFile: null });
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    setNewPost({ ...newPost, imageFile: e.target.files[0], imageUrl: '' });
  };

  const handleLike = async (postId) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Optimistic Update
    const originalPosts = [...posts];
    const isLiking = !post.likedByCurrentUser;
    const updatedPost = {
      ...post,
      likedByCurrentUser: isLiking,
      likesCount: isLiking ? post.likesCount + 1 : Math.max(0, post.likesCount - 1)
    };
    setPosts(posts.map(p => p.id === postId ? updatedPost : p));

    try {
      const res = await api.post(`/posts/${postId}/like`);
      setPosts(posts.map(p => p.id === postId ? res.data : p));
    } catch (err) {
      console.error(err);
      setPosts(originalPosts); // Rollback on error
      alert("Failed to synchronize reaction. Please verify connectivity.");
    }
  };

  const handleComment = async (postId) => {
    const text = commentTexts[postId];
    if (!text || !text.trim()) return;

    const post = posts.find(p => p.id === postId);
    const originalPosts = [...posts];

    // Optimistic Update
    const tempComment = {
      id: Date.now(), // Temp ID
      content: text,
      createdAt: new Date().toISOString(),
      user: currentUser,
      isOptimistic: true
    };
    
    const updatedPost = {
      ...post,
      comments: [...post.comments, tempComment]
    };
    setPosts(posts.map(p => p.id === postId ? updatedPost : p));
    setCommentTexts({ ...commentTexts, [postId]: '' });

    try {
      const res = await api.post(`/posts/${postId}/comment`, { content: text });
      setPosts(posts.map(p => p.id === postId ? res.data : p));
    } catch (err) {
      console.error(err);
      setPosts(originalPosts); // Rollback
      setCommentTexts({ ...commentTexts, [postId]: text }); // Restore text
      alert("Failed to deliver comment. Check your connection.");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Permanent deletion of this insight. Proceed?")) return;
    
    const originalPosts = [...posts];
    setPosts(posts.filter(p => p.id !== postId));

    try {
      await api.delete(`/posts/${postId}`);
    } catch (err) {
      console.error(err);
      setPosts(originalPosts);
      alert("Unauthorized or failed deletion attempt.");
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    const post = posts.find(p => p.id === postId);
    const originalPosts = [...posts];

    const updatedPost = {
      ...post,
      comments: post.comments.filter(c => c.id !== commentId)
    };
    setPosts(posts.map(p => p.id === postId ? updatedPost : p));

    try {
      const res = await api.delete(`/posts/comments/${commentId}`);
      setPosts(posts.map(p => p.id === postId ? res.data : p));
    } catch (err) {
      console.error(err);
      setPosts(originalPosts);
      alert("Permission denied for comment removal.");
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments({ ...expandedComments, [postId]: !expandedComments[postId] });
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.startsWith('#')) {
      // Hashtag search placeholder: in a real app this would call a hashtag endpoint
      // For now, we'll just filter posts locally if they contain the hashtag
      setIsSearching(false);
      return;
    }

    if (query.length > 1) {
      setIsSearching(true);
      try {
        const res = await api.get(`/users/search?query=${query}`);
        setSearchResults(res.data);
      } catch (err) {
        console.error(err);
      }
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  const handleConnect = async (targetId) => {
    try {
      await api.post(`/connections/request/${targetId}`);
      setSentRequestIds([...sentRequestIds, targetId]);
      // Alert/notification handled by UI state
    } catch (err) {
      console.error("Connection request failed", err);
    }
  };

  const getStatusIcon = (targetId) => {
    if (connections.find(c => c.id === targetId)) return <Badge variant="secondary" size="sm">Connected</Badge>;
    if (sentRequestIds.includes(targetId)) return <Badge variant="outline" size="sm" className="opacity-60">Pending</Badge>;
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={(e) => { e.preventDefault(); handleConnect(targetId); }}
        className="text-brand-600 hover:bg-brand-50 rounded-full p-2"
      >
        <UserPlus size={18} />
      </Button>
    );
  };

  const onUpdateProfile = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-12 animate-fade-in">
      {/* Left Sidebar */}
      <div className="hidden md:block md:col-span-4 lg:col-span-3 space-y-4">
        {/* Profile Summary Card */}
        <Card noPadding className="group overflow-visible">
          <div className="h-20 bg-brand-600 rounded-t-2xl relative overflow-hidden">
            {currentUser.coverPicture && (
              <img 
                src={getImageUrl(currentUser.coverPicture)} 
                alt="cover" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
            )}
            <div className={`absolute inset-0 ${currentUser.coverPicture ? 'bg-black/20' : 'bg-brand-600'}`} />
            
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-2xl border-4 border-white bg-brand-500 text-white flex items-center justify-center text-3xl font-black shadow-lg overflow-hidden transition-transform group-hover:scale-105 z-10">
              {currentUser.profilePicture ? (
                <img src={getImageUrl(currentUser.profilePicture)} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : currentUser.name.charAt(0)}
            </div>
          </div>
          <div className="pt-12 pb-6 px-4 text-center">
            <h3 className="font-black text-lg text-surface-900 leading-tight">{currentUser.name}</h3>
            <p className="text-surface-500 text-xs mt-1 font-medium line-clamp-2 px-2 h-8">
              {currentUser.bio || 'Professional at PostApp'}
            </p>
            
            <div className="mt-6 pt-6 border-t border-surface-100 flex justify-around">
               <div className="text-center">
                  <p className="text-sm font-black text-brand-600">{currentUser.postCount || 0}</p>
                  <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">Posts</p>
               </div>
               <div className="h-8 w-[1px] bg-surface-100" />
               <div className="text-center">
                  <p className="text-sm font-black text-brand-600">{currentUser.connectionCount || 0}</p>
                  <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">Connects</p>
               </div>
            </div>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              className="mt-6 w-full"
              leftIcon={Edit}
            >
              Edit Profile
            </Button>
          </div>
        </Card>

        {/* Create Post Widget */}
        <Card className="space-y-4">
          <h4 className="font-black text-xs text-surface-400 uppercase tracking-widest flex items-center gap-2">
            <ImageIcon className="text-brand-600" size={16} /> Share meaningful update
          </h4>
          <form onSubmit={handlePostSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-surface-400 uppercase tracking-widest pl-1">Image Attachment</label>
              <div className="flex flex-col gap-2">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="image-upload"
                />
                <label 
                  htmlFor="image-upload"
                  className="w-full bg-surface-50 border-2 border-dashed border-surface-200 rounded-xl p-3 text-xs text-surface-500 flex items-center justify-center gap-2 cursor-pointer hover:border-brand-300 hover:bg-brand-50 transition-all group"
                >
                  <ImageIcon size={16} className="text-surface-400 group-hover:text-brand-600" />
                  {newPost.imageFile ? newPost.imageFile.name : 'Click to upload image'}
                </label>
                <div className="relative">
                  <Input 
                    type="text" 
                    placeholder="...or paste image URL" 
                    value={newPost.imageUrl}
                    onChange={(e) => setNewPost({ ...newPost, imageUrl: e.target.value, imageFile: null })}
                    className="text-xs p-2 pl-4"
                  />
                </div>
              </div>
            </div>
            <TextArea 
              placeholder="What's happening in your career?" 
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              className="text-sm min-h-[100px]"
              rows="3"
            />
            <Button 
              type="submit" 
              disabled={!newPost.content.trim()}
              className="w-full"
            >
              Share Post
            </Button>
          </form>
        </Card>
      </div>

      {/* Main Feed Area */}
      <div className="col-span-1 md:col-span-8 lg:col-span-6 space-y-6">
        {/* Modern Search Experience */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-surface-400 group-focus-within:text-brand-600 transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Search professional network..." 
            value={searchQuery}
            onChange={handleSearch}
            className="w-full bg-white border border-surface-200 rounded-2xl py-4 pl-12 pr-4 shadow-premium focus:ring-4 focus:ring-brand-50 focus:border-brand-600 outline-none transition-all font-medium"
          />
          
          {/* Enhanced Search Results */}
          {isSearching && searchQuery.length > 1 && (
            <Card noPadding className="absolute top-full mt-3 w-full z-40 max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-300 border-brand-100 shadow-2xl">
              {searchResults.length > 0 ? (
                <div className="divide-y divide-surface-100">
                  {searchResults.map(result => (
                    <div key={result.id} className="p-4 hover:bg-surface-50 flex items-center justify-between transition-colors">
                      <Link to={`/profile/${result.id}`} className="flex items-center gap-4 group flex-1">
                        <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700 font-black overflow-hidden border-2 border-transparent group-hover:border-brand-500 transition-all">
                          {result.profilePicture ? <img src={getImageUrl(result.profilePicture)} alt={result.name} className="w-full h-full object-cover" /> : result.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-surface-900 group-hover:text-brand-600 transition-colors leading-tight">{result.name}</p>
                          <p className="text-xs text-surface-500 mt-0.5 line-clamp-1">{result.bio || 'PostApp Network Member'}</p>
                        </div>
                      </Link>
                      <div className="flex items-center gap-2 ml-4">
                        {getStatusIcon(result.id)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-surface-500 text-sm font-medium">
                  We couldn't find anyone matching "{searchQuery}"
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Posts List */}
        <div className="space-y-6">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xs font-black text-surface-400 uppercase tracking-widest">Feed Updates</h2>
            <div className="flex gap-2">
               <button className="text-surface-400 hover:text-brand-600 transition-colors p-1"><Filter size={16} /></button>
            </div>
          </div>
          
          {isLoadingPosts ? (
            <div className="grid gap-6">
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </div>
          ) : posts.length === 0 ? (
            <Card className="p-16 text-center">
                <div className="w-20 h-20 bg-brand-50 text-brand-300 rounded-full flex items-center justify-center mx-auto mb-6">
                   <TrendingUp size={40} />
                </div>
                <h3 className="text-xl font-black text-surface-900 mb-2">Build your timeline</h3>
                <p className="text-surface-500 font-medium max-w-xs mx-auto">Be the pioneer in your network and start a conversation today.</p>
                <Button className="mt-8" variant="outline">Learn how to post</Button>
            </Card>
          ) : (
            posts.map(post => (
              <Card key={post.id} noPadding className="animate-slide-up group transition-all hover:border-surface-300">
                <div className="p-5 flex items-center gap-4">
                  <Link to={`/profile/${post.user.id}`} className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center text-white font-black overflow-hidden hover:opacity-90 transition-all shadow-sm">
                    {post.user.profilePicture ? <img src={post.user.profilePicture} alt={post.user.name} className="w-full h-full object-cover" /> : post.user.name.charAt(0)}
                  </Link>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <Link to={`/profile/${post.user.id}`} className="font-black text-surface-900 hover:text-brand-600 transition-colors">{post.user.name}</Link>
                      {post.user.id === currentUser.id && (
                        <button 
                          onClick={() => handleDeletePost(post.id)}
                          className="text-surface-300 hover:text-red-500 transition-colors p-1"
                          title="Delete Post"
                        >
                          <svg size={16} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                       <span className="text-[10px] text-surface-400 font-bold uppercase tracking-wide">{new Date(post.createdAt).toLocaleDateString()}</span>
                       <span className="text-surface-300">•</span>
                       <Badge variant="secondary" size="sm">Networking</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="px-5 pb-5">
                  <p className="text-sm text-surface-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                </div>

                {post.imageUrl && (
                  <div className="bg-surface-50 border-y border-surface-100 px-2 py-2">
                    <img src={post.imageUrl} alt="Post Content" className="w-full h-auto max-h-[512px] object-contain mx-auto rounded-lg shadow-sm" />
                  </div>
                )}

                <div className="px-5 py-3 flex items-center justify-between border-t border-surface-50">
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-surface-200" />
                    ))}
                    <span className="pl-3 text-[11px] font-bold text-surface-400">{post.likesCount} people liked this</span>
                  </div>
                  <button onClick={() => toggleComments(post.id)} className="text-[11px] font-bold text-surface-400 hover:text-brand-600 transition-colors">
                    {post.comments.length} comments
                  </button>
                </div>

                <div className="px-3 py-2 flex gap-2 border-t border-surface-50 bg-surface-50/20">
                  <button 
                    onClick={() => handleLike(post.id)} 
                    className={`flex items-center gap-3 flex-1 justify-center py-2.5 hover:bg-white hover:shadow-sm rounded-xl font-black transition-all text-xs ${post.likedByCurrentUser ? 'text-brand-700 bg-white shadow-sm' : 'text-surface-600 hover:text-surface-900'}`}
                  >
                    <ThumbsUp size={18} className={post.likedByCurrentUser ? 'fill-brand-600 text-brand-600 ring-4 ring-brand-50 rounded-full' : 'text-surface-400'} /> 
                    {post.likedByCurrentUser ? 'Liked' : 'Like'}
                  </button>
                  <button 
                    onClick={() => toggleComments(post.id)}
                    className={`flex items-center gap-3 flex-1 justify-center py-2.5 hover:bg-white hover:shadow-sm rounded-xl font-black transition-all text-xs ${expandedComments[post.id] ? 'text-brand-700 bg-white shadow-sm' : 'text-surface-600 hover:text-surface-900'}`}
                  >
                    <MessageSquare size={18} className={expandedComments[post.id] ? 'fill-brand-50 text-brand-600' : 'text-surface-400'} /> 
                    Comment
                  </button>
                </div>

                {/* Modular Comments Section */}
                {(expandedComments[post.id] || post.comments.length > 0) && (
                  <div className="bg-surface-100/30 border-t border-surface-100 p-5 space-y-6 animate-in slide-in-from-top-2 duration-300">
                    {/* Simplified Comment Input */}
                    <div className="flex gap-4">
                      <div className="w-9 h-9 rounded-xl bg-brand-500 text-white flex-shrink-0 flex items-center justify-center text-sm font-black overflow-hidden shadow-sm">
                        {currentUser.profilePicture ? <img src={currentUser.profilePicture} alt="me" className="w-full h-full object-cover" /> : currentUser.name.charAt(0)}
                      </div>
                      <div className="flex-1 flex gap-2 items-center">
                        <input 
                          type="text" 
                          placeholder="Add a comment..." 
                          value={commentTexts[post.id] || ''}
                          onChange={(e) => setCommentTexts({ ...commentTexts, [post.id]: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                          className="flex-1 bg-white border border-surface-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-brand-50 focus:border-brand-600 transition-all font-medium"
                        />
                        <button 
                          onClick={() => handleComment(post.id)}
                          disabled={!commentTexts[post.id]?.trim()}
                          className="px-4 py-2 text-xs font-black text-brand-600 disabled:text-surface-300 hover:text-brand-800 transition-colors uppercase tracking-widest"
                        >
                          Post
                        </button>
                      </div>
                    </div>

                    {/* Styled Comments List */}
                    {expandedComments[post.id] && (
                      <div className="space-y-4">
                        {post.comments.map(comment => (
                          <div key={comment.id} className="flex gap-4 animate-in fade-in duration-300">
                            <Link to={`/profile/${comment.user.id}`} className="w-9 h-9 rounded-xl bg-surface-200 flex-shrink-0 flex items-center justify-center text-xs font-black overflow-hidden border border-white shadow-sm">
                              {comment.user.profilePicture ? <img src={getImageUrl(comment.user.profilePicture)} alt={comment.user.name} className="w-full h-full object-cover" /> : comment.user.name.charAt(0)}
                            </Link>
                            <div className={`flex-1 bg-white p-4 rounded-2xl rounded-tl-none border border-surface-200 shadow-premium group/comment ${comment.isOptimistic ? 'opacity-60' : ''}`}>
                              <div className="flex justify-between items-start mb-1.5">
                                <Link to={`/profile/${comment.user.id}`} className="text-xs font-black text-surface-900 hover:text-brand-600 transition-colors">{comment.user.name}</Link>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-surface-300 uppercase tracking-tighter">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                  {(comment.user.id === currentUser.id || post.user.id === currentUser.id) && !comment.isOptimistic && (
                                    <button 
                                      onClick={() => handleDeleteComment(post.id, comment.id)}
                                      className="text-surface-200 hover:text-red-500 transition-colors"
                                    >
                                      <svg size={12} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-surface-600 leading-relaxed">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Right Sidebar: Trending & Suggestions */}
      <div className="hidden lg:block lg:col-span-3 space-y-6">
        <Card className="sticky top-24">
          <h3 className="font-black text-xs text-surface-400 uppercase tracking-widest mb-6 flex items-center justify-between">
            Trending Hub <TrendingUp size={16} className="text-brand-600" />
          </h3>
          <ul className="space-y-6">
            {trendingUsers.length > 0 ? (
              trendingUsers.map(tUser => (
                <li key={tUser.id}>
                  <Link to={`/profile/${tUser.id}`} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700 font-black text-xs overflow-hidden border-2 border-transparent group-hover:border-brand-500 transition-all shadow-sm">
                        {tUser.profilePicture ? <img src={getImageUrl(tUser.profilePicture)} alt={tUser.name} className="w-full h-full object-cover" /> : tUser.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-surface-900 group-hover:text-brand-600 transition-colors truncate">{tUser.name}</p>
                        <p className="text-[10px] font-bold text-surface-300 uppercase tracking-widest">Growth Expert</p>
                      </div>
                    </div>
                    <div className="ml-2">
                      {getStatusIcon(tUser.id)}
                    </div>
                  </Link>
                </li>
              ))
            ) : (
                <p className="text-xs text-surface-400 font-medium italic">Generating trends...</p>
            )}
            <hr className="border-surface-100" />
            <li 
              className="cursor-pointer group flex flex-col gap-1 hover:bg-brand-50/50 p-2 rounded-xl transition-all"
              onClick={() => { setSearchQuery('#PostAppPremium'); }}
            >
               <div className="flex justify-between items-center text-sm font-black text-surface-900 group-hover:text-brand-600 transition-colors">
                  <span>#PostAppPremium</span>
                  <Badge variant="primary" size="sm">Hot</Badge>
               </div>
               <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">12.5K active discussions</p>
            </li>
          </ul>
        </Card>
        
        <div className="px-4">
           <p className="text-[10px] font-black text-surface-400 uppercase tracking-[2px] leading-relaxed">
             PostApp Premium Product © 2026. <br/> Built for professional growth.
           </p>
        </div>
      </div>

      {/* Profile Modification Modal */}
      {isEditModalOpen && (
        <EditProfileModal 
          user={currentUser} 
          onClose={() => setIsEditModalOpen(false)} 
          onUpdate={onUpdateProfile} 
        />
      )}
    </div>
  );
};

export default HomeFeed;

