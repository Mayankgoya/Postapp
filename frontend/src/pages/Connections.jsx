import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserPlus, UserCheck, Users, Mail, Calendar, FileText, Hash, X, MoreHorizontal, UserMinus, Contact, Layout, ShieldCheck, Zap, Search, TrendingUp, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import TextArea from '../components/ui/TextArea';

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
    const [activeView, setActiveView] = useState('all'); // all, requests, suggestions

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http') || url.startsWith('blob:')) return url;
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
        return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
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
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
            <div className="w-10 h-10 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin mb-4"></div>
            <p className="text-surface-400 font-bold uppercase tracking-widest text-xs">Mapping Network...</p>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 animate-fade-in">
            {/* Left Sidebar: Navigation & Identity Score */}
            <div className="md:col-span-4 lg:col-span-3 space-y-4">
                <Card noPadding className="sticky top-24 overflow-hidden border-none shadow-premium transition-all hover:shadow-premium-hover">
                    <div className="p-6 bg-brand-600 text-white group">
                        <h2 className="text-xl font-black flex items-center gap-3 tracking-tight">
                            <Users size={24} strokeWidth={2.5} className="group-hover:rotate-6 transition-transform" /> Professional Hub
                        </h2>
                        <p className="text-brand-100 text-xs mt-1 font-bold">Scaling your digital influence</p>
                    </div>
                    
                    <div className="p-2">
                        {[
                            { id: 'all', label: 'Connections', icon: Users, count: profile?.connectionCount || 0 },
                            { id: 'requests', label: 'Invitations', icon: Mail, count: pending.length },
                            { id: 'suggestions', label: 'Discovery', icon: Zap, count: allUsers.length },
                            { id: 'groups', label: 'Secret Groups', icon: Layout, count: profile?.groupCount || 0 },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveView(item.id)}
                                className={`
                                    w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all group/item
                                    ${activeView === item.id 
                                        ? 'bg-brand-50 text-brand-700' 
                                        : 'text-surface-500 hover:bg-surface-50 hover:text-surface-900'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon size={18} className={activeView === item.id ? 'text-brand-600' : 'text-surface-400 group-hover/item:text-surface-600'} />
                                    <span className="font-black text-sm tracking-tight">{item.label}</span>
                                </div>
                                {item.count > 0 && (
                                    <Badge variant={activeView === item.id ? 'primary' : 'secondary'} size="sm">
                                        {item.count}
                                    </Badge>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="p-6 pt-2 border-t border-surface-100">
                        <div className="bg-surface-50 p-4 rounded-2xl flex items-center gap-4 group/trust hover:bg-brand-50 transition-all cursor-pointer border border-transparent hover:border-brand-100">
                            <div className="p-2 bg-white rounded-xl shadow-sm text-surface-400 group-hover/trust:text-brand-600 transition-colors">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-black text-surface-900 leading-none">Identity Status</p>
                                <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mt-1">Verified Expert</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Growth Workspace */}
            <div className="md:col-span-8 lg:col-span-9 space-y-6">
                
                {/* Visual Alert: Incoming Requests */}
                {pending.length > 0 && (
                    <div className="space-y-4 animate-slide-up">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-xs font-black text-surface-400 uppercase tracking-[2px] flex items-center gap-2">
                                <Mail size={16} className="text-brand-600" /> High-Value Requests
                            </h3>
                            {pending.length > 2 && <button className="text-[10px] font-black text-brand-600 uppercase tracking-widest hover:underline transition-all">View All</button>}
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                            {pending.map(req => (
                                <Card key={req.sender.id} noPadding className="p-5 flex flex-col sm:flex-row items-center justify-between group hover:border-brand-200 transition-all border-none shadow-premium relative overflow-visible">
                                    <div className="flex items-center gap-5 mb-4 sm:mb-0 w-full sm:w-auto">
                                        <Link to={`/profile/${req.sender.id}`} className="shrink-0 relative">
                                            <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center text-white text-3xl font-black shadow-lg overflow-hidden group-hover:scale-105 transition-transform">
                                                {req.sender.profilePicture ? <img src={getImageUrl(req.sender.profilePicture)} className="w-full h-full object-cover" /> : req.sender.name.charAt(0)}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white shadow-sm" />
                                        </Link>
                                        <div className="min-w-0 flex-1">
                                            <Link to={`/profile/${req.sender.id}`} className="text-xl font-black text-surface-900 hover:text-brand-600 transition-colors leading-none truncate block">
                                                {req.sender.name}
                                            </Link>
                                            <p className="text-sm text-surface-500 font-medium mt-1 truncate">{req.sender.bio || 'Wants to collaborate on PostApp'}</p>
                                            {req.message && (
                                                <div className="mt-2 text-[11px] font-bold italic text-surface-400 bg-surface-50 px-2 py-1 rounded-lg border border-surface-100 flex items-center gap-2">
                                                    <MoreHorizontal size={14} className="shrink-0" />
                                                    <span className="truncate">"{req.message}"</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <Button 
                                            onClick={() => acceptRequest(req.sender.id)}
                                            size="sm"
                                            className="flex-1 sm:flex-none px-8 shadow-lg shadow-brand-100"
                                            leftIcon={Check}
                                        >
                                            Accept
                                        </Button>
                                        <Button 
                                            variant="secondary"
                                            onClick={() => ignoreRequest(req.sender.id)}
                                            size="sm"
                                            className="flex-1 sm:flex-none px-8"
                                            leftIcon={X}
                                        >
                                            Ignore
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Content View Switcher */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center px-1">
                        <h3 className="text-xs font-black text-surface-400 uppercase tracking-[2px]">
                            {activeView === 'all' ? 'Network Portfolio' : activeView === 'suggestions' ? 'Opportunities Discovery' : 'Growth Candidates'}
                        </h3>
                        <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-surface-100">
                            <button className="p-2 text-surface-400 hover:bg-surface-50 hover:text-brand-600 transition-all rounded-lg"><Search size={18} /></button>
                            <button className="p-2 text-surface-400 hover:bg-surface-50 hover:text-brand-600 transition-all rounded-lg"><TrendingUp size={18} /></button>
                        </div>
                    </div>

                    {activeView === 'all' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-slide-up">
                            {connections.length > 0 ? (
                                connections.map(friend => (
                                    <Card key={friend.id} noPadding className="p-5 flex items-center gap-4 hover:shadow-premium-hover border-transparent hover:border-brand-200 transition-all group bg-white shadow-premium">
                                        <Link to={`/profile/${friend.id}`} className="shrink-0 relative overflow-visible">
                                            <div className="w-14 h-14 rounded-xl bg-surface-50 flex items-center justify-center text-surface-400 font-black text-2xl overflow-hidden group-hover:scale-110 transition-transform shadow-sm border border-white">
                                                {friend.profilePicture ? <img src={getImageUrl(friend.profilePicture)} className="w-full h-full object-cover" /> : friend.name.charAt(0)}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 bg-surface-200 w-3.5 h-3.5 rounded-full border-2 border-white" />
                                        </Link>
                                        <div className="flex-1 min-w-0">
                                            <Link to={`/profile/${friend.id}`} className="font-black text-surface-900 group-hover:text-brand-600 transition-colors leading-tight block truncate text-lg">
                                                {friend.name}
                                            </Link>
                                            <p className="text-xs text-surface-500 font-bold truncate mt-0.5">{friend.bio || 'Verified Connection'}</p>
                                        </div>
                                        <Button variant="ghost" size="sm" as={Link} to={`/profile/${friend.id}`} className="shrink-0 hover:bg-brand-50 text-brand-600">
                                            Profile
                                        </Button>
                                    </Card>
                                ))
                            ) : (
                                <Card className="col-span-2 py-24 text-center border-dashed border-2 border-surface-200 bg-surface-50/20 group hover:border-brand-300 transition-all">
                                    <div className="w-20 h-20 bg-brand-50 text-brand-200 rounded-3xl flex items-center justify-center mx-auto mb-8 transition-transform group-hover:scale-110 group-hover:rotate-6">
                                        <Users size={48} strokeWidth={1} />
                                    </div>
                                    <h3 className="text-2xl font-black text-surface-900 tracking-tight">Expand Your Horizon</h3>
                                    <p className="text-surface-500 font-medium mt-3 max-w-xs mx-auto leading-relaxed">Your professional portfolio is currently private. Start exploring high-value connections.</p>
                                    <Button onClick={() => setActiveView('suggestions')} variant="outline" className="mt-10 px-10">Ignite Discovery</Button>
                                </Card>
                            )}
                        </div>
                    )}

                    {activeView === 'suggestions' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
                            {allUsers.map(u => (
                                <Card key={u.id} noPadding className="group hover:border-brand-300 transition-all flex flex-col h-full overflow-visible shadow-premium hover:shadow-2xl hover:-translate-y-1 duration-300">
                                    <div className="h-16 bg-gradient-to-br from-brand-500 to-brand-700 rounded-t-2xl relative" />
                                    <div className="px-5 pb-6 text-center flex-1 flex flex-col items-center">
                                        <Link to={`/profile/${u.id}`} className="relative -mt-10 mb-4 block group/avatar">
                                            <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-xl flex items-center justify-center text-brand-700 text-4xl font-black overflow-hidden group-hover/avatar:scale-110 transition-transform">
                                                {u.profilePicture ? <img src={getImageUrl(u.profilePicture)} className="w-full h-full object-cover" /> : u.name.charAt(0)}
                                            </div>
                                        </Link>
                                        <h4 className="font-black text-surface-900 text-lg leading-tight group-hover:text-brand-600 transition-colors truncate w-full">{u.name}</h4>
                                        <Badge variant="secondary" size="sm" className="mt-2 uppercase tracking-tighter">Pro Prospect</Badge>
                                        <p className="text-surface-500 text-[11px] font-medium mt-4 line-clamp-2 h-8 leading-relaxed italic">
                                            {u.bio || 'Innovative professional looking to redefine industry standards.'}
                                        </p>
                                        
                                        <div className="mt-8 w-full space-y-2">
                                            {connections.find(c => c.id === u.id) ? (
                                                <Button disabled variant="secondary" className="w-full opacity-60" leftIcon={UserCheck}>In Circle</Button>
                                            ) : sentRequestIds.includes(u.id) ? (
                                                <Button disabled variant="outline" className="w-full border-surface-100 text-surface-400">Awaiting Commit</Button>
                                            ) : (
                                                <Button 
                                                    onClick={(e) => { e.preventDefault(); openConnectModal(u); }}
                                                    className="w-full shadow-lg shadow-brand-100"
                                                    leftIcon={UserPlus}
                                                >
                                                    Connect
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Premium Refactor: Invitation personalizer */}
            <Modal 
                isOpen={connectModalOpen} 
                onClose={() => setConnectModalOpen(false)}
                title={`Personalize Invite for ${selectedUser?.name}`}
                maxWidth="max-w-md"
                footer={
                    <>
                        <Button onClick={sendRequest} className="flex-1 py-4 shadow-xl shadow-brand-100" leftIcon={UserPlus}>Send Contextual Invitation</Button>
                        <Button variant="secondary" onClick={() => setConnectModalOpen(false)} className="px-8">Abort</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <p className="text-surface-500 text-xs font-bold leading-relaxed px-1">
                        Professionals are <span className="text-brand-600 font-black">12x more likely</span> to accept an invitation that contains a personal greeting. Include a brief context for your connection.
                    </p>
                    <TextArea 
                        className="min-h-[140px]"
                        placeholder="Ex: Passionate about your recent work on AI infrastructure. Would love to swap insights..."
                        value={connectMessage}
                        onChange={(e) => setConnectMessage(e.target.value)}
                        maxLength={500}
                    />
                    <div className="flex justify-end pr-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${connectMessage.length > 450 ? 'text-red-500' : 'text-surface-300'}`}>
                            {connectMessage.length} / 500 bits
                        </span>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Connections;
