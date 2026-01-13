
import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useNavigate } from 'react-router-dom';
import { sendCommand, sendQuery } from '../services/aiService';

const Chatbot = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([
        { sender: 'AI', text: 'Xin chào! Tôi là Trợ lý AI của RideGo. Tôi có thể giúp bạn đặt xe, tra cứu lịch sử chuyển đi hoặc trả lời các thắc mắc khác.', timestamp: new Date() }
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
            // Heuristic to decide between command (action) and query (info)
            const queryKeywords = ['lịch sử', 'bao nhiêu', 'tháng này', 'hôm qua', 'tuần trước', 'đã đi', 'tổng tiền', 'thống kê'];
            const isQuery = queryKeywords.some(kw => inputText.toLowerCase().includes(kw));

            let response;
            if (isQuery) {
                response = await sendQuery(userMsg.text);
            } else {
                response = await sendCommand(userMsg.text);
            }

            // Server response format: { success, response_type, message, data? }
            let aiText = response.message || "Tôi đã xử lý yêu cầu của bạn.";

            // If it's an action with steps, we can show them nicely
            if (response.data && response.data.steps && response.data.steps.length > 0) {
                const stepDetails = response.data.steps
                    .map(s => `- ${s.cmd}: ${s.value || ''} ${s.lat ? `(${s.lat}, ${s.lng})` : ''}`)
                    .join('\n');
                aiText += "\n\nCác hành động đã thực hiện:\n" + stepDetails;

                // SPECIAL LOGIC: Redirect to Map if intent is BOOK_TRIP
                if (response.data.intent === 'BOOK_TRIP') {
                    const destinationStep = response.data.steps.find(s => s.cmd === 'SET_DESTINATION');
                    const vehicleStep = response.data.steps.find(s => s.cmd === 'SET_VEHICLE');
                    const paymentStep = response.data.steps.find(s => s.cmd === 'SET_PAYMENT_METHOD');

                    // Mapping server values back to UI labels if needed
                    const vehicleMap = { 'BIKE': 'Motorbike', 'MOTORBIKE': 'Motorbike', '4_SEATS': 'Car 4-Seat', '7_SEATS': 'Car 7-Seat' };

                    const tripInfo = {
                        dropoffLocation: destinationStep ? {
                            address: destinationStep.value,
                            lat: destinationStep.lat,
                            lng: destinationStep.lng
                        } : null,
                        vehicleType: vehicleMap[vehicleStep?.value] || "Motorbike",
                        paymentMethod: paymentStep?.value || "CASH"
                    };

                    setTimeout(() => {
                        navigate('/map', { state: { tripInfo } });
                    }, 1500); // Small delay so user can read the AI response
                }
            }

            const aiMsg = { sender: 'AI', text: aiText, timestamp: new Date() };
            setHistory(prev => [...prev, aiMsg]);
        } catch (err) {

            const errorMsg = {
                sender: 'AI',
                text: err.message || "Xin lỗi, tôi gặp lỗi khi xử lý yêu cầu của bạn.",
                timestamp: new Date()
            };
            setHistory(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };


    return (
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
                        placeholder="Hỏi tôi về chuyến đi, xem thời tiết hoặc lịch sử..."
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
    );
};

export default Chatbot;
