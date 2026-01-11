
import React, { useState, useEffect, useRef } from 'react';
import { getFriends } from '../services/friendService';
import { getChatHistory, sendMessage } from '../services/chatService';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../hooks/useAuth';
import { useSearchParams } from 'react-router-dom';

const Chat = () => {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [searchParams] = useSearchParams();

    // State
    const [friends, setFriends] = useState([]);
    const [activeFriendId, setActiveFriendId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loadingFriends, setLoadingFriends] = useState(true);

    const messagesEndRef = useRef(null);

    // 1. Load Friends
    useEffect(() => {
        const loadFriends = async () => {
            try {
                const list = await getFriends();
                setFriends(list);

                // URL param override?
                const urlFriendId = searchParams.get('friendId');
                if (urlFriendId) {
                    setActiveFriendId(urlFriendId);
                } else if (list.length > 0) {
                    // Default to first friend
                    setActiveFriendId(list[0].friendId);
                }
            } catch (err) {
                console.error("Failed to load friends", err);
            } finally {
                setLoadingFriends(false);
            }
        };
        loadFriends();
    }, []);

    // 2. Load Conversation
    useEffect(() => {
        if (!activeFriendId) return;

        const loadMessages = async () => {
            try {
                const history = await getChatHistory(activeFriendId);
                setMessages(history);
                scrollToBottom();
            } catch (err) {
                console.error("Failed to load messages", err);
            }
        };
        loadMessages();
    }, [activeFriendId]);

    // 3. Socket Listeners
    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (msg) => {
            if (msg.senderId === activeFriendId || (msg.senderId === user.uid && msg.recipientId === activeFriendId)) {
                setMessages(prev => {
                    // dedup just in case
                    if (prev.some(m => m.id === msg.id)) return prev;
                    return [...prev, msg];
                });
                scrollToBottom();
            }
        };

        socket.on('receive_message', handleReceiveMessage);
        socket.on('message_sent', handleReceiveMessage); // Listen to my own sent validation too

        return () => {
            socket.off('receive_message', handleReceiveMessage);
            socket.off('message_sent', handleReceiveMessage);
        };
    }, [socket, activeFriendId, user]);

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || !activeFriendId) return;

        const text = inputText;
        setInputText('');

        try {
            // Optimistic update
            const tempMsg = {
                id: 'temp_' + Date.now(),
                senderId: user.uid,
                recipientId: activeFriendId,
                text: text,
                createdAt: new Date().toISOString()
            };
            setMessages(prev => [...prev, tempMsg]);
            scrollToBottom();

            await sendMessage(activeFriendId, text);
            // Real message comes via socket or we could replace tempMsg
        } catch (err) {
            console.error("Failed to send", err);
            alert("Message failed to send");
        }
    };

    const activeFriend = friends.find(f => f.friendId === activeFriendId);

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Sidebar: Friends List */}
            <div className="w-1/3 border-r border-gray-200 bg-white flex flex-col">
                <div className="p-4 border-b flex items-center justify-between text-gray-700 bg-gray-50">
                    <span className="font-bold text-lg">Messages</span>
                    <a href="/dashboard" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        &larr; Back
                    </a>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loadingFriends ? <div className="p-4">Loading...</div> : null}
                    {friends.map(f => (
                        <div
                            key={f.friendId}
                            onClick={() => setActiveFriendId(f.friendId)}
                            className={`p-4 cursor-pointer hover:bg-gray-50 border-b flex items-center gap-3 transition-colors ${activeFriendId === f.friendId ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                                }`}
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                {f.friendEmail[0]?.toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-semibold truncate text-sm">{f.friendEmail}</p>
                                <p className="text-xs text-gray-500">Tap to chat</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main: Chat View */}
            <div className="w-2/3 flex flex-col bg-white">
                {activeFriend ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b flex items-center gap-3 bg-white shadow-sm z-10">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                                {activeFriend.friendEmail[0]?.toUpperCase()}
                            </div>
                            <span className="font-bold text-gray-800">{activeFriend.friendEmail}</span>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-100 space-y-3">
                            {messages.map((msg) => {
                                const isMe = msg.senderId === user.uid;
                                return (
                                    <div key={msg.id || msg.createdAt} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] p-3 rounded-lg text-sm shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-4 bg-white border-t">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 font-medium transition-colors"
                                >
                                    Send
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl">💬</span>
                        </div>
                        <p>Select a friend to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
