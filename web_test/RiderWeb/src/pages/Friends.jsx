
import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { getFriends, getPendingRequests, sendFriendRequest, respondToRequest } from '../services/friendService';
import ChatWindow from '../components/ChatWindow';

const Friends = () => {
    const [activeTab, setActiveTab] = useState('friends'); // 'friends', 'requests', 'add'
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [addEmail, setAddEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeChatFriend, setActiveChatFriend] = useState(null);

    // Initial Load
    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            if (activeTab === 'friends') {
                const data = await getFriends();
                setFriends(data);
            } else if (activeTab === 'requests') {
                const data = await getPendingRequests();
                setRequests(data);
            }
        } catch (err) {
            console.error("Failed to load data:", err);
            setError("Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddFriend = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await sendFriendRequest(addEmail);
            setAddEmail('');
            alert("Friend request sent!");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to send request.");
        }
    };

    const handleRespond = async (reqId, action) => {
        try {
            await respondToRequest(reqId, action);
            // Remove from list
            setRequests(prev => prev.filter(r => r.id !== reqId));
        } catch (err) {
            alert("Action failed");
        }
    };

    return (
        <MainLayout title="Friends & Chat">
            <div className="max-w-4xl mx-auto p-4">

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        onClick={() => setActiveTab('friends')}
                        className={`py-2 px-4 font-medium ${activeTab === 'friends' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        My Friends
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`py-2 px-4 font-medium ${activeTab === 'requests' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Pending Requests
                    </button>
                    <button
                        onClick={() => setActiveTab('add')}
                        className={`py-2 px-4 font-medium ${activeTab === 'add' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Add Friend
                    </button>
                </div>

                {/* Content */}
                {loading && <div className="text-center py-4">Loading...</div>}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* Friend List */}
                {activeTab === 'friends' && !loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {friends.length === 0 ? <p className="text-gray-500">No friends yet.</p> : null}
                        {friends.map(f => (
                            <div key={f.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                                <div>
                                    <p className="font-bold">{f.friendEmail}</p>
                                    <p className="text-xs text-gray-500">Since {new Date(f.createdAt).toLocaleDateString()}</p>
                                </div>
                                <button
                                    onClick={() => setActiveChatFriend(f)}
                                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 text-sm"
                                >
                                    Chat
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Requests List */}
                {activeTab === 'requests' && !loading && (
                    <div className="space-y-4">
                        {requests.length === 0 ? <p className="text-gray-500">No pending requests.</p> : null}
                        {requests.map(r => (
                            <div key={r.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                                <div>
                                    <p className="font-bold">{r.fromEmail}</p>
                                    <p className="text-xs text-gray-500">Sent usually just now</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleRespond(r.id, 'ACCEPT')}
                                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => handleRespond(r.id, 'REJECT')}
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Friend */}
                {activeTab === 'add' && (
                    <div className="bg-white p-6 rounded shadow max-w-md mx-auto">
                        <h3 className="text-lg font-bold mb-4">Add a New Friend</h3>
                        <form onSubmit={handleAddFriend}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={addEmail}
                                    onChange={(e) => setAddEmail(e.target.value)}
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                                Send Request
                            </button>
                        </form>
                    </div>
                )}

                {/* Chat Window Overlay */}
                {activeChatFriend && (
                    <ChatWindow
                        friend={activeChatFriend}
                        onClose={() => setActiveChatFriend(null)}
                    />
                )}
            </div>
        </MainLayout>
    );
};

export default Friends;
