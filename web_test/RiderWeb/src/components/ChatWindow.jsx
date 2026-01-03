
import React, { useState, useEffect, useRef } from 'react';
import { getChatHistory, sendMessage } from '../services/chatService';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthProvider'; // Assuming AuthContext provides user info

const ChatWindow = ({ friend, onClose }) => {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef(null);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const history = await getChatHistory(friend.friendId);
                setMessages(history);
                scrollToBottom();
            } catch (err) {
                console.error("Failed to load chat history:", err);
            }
        };
        loadHistory();
    }, [friend]);

    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (msg) => {
            // Only append if it belongs to this conversation
            // Check senderId (friend) or recipientId (me)
            if (msg.senderId === friend.friendId || msg.recipientId === friend.friendId) {
                setMessages((prev) => [...prev, msg]);
                scrollToBottom();
            }
        };

        const handleMessageSent = (msg) => {
            // Confirm my own message sent (if not purely relying on local optimistic update)
            // Typically we optimistically update or wait for API response. 
            // API response adds it, but let's listen to socket for consistency across devices.
            if (msg.recipientId === friend.friendId) {
                // Optimization: Avoid duplicate if API already added it?
                // Let's rely on API response for local, and socket for multi-device.
                // For now, let's just ignore this to avoid duplicates if we use API response.
            }
        };

        socket.on('receive_message', handleReceiveMessage);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
        };
    }, [socket, friend]);

    // Scroll on message update
    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const text = inputText;
        setInputText(''); // Clear immediately (Optimistic)

        try {
            const newMsg = await sendMessage(friend.friendId, text);
            setMessages((prev) => [...prev, newMsg]);
        } catch (err) {
            console.error("Failed to send message:", err);
            // Restore text if failed?
        }
    };

    return (
        <div className="fixed bottom-0 right-4 w-80 h-96 bg-white shadow-xl rounded-t-lg flex flex-col border border-gray-300 z-50">
            {/* Header */}
            <div className="bg-blue-600 text-white p-3 rounded-t-lg flex justify-between items-center">
                <span className="font-bold">{friend.friendEmail}</span>
                <button onClick={onClose} className="text-sm hover:text-gray-200">X</button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 bg-gray-50 flex flex-col space-y-2">
                {messages.map((msg) => {
                    const isMe = msg.senderId === user.uid;
                    return (
                        <div key={msg.id || Math.random()} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] p-2 rounded-lg text-sm ${isMe ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 border-t border-gray-200 bg-white">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 border rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                    />
                    <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Send</button>
                </div>
            </form>
        </div>
    );
};

export default ChatWindow;
