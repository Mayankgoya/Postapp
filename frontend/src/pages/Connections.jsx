import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserPlus, UserCheck, Users, Mail, Group, Calendar, FileText, Hash, ChevronRight, X, MoreHorizontal, UserMinus, Contact, Layout } from 'lucide-react';
import { Link } from 'react-router-dom';

const Connections = () => {
    const { user } = useAuth();
    const [connections, setConnections] = useState([]);
    const [pending, setPending] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [connectModalOpen, setConnectModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [connectMessage, setConnectMessage] = useState('');
    const [sentRequestIds, setSentRequestIds] = useState([]);

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http') || url.startsWith('blob:')) return url;
        return `http://localhost:8081${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [connRes, pendRes, sentRes, usersRes, profileRes] = await Promise.all([
                api.get('/connections'),
                api.get('/connections/pending'),
                api.get('/connections/sent-ids'),
                api.get('/users'),
                api.get('/users/me')
            ]);
            setConnections(connRes.data);
            setPending(pendRes.data);
            setSentRequestIds(sentRes.data);
            setProfile(profileRes.data);
            
            const connectedIds = connRes.data.map(u => u.id);
            const pendingIncomingIds = pendRes.data.map(req => req.sender.id);
            const pendingOutgoingIds = sentRes.data;
            
            const exploreUsers = usersRes.data.filter(u => u.id !== user.id);
            setAllUsers(exploreUsers);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openConnectModal = (user) => {
        setSelectedUser(user);
        setConnectMessage('');
        setConnectModalOpen(true);
    };

    const sendRequest = async () => {
        if (!selectedUser) return;
        try {
            await api.post(`/connections/request/${selectedUser.id}`, { message: connectMessage });
            setConnectModalOpen(false);
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const acceptRequest = async (userId) => {
        try {
            await api.post(`/connections/accept/${userId}`);
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const ignoreRequest = (userId) => {
        setPending(pending.filter(p => p.sender.id !== userId));
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto pb-12 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Sidebar: Manage My Network */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden sticky top-24">
                        <div className="p-5 border-b bg-gray-50/50">
                            <h2 className="text-lg font-black text-gray-900">Manage my network</h2>
                        </div>
                        <div className="p-2">
                            {[
                                { id: 1, label: 'Connections', icon: <Users size={18} />, count: profile?.connectionCount || 0 },
                                { id: 2, label: 'Contacts', icon: <Contact size={18} />, count: profile?.contactCount || 0 },
                                { id: 3, label: 'Groups', icon: <Layout size={18} />, count: profile?.groupCount || 0 },
                                { id: 4, label: 'Events', icon: <Calendar size={18} />, count: profile?.eventCount || 0 },
                                { id: 5, label: 'Pages', icon: <FileText size={18} />, count: profile?.pageCount || 0 },
                                { id: 6, label: 'Newsletters', icon: <Mail size={18} />, count: profile?.newsletterCount || 0 },
                                { id: 7, label: 'Hashtags', icon: <Hash size={18} />, count: profile?.hashtagCount || 0 },
                            ].map((item) => (
                                <button key={item.id} className="w-full flex items-center justify-between p-3 px-4 hover:bg-gray-50 rounded-lg transition-colors group">
                                    <div className="flex items-center gap-4 text-gray-600 group-hover:text-indigo-600 transition-colors">
                                        <span className="opacity-70">{item.icon}</span>
                                        <span className="font-bold text-sm tracking-wide">{item.label}</span>
                                    </div>
                                    <span className="text-gray-400 font-bold text-sm">{item.count}</span>
                                </button>
                            ))}
                        </div>
                        <div className="p-4 bg-indigo-50/30 text-center border-t border-indigo-50">
                            <button className="text-indigo-600 text-sm font-black hover:underline">Show less</button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-9 space-y-6">
                    
                    {/* Invitations Section */}
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <div className="p-4 border-b flex justify-between items-center bg-white">
                            <h2 className="text-md font-black text-gray-700 uppercase tracking-widest">Invitations</h2>
                            <button className="text-indigo-600 font-bold text-sm hover:underline">See all ({pending.length})</button>
                        </div>
                        
                        {pending.length > 0 ? (
                            <div className="divide-y border-t border-gray-50">
                                {pending.map(req => (
                                    <div key={req.sender.id} className="p-5 flex flex-col sm:flex-row justify-between items-center hover:bg-gray-50/50 transition-colors gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-full border-2 border-indigo-100 bg-indigo-600 flex items-center justify-center text-white text-2xl font-black overflow-hidden shadow-sm">
                                                {req.sender.profilePicture ? <img src={getImageUrl(req.sender.profilePicture)} alt={req.sender.name} /> : req.sender.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-gray-900 text-lg leading-tight">{req.sender.name}</h3>
                                                <p className="text-sm text-gray-500 font-medium">Invited you to connect</p>
                                                {req.message && (
                                                    <div className="mt-2 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-sm italic text-gray-700">
                                                        "{req.message}"
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button 
                                                onClick={() => ignoreRequest(req.sender.id)}
                                                className="px-6 py-2 text-gray-500 font-black text-sm hover:bg-gray-200 rounded-full transition-all"
                                            >
                                                Ignore
                                            </button>
                                            <button 
                                                onClick={() => acceptRequest(req.sender.id)}
                                                className="px-8 py-2 border-2 border-indigo-600 text-indigo-600 font-black text-sm hover:bg-indigo-50 rounded-full transition-all flex items-center gap-2"
                                            >
                                                <UserCheck size={18} /> Accept
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-400 font-medium italic">
                                No pending invitations.
                            </div>
                        )}
                    </div>

                    {/* Discovery Hub (Grid) */}
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <div className="p-5 border-b bg-gray-50/50 flex justify-between items-center">
                            <h2 className="text-lg font-black text-gray-900 tracking-tight">People you may know based on your field</h2>
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-white rounded-lg transition"><X size={18} className="text-gray-400" /></button>
                            </div>
                        </div>
                        
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {allUsers.length > 0 ? (
                                allUsers.map(u => (
                                    <div key={u.id} className="group relative bg-white border rounded-xl overflow-hidden hover:shadow-xl hover:border-indigo-100 transition-all duration-300 animate-in zoom-in duration-300">
                                        {/* Minimal Card Header */}
                                        <div className="h-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
                                            {u.coverPicture && <img src={getImageUrl(u.coverPicture)} className="w-full h-full object-cover opacity-80" alt="cover" />}
                                            <button className="absolute top-2 right-2 p-1.5 bg-black/20 hover:bg-black/40 rounded-full text-white transition">
                                                <X size={14} />
                                            </button>
                                        </div>
                                        
                                        {/* Avatar & Content */}
                                        <div className="flex flex-col items-center p-5 pt-0">
                                            <div className="relative -mt-10 mb-4">
                                                <div className="w-20 h-20 rounded-full border-4 border-white bg-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-lg overflow-hidden transition-transform group-hover:scale-105">
                                                    {u.profilePicture ? <img src={getImageUrl(u.profilePicture)} alt={u.name} className="w-full h-full object-cover" /> : u.name.charAt(0)}
                                                </div>
                                            </div>
                                            
                                            <Link to={`/profile/${u.id}`} className="text-center group-hover:text-indigo-600 transition-colors">
                                                <h3 className="font-black text-gray-900 text-md truncate max-w-[180px] leading-tight">{u.name}</h3>
                                                <p className="text-xs text-gray-500 font-medium mt-1 min-h-[32px] overflow-hidden line-clamp-2">
                                                    {u.bio || 'Professional at PostApp'}
                                                </p>
                                            </Link>
                                            
                                            <div className="mt-4 w-full border-t border-gray-50 pt-4 flex flex-col items-center gap-3">
                                                {connections.find(c => c.id === u.id) ? (
                                                    <button 
                                                        disabled
                                                        className="w-full py-2 border-2 border-green-600 text-green-600 rounded-full text-sm font-black bg-green-50 flex items-center justify-center gap-2"
                                                    >
                                                        <UserCheck size={16} /> Connected
                                                    </button>
                                                ) : sentRequestIds.includes(u.id) ? (
                                                    <button 
                                                        disabled
                                                        className="w-full py-2 border-2 border-gray-300 text-gray-400 rounded-full text-sm font-black bg-gray-50 flex items-center justify-center gap-2"
                                                    >
                                                        Requested
                                                    </button>
                                                ) : pending.find(p => p.sender.id === u.id) ? (
                                                    <button 
                                                        disabled
                                                        className="w-full py-2 border-2 border-indigo-400 text-indigo-400 rounded-full text-sm font-black bg-indigo-50 flex items-center justify-center gap-2"
                                                    >
                                                        Review Invite
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => openConnectModal(u)}
                                                        className="w-full py-2 border-2 border-indigo-600 text-indigo-600 rounded-full text-sm font-black hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 active:scale-95"
                                                    >
                                                        <UserPlus size={16} /> Connect
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Users size={32} className="text-gray-300" />
                                    </div>
                                    <p className="text-gray-500 font-bold">Your network is full for now!</p>
                                    <p className="text-xs text-gray-400 mt-1">Check back soon for new suggestions.</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-4 text-center border-t border-gray-50 bg-gray-50/20">
                            <button className="text-gray-500 font-black text-sm hover:text-indigo-600 transition-colors">See all suggestions</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Connect Modal */}
            {connectModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-5 border-b flex justify-between items-center">
                            <h2 className="text-xl font-black text-gray-900">Invite {selectedUser.name} to connect</h2>
                            <button onClick={() => setConnectModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-full transition">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-600 text-sm mb-4">You can optionally add a note to personalize your invitation. LinkedIn clone users are more likely to accept invitations that include a personal note.</p>
                            <textarea
                                className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[100px] resize-none"
                                placeholder="Ex: We worked together on..."
                                value={connectMessage}
                                onChange={(e) => setConnectMessage(e.target.value)}
                                maxLength={500}
                            ></textarea>
                            <div className="text-right text-xs text-gray-400 font-bold mt-1">{connectMessage.length}/500</div>
                        </div>
                        <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 flex-wrap">
                            <button onClick={() => setConnectModalOpen(false)} className="px-5 py-2 rounded-full font-black text-gray-600 hover:bg-gray-200 transition">Cancel</button>
                            <button onClick={sendRequest} className="px-5 py-2 rounded-full font-black bg-indigo-600 text-white hover:bg-indigo-700 transition flex items-center gap-2 shadow-md">
                                <UserPlus size={16} /> Send invitation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Connections;
