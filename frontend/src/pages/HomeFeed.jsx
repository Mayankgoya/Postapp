import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ThumbsUp, MessageSquare, Edit, Image as ImageIcon, Search, UserPlus } from 'lucide-react';
import EditProfileModal from '../components/EditProfileModal';

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

  const fetchPosts = async () => {
    try {
      const res = await api.get('/posts');
      setPosts(res.data);
    } catch (err) {
      console.error(err);
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

  useEffect(() => {
    fetchPosts();
    fetchTrending();
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
    try {
      await api.post(`/posts/${postId}/like`);
      fetchPosts(); 
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
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

  const onUpdateProfile = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Left Sidebar */}
      <div className="hidden md:block col-span-1 space-y-4">
        {/* Profile Info */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="h-16 bg-indigo-600"></div>
          <div className="px-4 pb-4 -mt-8 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-white border-4 border-white flex items-center justify-center text-3xl font-bold bg-indigo-500 text-white shadow-sm overflow-hidden mb-3">
              {currentUser.profilePicture ? (
                <img src={currentUser.profilePicture} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : currentUser.name.charAt(0)}
            </div>
            <h3 className="font-bold text-lg text-gray-900">{currentUser.name}</h3>
            <p className="text-gray-500 text-xs text-center line-clamp-2 px-2 h-8">{currentUser.bio || 'Add a bio to your profile.'}</p>
            
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="mt-4 flex items-center gap-2 text-indigo-600 hover:bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-200 text-sm font-semibold transition w-full justify-center"
            >
              <Edit size={16} /> Edit Profile
            </button>
          </div>
        </div>

        {/* Create Post Widget (Instagram Style) */}
        <div className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
          <h4 className="font-bold text-sm text-gray-700 flex items-center gap-2">
            <ImageIcon className="text-indigo-600" size={18} /> New Post
          </h4>
          <form onSubmit={handlePostSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase">Upload Image</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-gray-400">
                <span className="text-[10px] font-bold">OR</span>
              </div>
              <input 
                type="text" 
                placeholder="Paste Image URL..." 
                value={newPost.imageUrl}
                onChange={(e) => setNewPost({ ...newPost, imageUrl: e.target.value, imageFile: null })}
                className="w-full bg-gray-50 border rounded-lg p-2 pl-7 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
            <textarea 
              placeholder="Write a caption..." 
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              className="w-full bg-gray-50 border rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
              rows="3"
            />
            <button 
              type="submit" 
              disabled={!newPost.content.trim()}
              className="w-full bg-indigo-600 text-white py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              Share Post
            </button>
          </form>
        </div>
      </div>

      {/* Main Feed */}
      <div className="col-span-1 md:col-span-3 lg:col-span-2 space-y-4">
        {/* Search Bar */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition" />
          </div>
          <input 
            type="text" 
            placeholder="Search people by username..." 
            value={searchQuery}
            onChange={handleSearch}
            className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
          
          {/* Search Results Dropdown */}
          {isSearching && searchQuery.length > 1 && (
            <div className="absolute top-full mt-2 w-full bg-white border rounded-xl shadow-xl z-40 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
              {searchResults.length > 0 ? (
                searchResults.map(result => (
                  <div key={result.id} className="p-3 hover:bg-gray-50 flex items-center justify-between border-b last:border-b-0 border-transparent hover:border-indigo-100 transition">
                    <Link to={`/profile/${result.id}`} className="flex items-center gap-3 group">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold overflow-hidden border-2 border-transparent group-hover:border-indigo-500 transition">
                        {result.profilePicture ? <img src={result.profilePicture} alt={result.name} /> : result.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900 group-hover:text-indigo-600 transition">{result.name}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[150px]">{result.bio}</p>
                      </div>
                    </Link>
                    <button className="text-indigo-600 hover:text-indigo-800 p-2 hover:bg-indigo-50 rounded-full transition">
                      <UserPlus size={18} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500 text-sm">No people found matching "{searchQuery}"</div>
              )}
            </div>
          )}
        </div>

        {/* Posts List */}
        <div className="space-y-6">
          <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wider px-1">Recent posts</h2>
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm border overflow-hidden transition hover:shadow-md">
              <div className="p-4 flex items-center gap-3">
                <Link to={`/profile/${post.user.id}`} className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold overflow-hidden hover:opacity-80 transition">
                  {post.user.profilePicture ? <img src={post.user.profilePicture} alt={post.user.name} /> : post.user.name.charAt(0)}
                </Link>
                <div>
                  <Link to={`/profile/${post.user.id}`} className="font-bold text-sm text-gray-900 hover:text-indigo-600 transition">{post.user.name}</Link>
                  <p className="text-[10px] text-gray-400">{new Date(post.createdAt).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="px-4 pb-3">
                <p className="text-sm text-gray-800 leading-relaxed">{post.content}</p>
              </div>

              {post.imageUrl && (
                <div className="border-y bg-gray-50">
                  <img src={post.imageUrl} alt="Post" className="w-full h-auto max-h-[500px] object-contain mx-auto" />
                </div>
              )}

              <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-50 flex justify-between">
                <span>{post.likesCount} likes</span>
                <span>{post.comments.length} comments</span>
              </div>

              <div className="px-2 py-1 flex gap-1 border-t border-gray-50">
                <button onClick={() => handleLike(post.id)} className="flex items-center gap-2 flex-1 justify-center py-2 hover:bg-gray-50 rounded text-gray-600 font-bold transition text-xs">
                  <ThumbsUp size={18} className="text-gray-400" /> Like
                </button>
                <button className="flex items-center gap-2 flex-1 justify-center py-2 hover:bg-gray-50 rounded text-gray-600 font-bold transition text-xs">
                  <MessageSquare size={18} className="text-gray-400" /> Comment
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden lg:block col-span-1">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h3 className="font-bold text-sm mb-4 text-gray-800">Trending Now</h3>
          <ul className="space-y-4">
            {trendingUsers.length > 0 ? (
              trendingUsers.map(tUser => (
                <li key={tUser.id} className="group p-2 rounded-lg transition hover:bg-gray-50">
                  <Link to={`/profile/${tUser.id}`} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs overflow-hidden border border-transparent group-hover:border-indigo-400 transition">
                        {tUser.profilePicture ? <img src={tUser.profilePicture} alt={tUser.name} /> : tUser.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800 group-hover:text-indigo-600 transition truncate max-w-[100px]">{tUser.name}</p>
                        <p className="text-[10px] text-gray-400">Popular Profile</p>
                      </div>
                    </div>
                    <UserPlus size={14} className="text-indigo-600 opacity-0 group-hover:opacity-100 transition" />
                  </Link>
                </li>
              ))
            ) : (
                <p className="text-xs text-gray-500 italic">No trending people yet.</p>
            )}
            <hr className="border-gray-100" />
            <li className="cursor-pointer group px-2">
               <p className="text-xs font-bold text-gray-800 group-hover:text-indigo-600 transition">#PostAppReleases</p>
               <p className="text-[10px] text-gray-400">12.5K posts</p>
            </li>
          </ul>
        </div>
      </div>

      {/* Modals */}
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

