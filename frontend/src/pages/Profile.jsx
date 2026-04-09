import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Info, Users, ThumbsUp, MessageSquare, MoreHorizontal, Camera, Edit, Settings, X, Save, Upload } from 'lucide-react';

const Profile = () => {
    const { userId } = useParams();
    const { user: currentUser, login } = useAuth();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('posts');
    
    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editData, setEditData] = useState({ name: '', bio: '', skills: '' });
    const [isSaving, setIsSaving] = useState(false);

    // File Input Refs
    const avatarInputRef = useRef(null);
    const coverInputRef = useRef(null);

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http') || url.startsWith('blob:')) return url;
        return `http://localhost:8081${url.startsWith('/') ? '' : '/'}${url}`;
    };

    useEffect(() => {
        fetchProfileData();
    }, [userId]);

    const fetchProfileData = async () => {
        setLoading(true);
        setError(null);
        try {
            const endpoint = userId ? `/users/${userId}` : '/users/me';
            const profileRes = await api.get(endpoint);
            setProfile(profileRes.data);
            setEditData({
                name: profileRes.data.name || '',
                bio: profileRes.data.bio || '',
                skills: profileRes.data.skills || ''
            });

            const targetId = userId || profileRes.data.id;
            const postsRes = await api.get(`/posts/user/${targetId}`);
            setPosts(postsRes.data);
        } catch (error) {
            console.error("Error fetching profile data:", error);
            setError(error.response?.data?.message || "Failed to load profile data.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('name', profile.name);
        if (type === 'avatar') {
            formData.append('image', file);
        } else {
            formData.append('cover', file);
        }

        try {
            const res = await api.put('/users/me', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProfile(res.data);
            // If it was the current user's profile, update auth context if needed
            if (!userId) {
                // update local storage/context if necessary
            }
        } catch (err) {
            alert("Failed to upload image");
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', editData.name);
            formData.append('bio', editData.bio);
            formData.append('skills', editData.skills);

            const res = await api.put('/users/me', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProfile(res.data);
            setIsEditModalOpen(false);
        } catch (err) {
            alert("Failed to save profile");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[60vh] text-gray-500 font-medium animate-pulse text-lg">Loading Profile...</div>;
    
    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-500 text-center space-y-4">
            <h2 className="text-2xl font-bold">Oops!</h2>
            <p className="text-gray-600 max-w-sm">{error}</p>
            <Link to="/" className="text-indigo-600 font-bold hover:underline">Return Home</Link>
        </div>
    );
    
    if (!profile) return <div className="flex items-center justify-center min-h-[60vh] text-red-500 font-bold">Profile not found</div>;

    const isOwnProfile = !userId || parseInt(userId) === currentUser?.id;

    return (
        <div className="max-w-5xl mx-auto pb-10 animate-in fade-in duration-500 px-4">
            {/* Header Section (Facebook Style Refined) */}
            <div className="bg-white rounded-b-xl shadow-sm border-x border-b overflow-hidden">
                {/* Cover Photo */}
                <div className="h-48 md:h-80 bg-gray-200 relative group">
                    {profile.coverPicture ? (
                        <img src={getImageUrl(profile.coverPicture)} alt="cover" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    )}
                    
                    {isOwnProfile && (
                        <>
                            <input type="file" ref={coverInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'cover')} accept="image/*" />
                            <button 
                                onClick={() => coverInputRef.current.click()}
                                className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-2 px-4 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg hover:bg-white transition translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 duration-300"
                            >
                                <Camera size={18} /> Edit Cover
                            </button>
                        </>
                    )}
                </div>

                {/* Profile Pic and Basic Info (Left Aligned) */}
                <div className="px-4 md:px-10 pb-6">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-24 mb-6">
                        {/* Avatar */}
                        <div className="relative group shrink-0">
                            <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-white bg-indigo-600 flex items-center justify-center text-white text-6xl font-bold shadow-xl overflow-hidden relative">
                                {profile.profilePicture ? (
                                    <img src={getImageUrl(profile.profilePicture)} alt={profile.name} className="w-full h-full object-cover" />
                                ) : profile.name.charAt(0)}
                                
                                {isOwnProfile && (
                                    <div 
                                        onClick={() => avatarInputRef.current.click()}
                                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    >
                                        <Camera size={32} className="text-white" />
                                    </div>
                                )}
                            </div>
                            {isOwnProfile && (
                                <input type="file" ref={avatarInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'avatar')} accept="image/*" />
                            )}
                        </div>

                        {/* Name & Connections Info */}
                        <div className="flex-1 text-center md:text-left mb-2">
                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">{profile.name}</h1>
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-2">
                                <p className="text-gray-500 font-bold hover:underline cursor-pointer">{profile.connectionCount} connections</p>
                                <div className="flex items-center justify-center md:justify-start -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-gray-200"></div>
                                    ))}
                                    <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 font-bold">+{profile.connectionCount > 3 ? profile.connectionCount - 3 : 0}</div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pb-2">
                            {isOwnProfile ? (
                                <>
                                    <button 
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition flex items-center gap-2 transform active:scale-95"
                                    >
                                        <Edit size={18} /> Edit Profile
                                    </button>
                                    <button className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg font-bold hover:bg-gray-200 transition">
                                        <MoreHorizontal size={20} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition">
                                        Connect
                                    </button>
                                    <button className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg font-bold hover:bg-gray-200 transition">
                                        Message
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <hr className="my-2 border-gray-100" />

                    {/* Nav Tabs */}
                    <div className="flex gap-8 overflow-x-auto no-scrollbar">
                        {['posts', 'about', 'friends'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 px-2 text-sm font-bold capitalize transition border-b-4 shrink-0 ${
                                    activeTab === tab 
                                    ? 'border-indigo-600 text-indigo-600' 
                                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
                {/* Intro Sidebar */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border sticky top-24">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Intro</h2>
                        <div className="space-y-5">
                            <p className="text-center text-gray-700 text-lg leading-relaxed px-4">
                                {profile.bio || 'Add a bio to tell the world about yourself.'}
                            </p>
                            <div className="space-y-4 pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-4 text-gray-600">
                                    <div className="p-2 bg-gray-50 rounded-lg"><Info size={20} className="text-indigo-400" /></div>
                                    <span className="font-medium">{profile.email}</span>
                                </div>
                                <div className="flex items-center gap-4 text-gray-600">
                                    <div className="p-2 bg-gray-50 rounded-lg"><Users size={20} className="text-indigo-400" /></div>
                                    <span className="font-medium">Managing {profile.connectionCount} professional connections</span>
                                </div>
                            </div>
                            {isOwnProfile && (
                                <button 
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="w-full bg-indigo-50 text-indigo-600 py-3 rounded-xl text-sm font-bold hover:bg-indigo-100 transition mt-4"
                                >
                                    Edit Details
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-7 space-y-6">
                    {activeTab === 'posts' && (
                        <div className="space-y-6">
                            {posts.length > 0 ? (
                                posts.map(post => (
                                    <div key={post.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden transition hover:shadow-md animate-in slide-in-from-bottom duration-500">
                                        <div className="p-5 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full border bg-indigo-600 flex items-center justify-center text-white font-bold overflow-hidden shadow-sm">
                                                    {profile.profilePicture ? <img src={getImageUrl(profile.profilePicture)} alt={profile.name} className="w-full h-full object-cover" /> : profile.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{profile.name}</h4>
                                                    <p className="text-xs text-gray-400 font-medium">{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                </div>
                                            </div>
                                            <button className="p-2 hover:bg-gray-50 rounded-full transition text-gray-400"><MoreHorizontal size={20} /></button>
                                        </div>
                                        <div className="px-5 pb-4">
                                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                                        </div>
                                        {post.imageUrl && (
                                            <div className="px-1">
                                                <img src={getImageUrl(post.imageUrl)} alt="content" className="w-full rounded-lg object-cover max-h-[500px]" />
                                            </div>
                                        )}
                                        <div className="px-5 py-3 border-t border-gray-50 flex items-center gap-8">
                                            <button className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-bold transition group">
                                                <ThumbsUp size={20} className="group-hover:scale-110 transition" /> Like
                                            </button>
                                            <button className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-bold transition">
                                                <MessageSquare size={20} /> Comment
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white rounded-2xl p-16 text-center border shadow-sm">
                                    <div className="w-24 h-24 bg-indigo-50 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Edit size={40} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No activity yet</h3>
                                    <p className="text-gray-500 font-medium">Capture your professional moments and they'll appear here.</p>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Other tabs remain similar in logic but improved in styling */}
                    {activeTab === 'about' && (
                        <div className="bg-white rounded-2xl p-8 shadow-sm border space-y-8 animate-in slide-in-from-right duration-400">
                            <div>
                                <h2 className="text-2xl font-extrabold text-gray-900 mb-6 border-l-4 border-indigo-600 pl-4">Skills & Endorsements</h2>
                                <div className="flex flex-wrap gap-3">
                                    {profile.skills ? profile.skills.split(',').map((skill, index) => (
                                        <div key={index} className="px-5 py-2.5 bg-gray-50 text-gray-700 rounded-xl text-sm font-bold border hover:border-indigo-300 hover:bg-white transition-all cursor-default">
                                            {skill.trim()}
                                        </div>
                                    )) : <p className="text-gray-400">No skills specified.</p>}
                                </div>
                            </div>
                            <div className="pt-8 border-t border-gray-100">
                                <h2 className="text-2xl font-extrabold text-gray-900 mb-6 border-l-4 border-indigo-600 pl-4">Metrics</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Search Appearances', value: profile.searchCount },
                                        { label: 'Total Content', value: profile.postCount }
                                    ].map((stat, idx) => (
                                        <div key={idx} className="bg-gray-50 p-6 rounded-2xl border text-center group hover:bg-white hover:border-indigo-200 transition-all">
                                            <p className="text-3xl font-black text-indigo-600 mb-1">{stat.value}</p>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'friends' && (
                        <div className="bg-white rounded-2xl p-8 shadow-sm border animate-in zoom-in duration-400">
                            <h2 className="text-2xl font-extrabold text-gray-900 mb-8 border-l-4 border-indigo-600 pl-4">Professional Network</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 border rounded-2xl hover:shadow-md hover:border-indigo-100 transition-all group cursor-pointer">
                                        <div className="w-14 h-14 rounded-full bg-indigo-50 border-2 border-white shadow-sm flex items-center justify-center text-indigo-600 font-bold text-xl group-hover:scale-105 transition">
                                            U
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-extrabold text-gray-900">User {i + 1}</p>
                                            <p className="text-xs text-gray-400 font-bold">Mutual Connection</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-2xl font-black text-gray-900">Edit Professional Info</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white rounded-full transition shadow-sm"><X size={24} /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                                <input 
                                    type="text" 
                                    value={editData.name}
                                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                                    className="w-full px-5 py-4 bg-gray-50 border rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Bio / Headline</label>
                                <textarea 
                                    value={editData.bio}
                                    onChange={(e) => setEditData({...editData, bio: e.target.value})}
                                    className="w-full px-5 py-4 bg-gray-50 border rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition font-medium min-h-[120px] resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Skills (comma separated)</label>
                                <input 
                                    type="text" 
                                    value={editData.skills}
                                    onChange={(e) => setEditData({...editData, skills: e.target.value})}
                                    className="w-full px-5 py-4 bg-gray-50 border rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition font-medium"
                                />
                            </div>
                        </div>
                        <div className="p-6 pt-0 flex gap-3">
                            <button 
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {isSaving ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Save size={20} /> Save Changes</>}
                            </button>
                            <button 
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-black hover:bg-gray-200 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
