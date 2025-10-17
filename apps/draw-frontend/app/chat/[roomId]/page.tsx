"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from "next/navigation";
import { SendICON } from '@/Icons/sendICon';

const HTTP_BACKEND_URL = "http://localhost:3001";
const WS_BACKEND_URL = "ws://localhost:8080";

//@ts-ignore
const ChatBubble = ({ message, isCurrentUser }) => {
    const alignment = isCurrentUser ? 'justify-end' : 'justify-start';
    const bubbleColor = isCurrentUser ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800';
    const senderName = isCurrentUser ? 'You' : message.user.name || 'Anonymous';

    return (
        <div className={`flex ${alignment} mb-4`}>
            <div className="flex flex-col max-w-xs md:max-w-md">
                <span className={`text-xs text-gray-500 ml-2 mb-1 ${isCurrentUser ? 'self-end' : 'self-start'}`}>
                    {senderName}
                </span>
                <div className={`py-3 px-4 rounded-xl shadow-md ${bubbleColor}`}>
                    <p className="break-words">{message.text}</p>
                </div>
            </div>
        </div>
    );
};

// MOCK DATA FOR PREVIEW
const MOCK_MESSAGES = [
    {
        text: "Hey! How's the project coming along?",
        user: { id: 'user-2', name: 'Alice' },
    },
    {
        text: "It's going great! Just pushed the latest updates. You should check them out.",
        user: { id: 'user-1', name: 'You' }, 
    },
    {
        text: "Awesome, will do now!",
        user: { id: 'user-2', name: 'Alice' },
    }
];


//@ts-ignore
export default function ChatPage() {
    const params = useParams();
    const roomId = params?.roomId as string;
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const isPreview = !roomId;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (isPreview) {
            setMessages(MOCK_MESSAGES);
            setUserId('user-1'); 
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) { return; }

        try {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            setUserId(decodedToken.userId);
        } catch (e) { console.error("Failed to decode token", e); return; }

        const fetchChatHistory = async () => {
             try {
                const response = await fetch(`${HTTP_BACKEND_URL}/chat/${roomId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error("Failed to fetch history");
                const data = await response.json();
                const formattedMessages = data.messages.map((msg: any) => ({
                    text: msg.message,
                    user: { id: msg.user.id, name: msg.user.name || msg.user.email },
                    timestamp: msg.createdAt,
                }));
                setMessages(formattedMessages);
            } catch (error) { console.error(error); }
        };
        fetchChatHistory();

        const socket = new WebSocket(`${WS_BACKEND_URL}?token=${token}`);
        setWs(socket);

        socket.onopen = () => {
            socket.send(JSON.stringify({ type: "join_room", roomId: String(roomId) }));
        };
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "chat") {
                setMessages(prev => [...prev, data.message]);
            }
        };
        socket.onclose = () => console.log("WebSocket disconnected");

        return () => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: "leave_room", roomId: String(roomId) }));
            }
            socket.close();
        };
    }, [roomId, isPreview]);

    const handleSendMessage = () => {
    if (ws && ws.readyState === WebSocket.OPEN && newMessage.trim()) {
        ws.send(JSON.stringify({
            type: "chat",
            roomId: String(roomId),
            message: newMessage,
        }));
        setNewMessage("");
    } else {
        console.error("Cannot send message: WebSocket is not open or doesn't exist.");
    }
};

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-[rgba(10,15,25,0.7)] border-b border-cyan-500/30 shadow-[0_0_25px_rgba(0,255,255,0.1)] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 shadow-[0_0_10px_rgba(0,255,255,0.3)]">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.6}
                    stroke="currentColor"
                    className="w-6 h-6"
                >
                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.5 8.25h9m-9 3.75h6m2.25 6.75l3.75-3.75V4.5A2.25 2.25 0 0018 2.25H6A2.25 2.25 0 003.75 4.5v10.5A2.25 2.25 0 006 17.25h9.75z"
                    />
                </svg>
                </div>
                <h1 className="text-xl md:text-2xl font-bold tracking-wide bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-500 text-transparent bg-clip-text">
                Chat Room-{isPreview ? "123" : roomId}
                </h1>
            </div>

            {/* Right side — Online users or status */}
            <div className="sm:flex items-center gap-2 text-sm text-cyan-300 font-mono">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <span>Online</span>
            </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                    {messages.map((msg, index) => (
                        <ChatBubble key={index} message={msg} isCurrentUser={msg.user.id === userId} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </main>
            <footer className="bg-white border-t p-4">
                <div className="flex items-center">
                    <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Type your message..." className="flex-1 p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    <button onClick={handleSendMessage} className="ml-4 bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:bg-gray-400" disabled={!newMessage.trim()}>{<SendICON/>}</button>
                </div>
            </footer>
        </div>
    );
}

