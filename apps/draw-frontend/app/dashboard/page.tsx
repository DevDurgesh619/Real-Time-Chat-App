"use client";
import { BACKEND_URL } from '@/config';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react';


const Input = React.forwardRef<HTMLInputElement, { placeholder: string, onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void }>(({ placeholder, onKeyPress }, ref) => (
    <input
        ref={ref}
        placeholder={placeholder}
        onKeyPress={onKeyPress}
        className="w-full h-12 px-4 bg-slate-100 border border-slate-300 rounded-lg text-slate-800 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
    />
));
Input.displayName = 'Input';
//@ts-ignore
const Button = ({ onClick, children, loading }) => (
    <button
        onClick={onClick}
        disabled={loading}
        className="w-full inline-flex items-center justify-center h-12 px-6 font-semibold rounded-lg transition-colors bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-slate-400"
    >
        {loading ? "Processing..." : children}
    </button>
);
Button.displayName = 'Button';

// --- Main Dashboard Page ---
export default function DashboardPage() {
    const router = useRouter();
    const createRoomRef = useRef<HTMLInputElement>(null);
    const joinRoomRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleApiRequest = async (url: string, body: object) => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/signin");
                return null;
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.msg || 'An error occurred.');
            }
            return data;
        } catch (err: any) {
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateRoom = async () => {
        const roomName = createRoomRef.current?.value.trim();
        if (!roomName) return;

        const data = await handleApiRequest(`${BACKEND_URL}/room`, { name: roomName });
        if (data && data.roomId) {
            router.push(`/chat/${data.roomId}`);
        }
    };

    const handleJoinRoom = async () => {
        const roomName = joinRoomRef.current?.value.trim();
        if (!roomName) return;
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${BACKEND_URL}/room/${roomName}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || 'Failed to find room.');
            if (data && data.roomId) {
                router.push(`/chat/${data.roomId}`);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center bg-slate-100 min-h-screen p-4">
            <div className="w-full max-w-4xl">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-slate-800">Welcome to the Chat</h1>
                    <p className="text-slate-500 mt-2 text-lg">Create a new room or join an existing one.</p>
                </div>

                {error && <p className="text-center text-red-500 mb-6">{error}</p>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Create Room Card */}
                    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-lg">
                        <h2 className="text-3xl font-bold text-slate-800 mb-6">Start a New Room</h2>
                        <div className="space-y-4">
                            <Input ref={createRoomRef} placeholder="Enter a new room name" onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()} />
                            <Button onClick={handleCreateRoom} loading={isLoading}>Create Room</Button>
                        </div>
                    </div>

                    {/* Join Room Card */}
                    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-lg">
                        <h2 className="text-3xl font-bold text-slate-800 mb-6">Join an Existing Room</h2>
                        <div className="space-y-4">
                            <Input ref={joinRoomRef} placeholder="Enter room name to join" onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()} />
                            <Button onClick={handleJoinRoom} loading={isLoading}>Join Room</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

