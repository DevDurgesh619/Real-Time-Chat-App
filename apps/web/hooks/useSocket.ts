import { useEffect, useState } from "react";
import { WS_URL } from "../app/config";

export function useSocket() {
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket>();

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmZmNhYzNlNC1jNzQzLTQ0NzEtYjRmZC03YmFjMTVjNzllNDciLCJpYXQiOjE3NTYzNzMyMjF9.6j8crDjH3pMLDMkkRDvQdAwySwfrn8ClPENdo_KjWm0`);
        ws.onopen = () => {
            setLoading(false);
            setSocket(ws);
        }
    }, []);

    return {
        socket,
        loading
    }

}