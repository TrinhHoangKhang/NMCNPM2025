import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Xin chào! Tôi là trợ lý ảo RideGo. Bạn cần giúp gì về lịch sử chuyến đi không?", sender: 'bot' }
    ]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);
    const { user } = useAuth();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        const userMessage = { id: Date.now(), text: inputText, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputText("");
        setIsLoading(true);

        try {
            // Determine if it's a command or query based on simple heuristics or just use query for now
            // The plan specified linking to /api/ai/query for profile-related questions
            const response = await axios.post('http://localhost:5000/api/ai/query', {
                question: userMessage.text
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}` // Assuming token is stored here
                }
            });

            const botResponseText = response.data?.answer || "Xin lỗi, tôi không thể trả lời lúc này.";
            
            const botMessage = { id: Date.now() + 1, text: botResponseText, sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            console.error("Chat Error:", error);
            const errorMessage = { id: Date.now() + 1, text: "Có lỗi xảy ra khi kết nối với server.", sender: 'bot' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
             {/* Chat Window */}
            {isOpen && (
                <Card className="w-80 h-96 shadow-xl mb-4 flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <CardHeader className="p-4 border-b bg-primary text-primary-foreground rounded-t-lg flex flex-row justify-between items-center sticky top-0">
                        <div className="flex items-center space-x-2">
                             <Avatar className="h-8 w-8 bg-white text-primary">
                                <AvatarFallback>AI</AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-lg">RideGo AI</CardTitle>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-6 w-6 text-primary-foreground hover:bg-primary/80">
                            <X size={18} />
                        </Button>
                    </CardHeader>
                    
                    <CardContent className="flex-1 p-0 overflow-hidden relative">
                         <div className="h-full overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-lg p-3 text-sm ${
                                        msg.sender === 'user' 
                                            ? 'bg-primary text-primary-foreground rounded-tr-none' 
                                            : 'bg-muted text-foreground rounded-tl-none'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-muted text-foreground rounded-lg p-3 rounded-tl-none flex items-center space-x-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span className="text-xs">Đang suy nghĩ...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>

                    <CardFooter className="p-3 border-t bg-background">
                        <div className="flex w-full space-x-2">
                            <Input 
                                placeholder="Hỏi về chuyến đi..." 
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="flex-1 focus-visible:ring-1"
                            />
                            <Button size="icon" onClick={handleSendMessage} disabled={isLoading}>
                                <Send size={18} />
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            )}

            {/* Toggle Button */}
            {!isOpen && (
                <Button 
                    onClick={() => setIsOpen(true)}
                    className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-transform hover:scale-105"
                >
                    <MessageCircle size={28} />
                </Button>
            )}
        </div>
    );
};

export default ChatBot;
