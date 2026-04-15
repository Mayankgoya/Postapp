import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Info, Users, ThumbsUp, MessageSquare, MoreHorizontal, Camera, Edit, Save, Upload, Briefcase, MapPin, Link as LinkIcon, Calendar, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import { ProfileSkeleton } from '../components/ui/Skeleton';

const Profile = () => {
    const { userId } = useParams();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('posts');
    const [connectionStatus, setConnectionStatus] = useState('NONE'); 
    const [connections, setConnections] = useState([]);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editData, setEditData] = useState({ name: '', bio: '', skills: '', location: '' });
    const [isSaving, setIsSaving] = useState(false);

    const avatarInputRef = useRef(null);
    const coverInputRef = useRef(null);

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http') || url.startsWith('blob:')) return url;
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
        return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
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
                skills: profileRes.data.skills || '',
                location: profileRes.data.location || ''
            });

            const targetId = userId || profileRes.data.id;
            const postsRes = await api.get(`/posts/user/${targetId}`);
            setPosts(postsRes.data);

            if (userId && parseInt(userId) !== currentUser?.id) {
                const statusRes = await api.get(`/connections/status/${userId}`);
                setConnectionStatus(statusRes.data);
            }

            const connEndpoint = userId ? `/connections/user/${userId}` : '/connections';
            const connRes = await api.get(connEndpoint);
            setConnections(connRes.data);
        } catch (error) {
            console.error("Error fetching profile:", error);
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
        formData.append('bio', profile.bio || '');
        formData.append('skills', profile.skills || '');
        formData.append('location', profile.location || '');
        
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
        } catch (err) {
            console.error(err);
        }
    };

    const handleConnect = async () => {
        if (!userId) return;
        try {
            await api.post(`/connections/request/${userId}`);
            setConnectionStatus('PENDING');
        } catch (err) {
            console.error("Connection request failed:", err);
            alert("Execution failed: Pipeline saturated.");
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', editData.name);
            formData.append('bio', editData.bio);
            formData.append('skills', editData.skills);
            formData.append('location', editData.location);

            const res = await api.put('/users/me', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProfile(res.data);
            setIsEditModalOpen(false);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleLike = async (postId) => {
        const post = posts.find(p => p.id === postId);
        if (!post) return;

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
            setPosts(originalPosts);
            alert("Connection error: Reaction unsynced.");
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Permanently archive this post?")) return;
        
        const originalPosts = [...posts];
        setPosts(posts.filter(p => p.id !== postId));

        try {
            await api.delete(`/posts/${postId}`);
        } catch (err) {
            console.error(err);
            setPosts(originalPosts);
            alert("Modification unauthorized or server offline.");
        }
    };

    if (loading) return <ProfileSkeleton />;
    
    if (error) return (
        <Card className="max-w-md mx-auto mt-20 p-12 text-center animate-slide-up">
            <h2 className="text-3xl font-black text-surface-900 mb-4">Connection Lost</h2>
            <p className="text-surface-500 font-medium mb-8 leading-relaxed">{error}</p>
            <Button as={Link} to="/" variant="primary" className="w-full py-4">Return to Landing</Button>
        </Card>
    );
    
    if (!profile) return null;

    const isOwnProfile = !userId || parseInt(userId) === currentUser?.id;

    return (
        <div className="max-w-5xl mx-auto pb-16 animate-fade-in px-4">
            {/* Extended Header Card */}
            <Card noPadding className="overflow-hidden border-none shadow-premium-hover">
                {/* Immersive Cover Photo */}
                <div 
                    className={`h-56 md:h-80 bg-surface-100 relative group ${isOwnProfile ? 'cursor-pointer' : ''}`}
                    onClick={() => isOwnProfile && coverInputRef.current.click()}
                >
                    {profile.coverPicture ? (
                        <img src={getImageUrl(profile.coverPicture)} alt="cover" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800" />
                    )}
                    
                    {isOwnProfile && (
                        <>
                            <input type="file" ref={coverInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'cover')} accept="image/*" />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
                                <div className="flex flex-col items-center gap-3 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-2xl">
                                        <Camera className="text-white" size={28} />
                                    </div>
                                    <span className="text-white font-black text-sm uppercase tracking-widest drop-shadow-md">Update Professional Banner</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Profile Identity Area */}
                <div className="px-6 md:px-10 pb-8 relative z-20">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-10 md:gap-14 -mt-10 md:-mt-16 mb-8">
                        {/* High-Resolution Avatar */}
                        <div className="relative group shrink-0">
                            <div className="w-36 h-36 md:w-48 md:h-48 rounded-3xl border-8 border-white bg-brand-600 flex items-center justify-center text-white text-7xl font-black shadow-2xl overflow-hidden relative transition-transform group-hover:scale-105">
                                {profile.profilePicture ? (
                                    <img src={getImageUrl(profile.profilePicture)} alt={profile.name} className="w-full h-full object-cover" />
                                ) : profile.name.charAt(0)}
                                
                                {isOwnProfile && (
                                    <div 
                                        onClick={() => avatarInputRef.current.click()}
                                        className="absolute inset-0 bg-brand-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[2px]"
                                    >
                                        <Camera size={40} className="text-white scale-90 group-hover:scale-100 transition-transform" />
                                    </div>
                                )}
                            </div>
                            {isOwnProfile && (
                                <input type="file" ref={avatarInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'avatar')} accept="image/*" />
                            )}
                        </div>

                        {/* Visual Hierarchy: Name & Status */}
                        <div className="flex-1 text-center md:text-left pt-6 md:pt-16 uppercase-none">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                              <h1 className="text-3xl md:text-5xl font-black text-surface-900 tracking-tighter leading-tight flex items-center gap-2 group/name cursor-default transition-all duration-300 hover:scale-[1.02]">
                                <span className="relative">
                                  {profile.name}
                                  <span className="absolute -bottom-1 left-0 w-0 h-1 bg-brand-600 transition-all duration-300 group-hover/name:w-full rounded-full" />
                                </span>
                                <CheckCircle size={28} className="text-brand-500 fill-brand-50 transition-transform group-hover/name:rotate-12" />
                              </h1>
                              <div className="flex items-center gap-2">
                                <Badge variant="primary" size="md" className="px-4 py-1.5 shadow-premium bg-brand-600 text-white rounded-xl border border-brand-400">PostApp Prime</Badge>
                              </div>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mt-4 text-surface-500 font-bold">
                                <div className="flex items-center gap-1.5 hover:text-brand-600 transition-colors cursor-pointer">
                                  <Users size={18} />
                                  <span>{profile.connectionCount} Connections</span>
                                </div>
                                <span className="text-surface-200 hidden sm:block">|</span>
                                <div className="flex items-center gap-1.5">
                                  <MapPin size={18} />
                                  <span>{profile.location || 'Professional Hub'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Priority Actions */}
                        <div className="flex gap-3 pb-2 w-full md:w-auto">
                            {isOwnProfile ? (
                                <>
                                    <Button 
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="flex-1 md:flex-none px-8 shadow-xl"
                                        leftIcon={Edit}
                                    >
                                        Modify Profile
                                    </Button>
                                    <Button variant="secondary" className="px-3" leftIcon={MoreHorizontal} />
                                </>
                            ) : (
                                <>
                                    <Button 
                                        onClick={handleConnect}
                                        disabled={connectionStatus !== 'NONE'}
                                        variant={connectionStatus === 'NONE' ? 'primary' : 'secondary'}
                                        className="flex-1 md:flex-none px-10"
                                        leftIcon={connectionStatus === 'NONE' ? Users : null}
                                    >
                                        {connectionStatus === 'NONE' ? 'Connect' : connectionStatus === 'PENDING' ? 'Requested' : 'Connected'}
                                    </Button>
                                    <Button variant="outline" className="flex-1 md:flex-none px-8">Message</Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Sophisticated Tab Navigation */}
                    <div className="flex gap-10 border-t border-surface-100 mt-8 overflow-x-auto no-scrollbar">
                        {['posts', 'about', 'friends'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-5 px-1 text-xs font-black uppercase tracking-[2px] transition-all relative shrink-0 ${
                                    activeTab === tab 
                                    ? 'text-brand-600' 
                                    : 'text-surface-400 hover:text-surface-600'
                                }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-600 rounded-full animate-in fade-in zoom-in duration-300" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Content Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
                {/* Professional Intro Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="sticky top-24">
                        <h2 className="text-xs font-black text-surface-400 uppercase tracking-widest mb-6">Professional Digest</h2>
                        <div className="space-y-6">
                            <p className="text-surface-700 text-base leading-relaxed italic font-medium">
                                "{profile.bio || 'This professional is busy building the future.'}"
                            </p>
                            <div className="space-y-4 pt-6 border-t border-surface-100">
                                <div className="flex items-center gap-4 text-surface-600 group">
                                    <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl transition-transform group-hover:scale-110"><Briefcase size={20} /></div>
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-surface-300">Role</span>
                                      <span className="font-bold">Senior Growth Engineer</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-surface-600 group">
                                    <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl transition-transform group-hover:scale-110"><Info size={20} /></div>
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-surface-300">Contact</span>
                                      <span className="font-bold truncate max-w-[180px]">{profile.email}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-surface-600 group">
                                    <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl transition-transform group-hover:scale-110"><Calendar size={20} /></div>
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-surface-300">Member Since</span>
                                      <span className="font-bold">April 2024</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                    
                    <Card>
                      <h2 className="text-xs font-black text-surface-400 uppercase tracking-widest mb-4">Top Skills</h2>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills ? profile.skills.split(',').map((skill, index) => (
                           <Badge key={index} variant="secondary" size="md">{skill.trim()}</Badge>
                        )) : <p className="text-xs text-surface-300 font-bold italic">No skills listed.</p>}
                      </div>
                    </Card>
                </div>

                {/* Main Dynamic Workspace */}
                <div className="lg:col-span-8 space-y-6">
                    {activeTab === 'posts' && (
                        <div className="space-y-6">
                            {posts.length > 0 ? (
                                posts.map(post => (
                                    <Card key={post.id} noPadding className="animate-slide-up group h-fit">
                                        <div className="p-5 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center text-white font-black overflow-hidden shadow-sm">
                                                    {profile.profilePicture ? <img src={getImageUrl(profile.profilePicture)} alt={profile.name} className="w-full h-full object-cover" /> : profile.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-surface-900 leading-tight">{profile.name}</h4>
                                                    <p className="text-[10px] text-surface-300 font-black uppercase tracking-widest mt-0.5">{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isOwnProfile && (
                                                    <button 
                                                        onClick={() => handleDeletePost(post.id)}
                                                        className="p-2.5 hover:bg-red-50 text-surface-200 hover:text-red-500 rounded-xl transition-all"
                                                        title="Delete Post"
                                                    >
                                                        <svg size={18} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                )}
                                                <button className="p-2.5 hover:bg-surface-50 text-surface-300 hover:text-surface-900 rounded-xl transition-all"><MoreHorizontal size={20} /></button>
                                            </div>
                                        </div>
                                        <div className="px-6 pb-4">
                                            <p className="text-surface-700 leading-relaxed font-medium whitespace-pre-wrap">{post.content}</p>
                                        </div>
                                        {post.imageUrl && (
                                            <div className="px-2 pb-2">
                                                <img src={getImageUrl(post.imageUrl)} alt="content" className="w-full rounded-2xl object-cover max-h-[600px] shadow-sm" />
                                            </div>
                                        )}
                                        <div className="px-6 py-4 border-t border-surface-50 bg-surface-50/20 flex items-center gap-10">
                                            <button 
                                                onClick={() => handleLike(post.id)}
                                                className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all group ${post.likedByCurrentUser ? 'text-brand-600' : 'text-surface-400 hover:text-brand-600'}`}
                                            >
                                                <ThumbsUp size={20} className={`group-active:scale-125 transition-transform ${post.likedByCurrentUser ? 'fill-brand-600' : ''}`} /> 
                                                {post.likedByCurrentUser ? 'Liked' : 'Like'}
                                            </button>
                                            <div className="flex items-center gap-2 text-xs font-black text-surface-400 uppercase tracking-widest">
                                                <MessageSquare size={20} /> {post.comments?.length || 0} Comments
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <Card className="py-20 text-center flex flex-col items-center">
                                    <div className="w-24 h-24 bg-brand-50 text-brand-300 rounded-3xl flex items-center justify-center mb-8 rotate-3 group hover:rotate-0 transition-transform">
                                        <Edit size={48} />
                                    </div>
                                    <h3 className="text-2xl font-black text-surface-900 mb-2 tracking-tight">Timeline is silent</h3>
                                    <p className="text-surface-500 font-medium max-w-xs leading-relaxed">Publish your first breakthrough and start gaining traction.</p>
                                    {isOwnProfile && <Button className="mt-8" variant="outline">Start Writing</Button>}
                                </Card>
                            )}
                        </div>
                    )}
                    
                    {activeTab === 'about' && (
                        <div className="space-y-6 animate-slide-up">
                            <Card>
                                <h2 className="text-xl font-black text-surface-900 mb-8 flex items-center gap-3">
                                  <span className="w-1.5 h-8 bg-brand-600 rounded-full" /> Performance Architecture
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[
                                        { label: 'Weekly Profile Visits', value: profile.searchCount * 12, trend: '+12%' },
                                        { label: 'Cumulative Posts', value: profile.postCount, trend: '+3' },
                                        { label: 'Network Reach', value: profile.connectionCount * 85, trend: '+240' }
                                    ].map((stat, idx) => (
                                        <div key={idx} className="bg-surface-50 p-6 rounded-2xl border border-surface-100 group hover:bg-white hover:shadow-premium transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                              <p className="text-3xl font-black text-brand-600">{stat.value}</p>
                                              <span className="text-[10px] font-black text-green-500 bg-green-50 px-1.5 py-0.5 rounded-md">{stat.trend}</span>
                                            </div>
                                            <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                            <Card>
                              <h2 className="text-xl font-black text-surface-900 mb-6 flex items-center gap-3">
                                <span className="w-1.5 h-8 bg-brand-600 rounded-full" /> Biography
                              </h2>
                              <p className="text-surface-700 leading-loose font-medium">
                                {profile.bio || "No professional biography available."}
                              </p>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'friends' && (
                        <Card className="animate-slide-up">
                            <h2 className="text-xl font-black text-surface-900 mb-8 flex items-center gap-3">
                              <span className="w-1.5 h-8 bg-brand-600 rounded-full" /> Verified Network
                            </h2>
                            {connections.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {connections.map((friend) => (
                                        <Link key={friend.id} to={`/profile/${friend.id}`} className="flex items-center gap-4 p-5 border border-surface-100 rounded-2xl hover:shadow-premium hover:border-brand-200 transition-all group bg-white cursor-pointer">
                                            <div className="w-14 h-14 rounded-xl bg-brand-50 border-2 border-white shadow-sm flex items-center justify-center text-brand-600 font-black text-xl group-hover:scale-105 transition-transform overflow-hidden">
                                                {friend.profilePicture ? <img src={getImageUrl(friend.profilePicture)} alt={friend.name} className="w-full h-full object-cover" /> : friend.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-surface-900 group-hover:text-brand-600 transition-colors truncate leading-tight">{friend.name}</p>
                                                <p className="text-[10px] text-surface-400 font-bold uppercase tracking-widest truncate mt-0.5">{friend.bio || 'Pro Member'}</p>
                                            </div>
                                            <Button variant="ghost" size="sm" className="p-2 rounded-xl">
                                                <LinkIcon size={18} />
                                            </Button>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center flex flex-col items-center">
                                    <div className="w-20 h-20 bg-brand-50 text-brand-300 rounded-full flex items-center justify-center mb-6">
                                        <Users size={32} />
                                    </div>
                                    <h3 className="text-xl font-black text-surface-900">Isolation Zone</h3>
                                    <p className="text-surface-500 font-medium max-w-sm mx-auto mt-2 leading-relaxed">
                                        {isOwnProfile ? "Start connecting with professionals to break the silence." : "This network is currently private."}
                                    </p>
                                    {isOwnProfile && (
                                        <Button as={Link} to="/connections" className="mt-8 px-10">Expand Pipeline</Button>
                                    )}
                                </div>
                            )}
                        </Card>
                    )}
                </div>
            </div>

            {/* Premium Refactor: Profile Modification Suite */}
            <Modal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)}
                title="Professional Suite"
                maxWidth="max-w-lg"
                footer={
                    <>
                        <Button 
                            onClick={handleSaveProfile}
                            isLoading={isSaving}
                            className="flex-1 py-4"
                            leftIcon={Save}
                        >
                            Commit Changes
                        </Button>
                        <Button 
                            variant="secondary"
                            onClick={() => setIsEditModalOpen(false)}
                            className="px-8"
                        >
                            Abort
                        </Button>
                    </>
                }
            >
                <div className="space-y-6">
                    <Input 
                        label="Account Identity" 
                        value={editData.name}
                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                        placeholder="Legal Name"
                    />
                    <TextArea 
                        label="Professional Headline" 
                        value={editData.bio}
                        onChange={(e) => setEditData({...editData, bio: e.target.value})}
                        className="min-h-[120px]"
                        placeholder="Describe your value proposition..."
                    />
                    <Input 
                        label="Skill Matrix (Comma Separated)" 
                        value={editData.skills}
                        onChange={(e) => setEditData({...editData, skills: e.target.value})}
                        placeholder="React, Architecture, Vision"
                    />
                    <Input 
                        label="Primary Location" 
                        value={editData.location}
                        onChange={(e) => setEditData({...editData, location: e.target.value})}
                        placeholder="Ex: Silicon Valley, CA"
                    />
                </div>
            </Modal>
        </div>
    );
};

export default Profile;
