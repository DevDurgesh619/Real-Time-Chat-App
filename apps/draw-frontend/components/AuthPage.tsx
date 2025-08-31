"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = "http://localhost:3001"; 

export default function AuthPage({ isSignin }: {
    isSignin: boolean
}) {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState(''); 
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

  
    const signin = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: email, password }), // Sign in likely uses email
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to sign in.');
            }

            console.log('Sign in successful:', data);
            localStorage.setItem('token', data.token);
            router.push("/dashboard");
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // 3. Update the sign-up function to send the correct data.
    const signup = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: email, password, name }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to sign up.');
            }

            console.log('Sign up successful:', data);
            router.push("/signin")

        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // The form submission handler.
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isSignin) {
            signin();
        } else {
            signup();
        }
    };

    return (
        <div className="w-screen h-screen flex justify-center items-center bg-slate-100">
            <div className="p-8 m-4 bg-white rounded-lg border border-slate-200 shadow-lg w-full max-w-sm">
                <h2 className="text-2xl font-bold text-center text-slate-800 mb-1">
                    {isSignin ? "Welcome Back!" : "Create an Account"}
                </h2>
                <p className="text-center text-slate-500 mb-6">
                    {isSignin ? "Sign in to continue." : "Get started for free."}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Conditionally render the Name input only for sign-up */}
                    {!isSignin && (
                        <div>
                            <input
                                className="w-full p-3 border border-slate-300 rounded-md placeholder:text-slate-400 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition"
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    <div>
                        <input
                            className="w-full p-3 border border-slate-300 rounded-md placeholder:text-slate-400 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <input
                            className="w-full p-3 border border-slate-300 rounded-md placeholder:text-slate-400 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 text-center">{error}</p>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full bg-slate-900 text-white font-semibold rounded-md p-3 hover:bg-slate-800 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            {isLoading ? "Processing..." : (isSignin ? "Sign In" : "Sign Up")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )};