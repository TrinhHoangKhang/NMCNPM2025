
import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { sendCommand } from '../services/aiService';

const Chatbot = () => {
    const [history, setHistory] = useState([
        { sender: 'AI', text: 'Hello! I am your AI Assistant. How can I help you today?', timestamp: new Date() }
    ]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const userMsg = { sender: 'User', text: inputText, timestamp: new Date() };
        setHistory(prev => [...prev, userMsg]);
        setInputText('');
        setLoading(true);

        try {
            const response = await sendCommand(userMsg.text);
            // Response format expected: { commands: [...] }
            // We'll format the commands as text for now
            let aiText = "I processed your request.";
            if (response.commands && response.commands.length > 0) {
                aiText = "I have generated the following actions:\n" +
                    response.commands.map(c => `- ${c.type}: ${JSON.stringify(c.params)}`).join('\n');
            } else {
                aiText = "I'm not sure what to do with that.";
            }

            const aiMsg = { sender: 'AI', text: aiText, timestamp: new Date() };
            setHistory(prev => [...prev, aiMsg]);
        } catch (err) {
            const errorMsg = { sender: 'AI', text: "Sorry, I encountered an error processing your request.", timestamp: new Date() };
            setHistory(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout title="AI Assistant">
            <div className="max-w-3xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white rounded-lg shadow-md border m-4">

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {history.map((msg, idx) => {
                        const isAI = msg.sender === 'AI';
                        return (
                            <div key={idx} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[80%] p-3 rounded-lg whitespace-pre-wrap ${isAI ? 'bg-gray-100 text-gray-800' : 'bg-blue-600 text-white'
                                    }`}>
                                    <p className="text-sm font-bold mb-1">{msg.sender}</p>
                                    <p>{msg.text}</p>
                                    <p className="text-xs opacity-70 mt-1 text-right">
                                        {msg.timestamp.toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 p-3 rounded-lg">
                                <span className="animate-pulse">Thinking...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Ask me to find a ride, check weather..."
                            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-2 rounded-lg font-medium text-white transition-colors ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
};

export default Chatbot;
